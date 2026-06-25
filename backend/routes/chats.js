const express = require("express");
const router = express.Router();
const {
  listChats,
  createChat,
  getChatHistory,
  sendChatMessage,
  deleteChat,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.use(protect); // protect all chats routes

router.get("/", listChats);
router.post("/", createChat);
router.get("/:id", getChatHistory);
router.post("/:id/messages", sendChatMessage);
router.delete("/:id", deleteChat);

module.exports = router;
