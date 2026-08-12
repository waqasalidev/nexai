const Resume = require("../models/Resume");
const AIUsage = require("../models/AIUsage");
const { generateResumeDetails } = require("../services/gemini");

// @desc    List all user resumes
// @route   GET /api/resumes
// @access  Private
async function listResumes(req, res) {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: "Failed to list resumes", error: error.message });
  }
}

// @desc    Generate a resume using AI
// @route   POST /api/resumes/generate
// @access  Private
async function generateResume(req, res) {
  const startTime = Date.now();
  const { prompt } = req.body;
  try {
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a resume generation description",
        error: { code: "INVALID_PROMPT", message: "Please provide a valid resume prompt", status: 400 },
      });
    }

    // Call Gemini JSON generator
    const resumeDetails = await generateResumeDetails(prompt);

    // Save to DB safely
    let resume = null;
    try {
      resume = await Resume.create({
        user: req.user.id,
        title: `Resume - ${prompt.slice(0, 30)}`,
        content: resumeDetails,
      });
    } catch (dbErr) {
      console.error("Failed to persist Resume document to MongoDB:", dbErr.message);
      // Fallback resume object if DB save fails
      resume = {
        _id: `temp_${Date.now()}`,
        user: req.user.id,
        title: `Resume - ${prompt.slice(0, 30)}`,
        content: resumeDetails,
        createdAt: new Date(),
      };
    }

    // Log AI Usage
    try {
      await AIUsage.create({
        user: req.user.id,
        tool: "resume",
        title: resume.title,
        prompt,
        output: JSON.stringify(resumeDetails),
      });
    } catch (dbErr) {
      console.error("Failed to log resume AIUsage:", dbErr.message);
    }

    return res.status(201).json({ success: true, resume });
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || "RESUME_GENERATION_FAILED";
    const errorMessage = error.message || "Failed to generate resume";

    console.error(`\n--- RESUME GENERATION ERROR REPORT ---`);
    console.error(`ENDPOINT: POST /api/resumes/generate`);
    console.error(`HTTP STATUS: ${statusCode}`);
    console.error(`ERROR CODE: ${errorCode}`);
    console.error(`ERROR MESSAGE: ${errorMessage}`);
    console.error(`EXECUTION DURATION: ${duration}ms\n`);

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: {
        code: errorCode,
        message: errorMessage,
        status: statusCode,
      },
    });
  }
}

// @desc    Create/Save manual resume
// @route   POST /api/resumes
// @access  Private
async function createResume(req, res) {
  const { title, content } = req.body;
  try {
    const resume = await Resume.create({
      user: req.user.id,
      title: title || "My Manual Resume",
      content,
    });
    res.status(201).json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to save resume", error: error.message });
  }
}

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
async function updateResume(req, res) {
  const { title, content } = req.body;
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.title = title || resume.title;
    resume.content = content || resume.content;
    await resume.save();

    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to update resume", error: error.message });
  }
}

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
async function deleteResume(req, res) {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resume", error: error.message });
  }
}

module.exports = {
  listResumes,
  generateResume,
  createResume,
  updateResume,
  deleteResume,
};
