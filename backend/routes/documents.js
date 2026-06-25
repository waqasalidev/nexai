const express = require("express");
const router = express.Router();
const {
  upload,
  uploadPDF,
  listDocuments,
  getDocumentDetails,
  askQuestion,
  deleteDocument,
} = require("../controllers/pdfController");
const { protect } = require("../middleware/auth");

router.use(protect); // protect all documents routes

router.post("/upload", upload.single("pdf"), uploadPDF);
router.get("/", listDocuments);
router.get("/:id", getDocumentDetails);
router.post("/:id/ask", askQuestion);
router.delete("/:id", deleteDocument);

module.exports = router;
