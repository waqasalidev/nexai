const Chat = require("../models/Chat");
const ChatHistory = require("../models/ChatHistory");
const AIUsage = require("../models/AIUsage");
const { streamChat } = require("../services/gemini");

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
async function listChats(req, res) {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Failed to list chats", error: error.message });
  }
}

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
async function createChat(req, res) {
  const { title } = req.body;
  try {
    const chat = await Chat.create({
      title: title || "New Conversation",
      user: req.user.id,
    });
    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error: error.message });
  }
}

// @desc    Get chat and history
// @route   GET /api/chats/:id
// @access  Private
async function getChatHistory(req, res) {
  const chatId = req.params.id;
  try {
    const chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await ChatHistory.find({ chat: chatId }).sort({ createdAt: 1 });
    res.status(200).json({ chat, messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to load chat history", error: error.message });
  }
}

// @desc    Send message and stream response
// @route   POST /api/chats/:id/messages
// @access  Private
async function sendChatMessage(req, res) {
  const chatId = req.params.id;
  const { message } = req.body;

  try {
    const chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // 1. Save User Message
    await ChatHistory.create({
      chat: chatId,
      role: "user",
      content: message,
    });

    // 2. Fetch history of conversation for context
    const pastMessages = await ChatHistory.find({ chat: chatId }).sort({ createdAt: 1 });
    
    // Format for Gemini API
    const contents = pastMessages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // 3. Stream text from Gemini API using model fallback service
    const systemInstruction = "You are NexAI, a premium, knowledgeable, helpful AI assistant. Use markdown for formatting and code blocks for code.";
    
    // Set headers for streaming text
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await streamChat(pastMessages, systemInstruction, res);

    // 4. Update Chat updatedAt timestamp
    chat.updatedAt = new Date();
    await chat.save();

    // 5. Log usage safely
    try {
      await AIUsage.create({
        user: req.user.id,
        tool: "chat",
        title: chat.title,
        prompt: message,
        output: "Streaming conversation updated",
      });
    } catch (dbErr) {
      console.error("Failed to log chat AIUsage:", dbErr.message);
    }
  } catch (error) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ message: error.message || "Failed to process chat message", error: error.message });
    } else {
      res.end();
    }
  }
}

// @desc    Delete a chat and history
// @route   DELETE /api/chats/:id
// @access  Private
async function deleteChat(req, res) {
  const chatId = req.params.id;
  try {
    const chat = await Chat.findOneAndDelete({ _id: chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Delete history
    await ChatHistory.deleteMany({ chat: chatId });
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat", error: error.message });
  }
}

module.exports = {
  listChats,
  createChat,
  getChatHistory,
  sendChatMessage,
  deleteChat,
};
