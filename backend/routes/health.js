const express = require("express");
const router = express.Router();
const { isDBConnected } = require("../config/db");

// GET /api/health — System Health Endpoint
router.get("/", (req, res) => {
  const dbStatus = isDBConnected();
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const status = dbStatus ? "ok" : "degraded";

  return res.status(dbStatus ? 200 : 503).json({
    status,
    backend: "running",
    database: dbStatus ? "connected" : "disconnected",
    dbConnected: dbStatus,
    services: {
      gemini: geminiConfigured ? "configured" : "missing_key",
    },
  });
});

module.exports = router;
