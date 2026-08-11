const Resume = require("../models/Resume");
const AIUsage = require("../models/AIUsage");
const { generateResumeDetails } = require("../services/gemini");

// @desc    List all user resumes
// @route   GET /api/resumes
// @access  Private
async function listResumes(req, res) {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: "Failed to list resumes", error: error.message });
  }
}

// @desc    Generate a resume using AI
// @route   POST /api/resumes/generate
// @access  Private
async function generateResume(req, res) {
  const { prompt } = req.body;
  try {
    if (!prompt) {
      return res.status(400).json({ message: "Please provide a resume generation description" });
    }

    // Call Gemini JSON generator
    const resumeDetails = await generateResumeDetails(prompt);

    // Save to DB
    const resume = await Resume.create({
      user: req.user.id,
      title: `Resume - ${prompt.slice(0, 30)}`,
      content: resumeDetails,
    });

    // Log AI Usage
    try {
      await AIUsage.create({
        user: req.user.id,
        tool: "resume",
        title: resume.title,
        prompt,
        output: JSON.stringify(resumeDetails),
      });
    } catch (dbErr) {
      console.error("Failed to log resume AIUsage:", dbErr.message);
    }

    res.status(201).json({ resume });
  } catch (error) {
    console.error("Resume generation error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Failed to generate resume", error: error.message });
  }
}

// @desc    Create/Save manual resume
// @route   POST /api/resumes
// @access  Private
async function createResume(req, res) {
  const { title, content } = req.body;
  try {
    const resume = await Resume.create({
      user: req.user.id,
      title: title || "My Manual Resume",
      content,
    });
    res.status(201).json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to save resume", error: error.message });
  }
}

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
async function updateResume(req, res) {
  const { title, content } = req.body;
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.title = title || resume.title;
    resume.content = content || resume.content;
    await resume.save();

    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to update resume", error: error.message });
  }
}

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
async function deleteResume(req, res) {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resume", error: error.message });
  }
}

module.exports = {
  listResumes,
  generateResume,
  createResume,
  updateResume,
  deleteResume,
};
