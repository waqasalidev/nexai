const express = require("express");
const router = express.Router();

// GET /api/ai/test — Production AI Provider Diagnostic Endpoint
router.get("/test", async (req, res) => {
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
