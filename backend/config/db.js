const mongoose = require("mongoose");

async function connectDB() {
  let uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/nexai";
  
  if (uri.includes("<db_username>") || uri.includes("<db_password>")) {
    console.warn(">>> MongoDB Atlas credentials placeholder detected. Falling back to local MongoDB.");
    uri = "mongodb://localhost:27017/nexai";
  }
  try {
    await mongoose.connect(uri);
    console.log(">>> MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
