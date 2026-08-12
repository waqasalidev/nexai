require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const { connectDB } = require("./config/db");
const seedDatabase = require("./utils/seeder");

// Import Routers
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const chatsRouter = require("./routes/chats");
const resumesRouter = require("./routes/resumes");
const presentationsRouter = require("./routes/presentations");
const documentsRouter = require("./routes/documents");
const contactRouter = require("./routes/contact");
const subscriptionsRouter = require("./routes/subscriptions");
const historyRouter = require("./routes/history");
const adminRouter = require("./routes/admin");
const aiRouter = require("./routes/ai");
const healthRouter = require("./routes/health");

const app = express();

// Middleware Setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
      : true, // Allow all origins in development
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup uploads folder directory serving (including images)
const uploadsDir = path.join(__dirname, "uploads");
const imagesDir = path.join(uploadsDir, "images");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// API Routes Mounting
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/presentations", presentationsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/history", historyRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the NexAI Full-Stack SaaS API Portal" });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({
    message: "A critical error occurred inside the system server circuits.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Port Listener & Production-Safe MongoDB Connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`>>> Express server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Fatal Error during server startup:", error.message);
    process.exit(1);
  }
}

startServer();
