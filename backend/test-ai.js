require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey);
  if (!apiKey) {
    console.error("No API key configured");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try calling listModels or similar if available, or try generating with gemini-1.5-flash vs gemini-2.5-flash vs gemini-pro
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.5-pro"];
  
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello! Response in 5 words.");
      console.log(`Success with ${modelName}:`, result.response.text());
      break;
    } catch (e) {
      console.error(`Failed with ${modelName}:`, e.message);
    }
  }
}

main().catch(console.error);
