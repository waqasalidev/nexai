const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: [
    {
      type: String,
    },
  ],
  speakerNotes: {
    type: String,
    default: "",
  },
});

const PresentationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  slideCount: {
    type: Number,
    required: true,
  },
  slides: [SlideSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Presentation", PresentationSchema);
