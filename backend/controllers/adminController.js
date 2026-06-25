const User = require("../models/User");
const Subscription = require("../models/Subscription");
const ContactMessage = require("../models/ContactMessage");
const AIUsage = require("../models/AIUsage");

// @desc    Get global analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
async function getStats(req, res) {
  try {
    const totalUsers = await User.countDocuments({});
    const activeSubscriptions = await Subscription.countDocuments({ status: "active" });
    const totalMessages = await ContactMessage.countDocuments({});
    const totalAiRequests = await AIUsage.countDocuments({});

    // Group usage by tool
    const usageBreakdown = await AIUsage.aggregate([
      {
        $group: {
          _id: "$tool",
          count: { $sum: 1 },
        },
      },
    ]);

    const toolUsageStats = {
      chat: 0,
      pdf: 0,
      notes: 0,
      "cover-letter": 0,
      translate: 0,
      code: 0,
      image: 0,
      resume: 0,
      presentation: 0,
    };

    usageBreakdown.forEach((item) => {
      if (toolUsageStats[item._id] !== undefined) {
        toolUsageStats[item._id] = item.count;
      }
    });

    res.status(200).json({
      stats: {
        totalUsers,
        activeSubscriptions,
        totalMessages,
        totalAiRequests,
        toolUsageStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to gather analytics", error: error.message });
  }
}

// @desc    List all users
// @route   GET /api/admin/users
// @access  Private/Admin
async function listUsers(req, res) {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
}

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
async function updateUserRole(req, res) {
  const { role } = req.body;
  try {
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
}

// @desc    Update user subscription plan
// @route   PUT /api/admin/users/:id/plan
// @access  Private/Admin
async function updateUserPlan(req, res) {
  const { plan } = req.body;
  try {
    if (!plan || !["free", "pro", "premium"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan specified" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update User Plan
    user.plan = plan;
    await user.save();

    // Create or update subscription record
    await Subscription.findOneAndUpdate(
      { user: user._id },
      { plan, status: "active", startDate: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ user: { id: user._id, plan: user.plan } });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user plan", error: error.message });
  }
}

// @desc    List contact messages
// @route   GET /api/admin/messages
// @access  Private/Admin
async function listMessages(req, res) {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to list contact messages", error: error.message });
  }
}

// @desc    Delete contact message
// @route   DELETE /api/admin/messages/:id
// @access  Private/Admin
async function deleteMessage(req, res) {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete contact message", error: error.message });
  }
}

module.exports = {
  getStats,
  listUsers,
  updateUserRole,
  updateUserPlan,
  listMessages,
  deleteMessage,
};
