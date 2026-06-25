const Resume = require("../models/Resume");
const Presentation = require("../models/Presentation");
const Document = require("../models/Document");
const Chat = require("../models/Chat");
const AIUsage = require("../models/AIUsage");
const { generateText } = require("../services/gemini");

// @desc    Get user's workspace history and statistics
// @route   GET /api/history
// @access  Private
async function getWorkspaceHistory(req, res) {
  try {
    const userId = req.user.id;

    const resumes = await Resume.find({ user: userId }).select("title updatedAt").sort({ updatedAt: -1 });
    const presentations = await Presentation.find({ user: userId }).select("topic slides createdAt").sort({ createdAt: -1 });
    const documents = await Document.find({ user: userId }).select("fileName fileSize createdAt").sort({ createdAt: -1 });
    const chats = await Chat.find({ user: userId }).select("title updatedAt").sort({ updatedAt: -1 });
    
    const aiUsageCount = await AIUsage.countDocuments({ user: userId });

    const totalItems = resumes.length + presentations.length + documents.length + chats.length;

    res.status(200).json({
      summary: {
        totalItems,
        aiUsageCount,
      },
      resumes,
      presentations,
      documents,
      chats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to gather workspace history", error: error.message });
  }
}

// @desc    Execute standard AI Tool (Notes, Translator, Code Assistant, Cover Letter, Image)
// @route   POST /api/history/run-tool
// @access  Private
async function runTool(req, res) {
  const { prompt, system, tool, title } = req.body;
  try {
    if (!prompt || !tool) {
      return res.status(400).json({ message: "Prompt and tool type are required" });
    }

    // Handle Image Generation
    if (tool === "image") {
      const escapedPrompt = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);
      const generatedImageUrl = `https://image.pollinations.ai/p/${escapedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;

      // Store in AI usage history
      const usage = await AIUsage.create({
        user: req.user.id,
        tool,
        title: title || prompt.slice(0, 50),
        prompt,
        output: generatedImageUrl,
      });

      return res.status(200).json({ text: generatedImageUrl, usage });
    }

    // Handle standard text-based tools
    const textOutput = await generateText(prompt, system);

    // Store in AI usage history
    const usage = await AIUsage.create({
      user: req.user.id,
      tool,
      title: title || prompt.slice(0, 50),
      prompt,
      output: textOutput,
    });

    res.status(200).json({ text: textOutput, usage });
  } catch (error) {
    console.error(`AI Tool Error (${tool}):`, error);
    res.status(500).json({ message: `Failed to execute AI tool ${tool}`, error: error.message });
  }
}

module.exports = {
  getWorkspaceHistory,
  runTool,
};
