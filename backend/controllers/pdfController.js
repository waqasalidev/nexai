const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");
const AIUsage = require("../models/AIUsage");
const { analyzePDF, askDocumentQuestion } = require("../services/gemini");

// Configure Multer for Uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// @desc    Upload and Analyze PDF
// @route   POST /api/documents/upload
// @access  Private
async function uploadPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const { originalname, filename, size, path: filePath, mimetype } = req.file;

    // Read PDF file as buffer for Gemini API
    const fileBuffer = fs.readFileSync(filePath);

    // Call Gemini PDF analyzer
    const { summary, keyPoints } = await analyzePDF(fileBuffer, mimetype);

    // Create document record in DB
    const document = await Document.create({
      user: req.user.id,
      fileName: originalname,
      filePath: filename, // save the unique stored file name
      fileSize: size,
      summary,
      keyPoints,
    });

    // Log AI usage
    await AIUsage.create({
      user: req.user.id,
      tool: "pdf",
      title: originalname,
      prompt: `Uploaded & Analyzed PDF document: ${originalname}`,
      output: `Summary: ${summary.slice(0, 100)}...\nKey Points: ${keyPoints.slice(0, 100)}...`,
    });

    res.status(201).json({ document });
  } catch (error) {
    // Delete file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("PDF upload error:", error);
    
    // If it's an AI error, pass that through, else use the generic PDF error
    const msg = error.message.includes("AI service temporarily unavailable") 
      ? error.message 
      : "PDF upload failed. Please upload a valid file.";
      
    res.status(500).json({ message: msg, error: error.message });
  }
}

// @desc    List all analyzed documents
// @route   GET /api/documents
// @access  Private
async function listDocuments(req, res) {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: "Failed to list documents", error: error.message });
  }
}

// @desc    Get document details & history
// @route   GET /api/documents/:id
// @access  Private
async function getDocumentDetails(req, res) {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ message: "Document record not found" });
    }
    res.status(200).json({ document });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch document details", error: error.message });
  }
}

// @desc    Ask a question about a PDF
// @route   POST /api/documents/:id/ask
// @access  Private
async function askQuestion(req, res) {
  const { question } = req.body;
  try {
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ message: "Document record not found" });
    }

    // Get PDF file path
    const filePath = path.join(__dirname, "../uploads", document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Physical PDF file not found on the server" });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = "application/pdf";

    // Call Gemini service passing chat context history
    const answer = await askDocumentQuestion(
      fileBuffer,
      mimeType,
      question,
      document.analysisHistory
    );

    // Save Q&A to document history
    document.analysisHistory.push({ question, answer });
    await document.save();

    // Log usage
    await AIUsage.create({
      user: req.user.id,
      tool: "pdf",
      title: document.fileName,
      prompt: question,
      output: answer,
    });

    res.status(200).json({ answer });
  } catch (error) {
    console.error("PDF Q&A error:", error);
    res.status(500).json({ message: "Failed to answer document question", error: error.message });
  }
}

// @desc    Delete document & local file
// @route   DELETE /api/documents/:id
// @access  Private
async function deleteDocument(req, res) {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ message: "Document record not found" });
    }

    // Unlink local file from uploads
    const filePath = path.join(__dirname, "../uploads", document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from DB
    await Document.findByIdAndDelete(document._id);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete document", error: error.message });
  }
}

module.exports = {
  upload,
  uploadPDF,
  listDocuments,
  getDocumentDetails,
  askQuestion,
  deleteDocument,
};
