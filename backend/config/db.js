const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable DNS resolution for Mongo Atlas SRV records on Windows environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  console.warn("Custom DNS server setup skipped:", dnsErr.message);
}

// Safe Mongoose Connection Event Monitoring
mongoose.connection.on("connected", () => {
  console.log(">>> Mongoose Event: Connected to Database");
});

mongoose.connection.on("error", (err) => {
  console.error(">>> Mongoose Event Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn(">>> Mongoose Event: Disconnected from Database");
});

mongoose.connection.on("reconnected", () => {
  console.log(">>> Mongoose Event: Reconnected to Database");
});

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
  } catch (primaryError) {
    console.warn(`>>> Primary MongoDB connection failed (${primaryError.message}). Attempting fallback to local MongoDB...`);
    try {
      const fallbackUri = "mongodb://127.0.0.1:27017/nexai";
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
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




