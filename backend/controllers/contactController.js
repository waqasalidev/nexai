const ContactMessage = require("../models/ContactMessage");

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
async function submitMessage(req, res) {
  const { name, email, subject, message } = req.body;
  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      message: "Message transmitted successfully",
      contactMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit contact message", error: error.message });
  }
}

module.exports = {
  submitMessage,
};
