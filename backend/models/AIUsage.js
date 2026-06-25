const mongoose = require("mongoose");

const AIUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  tool: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  prompt: {
    type: String,
    default: "",
  },
  output: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AIUsage", AIUsageSchema);
