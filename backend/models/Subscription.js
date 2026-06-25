const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  plan: {
    type: String,
    enum: ["free", "pro", "premium"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "canceled", "expired"],
    default: "active",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
