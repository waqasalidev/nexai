const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Subscription = require("../models/Subscription");


function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "nexai_secret",
    { expiresIn: "30d" }
  );
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if it's the very first user in database - make them Admin!
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? "admin" : "user";

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      plan: "free",
    });

    // Create active subscription model
    await Subscription.create({
      user: user._id,
      plan: "free",
      status: "active",
      startDate: new Date(),
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
async function login(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user profile", error: error.message });
  }
}



module.exports = {
  register,
  login,
  getMe,
};
