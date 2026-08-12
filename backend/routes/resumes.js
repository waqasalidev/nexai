const express = require("express");
const router = express.Router();
const {
  listResumes,
  generateResume,
  createResume,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");
const { protect } = require("../middleware/auth");

// Public Diagnostic Routes for Production Testing
router.get("/health", (req, res) => {
  const { isDBConnected } = require("../config/db");
  const dbStatus = isDBConnected();
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  return res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? "ok" : "degraded",
    backend: "running",
    database: dbStatus ? "connected" : "disconnected",
    dbConnected: dbStatus,
    services: { gemini: geminiConfigured ? "configured" : "missing_key" },
  });
});

router.get("/ai-test", async (req, res) => {
  const configured = !!process.env.GEMINI_API_KEY;
  if (!configured) {
    return res.status(500).json({
      success: false,
      provider: "gemini",
      configured: false,
      model: "gemini-2.5-flash",
      status: "failed",
      providerStatus: 500,
      errorCode: "MISSING_API_KEY",
      message: "GEMINI_API_KEY is not configured in environment variables.",
    });
  }
  try {
    const { generateText } = require("../services/gemini");
    const testOutput = await generateText("Connection test in 2 words.");
    return res.json({
      success: true,
      provider: "gemini",
      configured: true,
      model: "gemini-2.5-flash",
      status: "working",
      sample: testOutput.trim().slice(0, 30),
    });
  } catch (err) {
    const providerStatus = err.statusCode || err.status || 500;
    const errorCode = err.code || "AI_TEST_FAILED";
    return res.status(providerStatus).json({
      success: false,
      provider: "gemini",
      configured: true,
      model: "gemini-2.5-flash",
      status: "failed",
      providerStatus,
      errorCode,
      message: err.message,
    });
  }
});

// Protected Resume Endpoints
router.get("/", protect, listResumes);
router.post("/", protect, createResume);
router.post("/generate", protect, generateResume);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect, deleteResume);

module.exports = router;
