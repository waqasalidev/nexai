const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nexai_secret");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found with this ID" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token verification failed" });
  }
}

function admin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access restricted: Administrative clearance required" });
  }
}

module.exports = { protect, admin };
