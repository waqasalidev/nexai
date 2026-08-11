const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable DNS resolution for Mongo Atlas SRV records on Windows environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  console.warn("Custom DNS server setup skipped:", dnsErr.message);
}

async function connectDB() {
  let uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nexai";
  
  if (uri.includes("<db_username>") || uri.includes("<db_password>")) {
    console.warn(">>> MongoDB Atlas credentials placeholder detected. Falling back to local MongoDB.");
    uri = "mongodb://127.0.0.1:27017/nexai";
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(">>> MongoDB Connected Successfully");
  } catch (primaryError) {
    console.warn(`>>> Primary MongoDB connection failed (${primaryError.message}). Attempting fallback to local MongoDB...`);
    try {
      const fallbackUri = "mongodb://127.0.0.1:27017/nexai";
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(">>> MongoDB Connected Successfully via local fallback URI");
    } catch (fallbackError) {
      console.error("MongoDB Connection Failed (both primary and fallback):", primaryError.message);
      throw primaryError;
    }
  }
}

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDBConnected };



