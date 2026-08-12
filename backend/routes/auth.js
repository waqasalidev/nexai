const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const { isDBConnected } = require("../config/db");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Diagnostic Health Endpoint
router.get("/health", (req, res) => {
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

// Diagnostic AI Test Endpoint
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

module.exports = router;
