const express = require("express");
const router = express.Router();
const { getWorkspaceHistory, runTool } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.use(protect); // protect all history routes

router.get("/", getWorkspaceHistory);
router.post("/run-tool", runTool);

module.exports = router;
