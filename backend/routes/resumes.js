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

router.use(protect); // protect all resume routes

router.get("/", listResumes);
router.post("/", createResume);
router.post("/generate", generateResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

module.exports = router;
