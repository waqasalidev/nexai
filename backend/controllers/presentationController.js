const Presentation = require("../models/Presentation");
const AIUsage = require("../models/AIUsage");
const { generatePresentationSlides } = require("../services/gemini");

// @desc    List user's presentations
// @route   GET /api/presentations
// @access  Private
async function listPresentations(req, res) {
  try {
    const presentations = await Presentation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ presentations });
  } catch (error) {
    res.status(500).json({ message: "Failed to list presentations", error: error.message });
  }
}

// @desc    Generate a presentation slide deck
// @route   POST /api/presentations/generate
// @access  Private
async function generatePresentation(req, res) {
  const { topic, slideCount } = req.body;
  try {
    if (!topic) {
      return res.status(400).json({ message: "Please specify a presentation topic" });
    }

    const count = parseInt(slideCount) || 5;

    // Call Gemini presentation generator
    const slideDeck = await generatePresentationSlides(topic, count);

    // Save to DB
    const presentation = await Presentation.create({
      user: req.user.id,
      topic,
      slideCount: count,
      slides: slideDeck.slides,
    });

    // Log AI usage
    await AIUsage.create({
      user: req.user.id,
      tool: "presentation",
      title: topic,
      prompt: `Topic: ${topic}, Slides: ${count}`,
      output: JSON.stringify(slideDeck.slides),
    });

    res.status(201).json({ presentation });
  } catch (error) {
    console.error("Presentation generation error:", error);
    res.status(500).json({ message: "Failed to generate presentation", error: error.message });
  }
}

// @desc    Delete presentation
// @route   DELETE /api/presentations/:id
// @access  Private
async function deletePresentation(req, res) {
  try {
    const presentation = await Presentation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!presentation) {
      return res.status(404).json({ message: "Presentation not found" });
    }
    res.status(200).json({ message: "Presentation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete presentation", error: error.message });
  }
}

module.exports = {
  listPresentations,
  generatePresentation,
  deletePresentation,
};
