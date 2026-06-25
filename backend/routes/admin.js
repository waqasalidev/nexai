const express = require("express");
const router = express.Router();
const {
  getStats,
  listUsers,
  updateUserRole,
  updateUserPlan,
  listMessages,
  deleteMessage,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");

router.use(protect); // protect all admin routes
router.use(admin);   // restrict to admins only

router.get("/stats", getStats);
router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/plan", updateUserPlan);
router.get("/messages", listMessages);
router.delete("/messages/:id", deleteMessage);

module.exports = router;
