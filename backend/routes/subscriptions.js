const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Subscription = require("../models/Subscription");

router.get("/status", protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    res.status(200).json({ subscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to get subscription status", error: error.message });
  }
});

module.exports = router;
