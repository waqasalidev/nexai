const Resume = require("../models/Resume");
const Presentation = require("../models/Presentation");
const Document = require("../models/Document");
const Chat = require("../models/Chat");
const AIUsage = require("../models/AIUsage");
const { isDBConnected } = require("../config/db");
const { generateText } = require("../services/gemini");
const { generateImage } = require("../services/imageGeneration");

// @desc    Get user's workspace history and statistics (or specific tool history via query param)
// @route   GET /api/history
// @access  Private
async function getWorkspaceHistory(req, res) {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        message: "Database service is temporarily unavailable. Please try again later.",
      });
    }

    const userId = req.user.id;

    // Handle tool-specific history requests (e.g. GET /api/history?tool=image)
    if (req.query.tool) {
      const history = await AIUsage.find({ user: userId, tool: req.query.tool })
        .sort({ createdAt: -1 })
        .limit(50);
      return res.status(200).json({ success: true, history: history || [] });
    }

    // Parallel execution for workspace records
    const [resumes, presentations, documents, chats, aiUsageCount] = await Promise.all([
      Resume.find({ user: userId }).select("title updatedAt createdAt").sort({ updatedAt: -1 }),
      Presentation.find({ user: userId }).select("topic slides createdAt").sort({ createdAt: -1 }),
      Document.find({ user: userId }).select("fileName fileSize createdAt").sort({ createdAt: -1 }),
      Chat.find({ user: userId }).select("title updatedAt createdAt").sort({ updatedAt: -1 }),
      AIUsage.countDocuments({ user: userId }),
    ]);

    const totalItems =
      (resumes ? resumes.length : 0) +
      (presentations ? presentations.length : 0) +
      (documents ? documents.length : 0) +
      (chats ? chats.length : 0);

    return res.status(200).json({
      summary: {
        totalItems,
        aiUsageCount: aiUsageCount || 0,
      },
      resumes: resumes || [],
      presentations: presentations || [],
      documents: documents || [],
      chats: chats || [],
    });
  } catch (error) {
    console.error("Workspace History Error:", error);
    return res.status(500).json({
      message: "Failed to gather workspace history",
      error: error.message,
    });
  }
}

// @desc    Execute standard AI Tool (Notes, Translator, Code Assistant, Cover Letter, Image)
// @route   POST /api/history/run-tool
// @access  Private
async function runTool(req, res) {
  const startTime = Date.now();
  const { prompt, system, tool, title, options } = req.body;
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database service is temporarily unavailable. Please try again later.",
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Database service is temporarily unavailable.",
          status: 503,
        },
      });
    }

    if (!prompt || !tool) {
      return res.status(400).json({
        success: false,
        message: "Prompt and tool type are required",
        error: {
          code: "INVALID_INPUT",
          message: "Prompt and tool type are required",
          status: 400,
        },
      });
    }

    // Handle Image Generation
    if (tool === "image") {
      const imageResult = await generateImage(prompt, options);

      // Store in AI usage history upon successful generation
      let usage = null;
      try {
        usage = await AIUsage.create({
          user: req.user.id,
          tool: "image",
          title: title || prompt.slice(0, 50),
          prompt: prompt,
          output: imageResult.url,
        });
      } catch (dbErr) {
        console.error("Failed to persist image AIUsage log:", dbErr.message);
      }

      return res.status(200).json({
        success: true,
        text: imageResult.url,
        image: imageResult,
        usage,
      });
    }

    // Handle standard text-based tools (notes, resume, cover-letter, translate, code, etc.)
    const textOutput = await generateText(prompt, system);

    // Store in AI usage history
    let usage = null;
    try {
      usage = await AIUsage.create({
        user: req.user.id,
        tool,
        title: title || prompt.slice(0, 50),
        prompt,
        output: textOutput,
      });
    } catch (dbErr) {
      console.error("Failed to persist text AIUsage log:", dbErr.message);
    }

    return res.status(200).json({ success: true, text: textOutput, usage });
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || "TOOL_EXECUTION_ERROR";
    const errorMessage = error.message || "Failed to execute AI tool";

    console.error(`\n--- AI TOOL ERROR REPORT ---`);
    console.error(`TOOL: ${tool}`);
    console.error(`HTTP STATUS: ${statusCode}`);
    console.error(`ERROR TYPE: ${errorCode}`);
    console.error(`ERROR MESSAGE: ${errorMessage}`);
    console.error(`AI PROVIDER: ${tool === "image" ? "Pollinations/OpenAI" : "Google Gemini"}`);
    console.error(`MODEL: ${tool === "image" ? "FLUX/DALL-E" : "gemini-2.5-flash"}`);
    console.error(`REQUEST DURATION: ${duration}ms\n`);

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: {
        code: errorCode,
        message: errorMessage,
        status: statusCode,
      },
    });
  }
}

module.exports = {
  getWorkspaceHistory,
  runTool,
};

