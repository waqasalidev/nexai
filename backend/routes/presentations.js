const express = require("express");
const router = express.Router();
const {
  listPresentations,
  generatePresentation,
  deletePresentation,
} = require("../controllers/presentationController");
const { protect } = require("../middleware/auth");

router.use(protect); // protect all presentation routes

router.get("/", listPresentations);
router.post("/generate", generatePresentation);
router.delete("/:id", deletePresentation);

module.exports = router;
