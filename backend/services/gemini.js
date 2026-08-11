const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Available Gemini models for fallback chain in order of preference
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

/**
 * Returns a generative model instance for a given model name
 */
function getModel(modelName = "gemini-2.5-flash") {
  if (!genAI) {
    const err = new Error("GEMINI_API_KEY is not configured on the server. Please add it to your .env file.");
    err.statusCode = 401;
    err.code = "MISSING_API_KEY";
    throw err;
  }
  return genAI.getGenerativeModel({ model: modelName });
}

// Convert Multer file to Gemini File Part object
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

/**
 * Helper to classify and format Gemini errors cleanly
 */
function classifyError(error) {
  const msg = error.message || "";
  const status = error.status;

  if (status === 429 || msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("Too Many Requests")) {
    const err = new Error("AI usage limit reached. Please try again in a few seconds.");
    err.statusCode = 429;
    err.code = "RATE_LIMIT_EXCEEDED";
    err.originalError = msg;
    return err;
  }

  if (status === 401 || status === 403 || msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
    const err = new Error("AI service configuration error. Please check server API keys.");
    err.statusCode = 401;
    err.code = "INVALID_OR_UNAUTHORIZED_API_KEY";
    err.originalError = msg;
    return err;
  }

  if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
    const err = new Error("The AI request timed out. Please try again.");
    err.statusCode = 408;
    err.code = "REQUEST_TIMEOUT";
    err.originalError = msg;
    return err;
  }

  const err = new Error("AI service is temporarily unavailable. Please try again later.");
  err.statusCode = 503;
  err.code = "PROVIDER_SERVER_ERROR";
  err.originalError = msg;
  return err;
}

/**
 * Executes a Gemini API call across the model fallback chain
 * Retries on 429/quota errors by switching models automatically
 */
async function executeWithModelFallback(apiCallFn) {
  let lastError = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const model = getModel(modelName);
      return await apiCallFn(model, modelName);
    } catch (err) {
      lastError = err;
      const isRateLimit = err.status === 429 || 
        (err.message && (err.message.includes("429") || err.message.includes("Quota exceeded")));

      if (isRateLimit) {
        console.warn(`[Gemini Service] Model ${modelName} hit 429 quota limit. Falling back to next model...`);
        continue; // Immediately try next model in fallback chain
      }

      // If it's an auth error or non-retryable error, fail immediately
      if (err.status === 401 || err.status === 403 || (err.message && err.message.includes("API key"))) {
        throw classifyError(err);
      }
    }
  }

  // If all models in the fallback chain failed, throw classified error
  throw classifyError(lastError || new Error("All AI models unavailable"));
}

/**
 * Generates text response using Gemini with automatic model fallback
 */
async function generateText(prompt, systemInstruction = "") {
  return executeWithModelFallback(async (model) => {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction || undefined,
    });
    const response = await result.response;
    return response.text();
  });
}

/**
 * Streams Gemini chat response directly to Express Response stream
 */
async function streamChat(messages, systemInstruction, expressRes) {
  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    await executeWithModelFallback(async (model) => {
      const result = await model.generateContentStream({
        contents,
        systemInstruction: systemInstruction || undefined,
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        expressRes.write(text);
      }
      expressRes.end();
    });
  } catch (error) {
    console.error("Gemini API Error (streamChat):", error);
    const classified = classifyError(error);
    if (!expressRes.headersSent) {
      expressRes.status(classified.statusCode || 500).json({ message: classified.message, code: classified.code });
    } else {
      expressRes.write(`\n\n[Error: ${classified.message}]`);
      expressRes.end();
    }
  }
}

/**
 * Analyzes uploaded PDF to generate summary and key points
 */
async function analyzePDF(fileBuffer, mimeType) {
  return executeWithModelFallback(async (model) => {
    const filePart = fileToGenerativePart(fileBuffer, mimeType);
    const prompt = `Analyze this PDF document. Provide two structured sections:
1. SUMMARY: A brief, comprehensive summary of the document.
2. KEY_POINTS: A bulleted list of the most critical takeaways, findings, or sections.

Ensure your output is returned in clean markdown format, matching these two headings.`;

    const result = await model.generateContent([filePart, prompt]);
    const text = result.response.text();

    let summary = "";
    let keyPoints = "";

    const summaryIndex = text.indexOf("SUMMARY");
    const keyPointsIndex = text.indexOf("KEY_POINTS");

    if (summaryIndex !== -1 && keyPointsIndex !== -1) {
      if (summaryIndex < keyPointsIndex) {
        summary = text.substring(summaryIndex, keyPointsIndex).replace("SUMMARY", "").trim();
        keyPoints = text.substring(keyPointsIndex).replace("KEY_POINTS", "").trim();
      } else {
        keyPoints = text.substring(keyPointsIndex, summaryIndex).replace("KEY_POINTS", "").trim();
        summary = text.substring(summaryIndex).replace("SUMMARY", "").trim();
      }
    } else {
      summary = text;
      keyPoints = "Key points extraction could not be formatted automatically. Please read the summary.";
    }

    summary = summary.replace(/^[:\-\s#*]+/g, "").trim();
    keyPoints = keyPoints.replace(/^[:\-\s#*]+/g, "").trim();

    return { summary, keyPoints };
  });
}

/**
 * Answers questions about an uploaded PDF
 */
async function askDocumentQuestion(fileBuffer, mimeType, question, history = []) {
  return executeWithModelFallback(async (model) => {
    const filePart = fileToGenerativePart(fileBuffer, mimeType);
    const historyText = history
      .map((h) => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n\n");

    const prompt = `You are an AI analyzing the attached PDF file.
Here is the previous conversation history:
${historyText}

Answer the following question based on the document's content:
Question: ${question}

Provide a direct, accurate answer using context from the document. Use markdown for styling if necessary.`;

    const result = await model.generateContent([filePart, prompt]);
    return result.response.text();
  });
}

/**
 * Generates a structured slide presentation (JSON Mode)
 */
async function generatePresentationSlides(topic, slideCount = 5) {
  return executeWithModelFallback(async (model) => {
    const prompt = `Create a professional presentation slide deck on the topic: "${topic}".
Generate exactly ${slideCount} slides.
For each slide, you MUST provide:
1. "title": A clear, engaging slide title.
2. "content": An array of 3-5 concise, impactful bullet points.
3. "speakerNotes": A short paragraph of speaker script or details for that slide.

You MUST respond in JSON format matching the schema:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "speakerNotes": "Script notes here..."
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error("JSON parsing error on slides generation:", responseText);
      throw new Error("Failed to parse presentation JSON schema from AI model.");
    }
  });
}

/**
 * Generates structured CV/Resume details (JSON Mode)
 */
async function generateResumeDetails(promptInput) {
  return executeWithModelFallback(async (model) => {
    const prompt = `Generate an ATS-friendly, professional CV/Resume based on the request: "${promptInput}".
You must output a JSON object containing:
1. "summary": A concise professional summary (1-2 sentences).
2. "skills": An array of 5-8 relevant core skills/technologies.
3. "experience": An array of objects, each with "company", "role", "duration", and "details" (1-2 summary bullet points).
4. "education": An array of objects, each with "school", "degree", and "year".

Format your response strictly as JSON matching:
{
  "summary": "...",
  "skills": ["React", "JavaScript"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Software Engineer",
      "duration": "2022 - Present",
      "details": "Developed UI features..."
    }
  ],
  "education": [
    {
      "school": "University of Tech",
      "degree": "B.S. Computer Science",
      "year": "2021"
    }
  ]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error("JSON parsing error on resume generation:", responseText);
      throw new Error("Failed to parse resume JSON schema from AI model.");
    }
  });
}

module.exports = {
  generateText,
  streamChat,
  analyzePDF,
  askDocumentQuestion,
  generatePresentationSlides,
  generateResumeDetails,
  classifyError,
};
