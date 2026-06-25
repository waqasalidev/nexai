const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function getModel(modelName = "gemini-2.5-flash") {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please add it to your .env file.");
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
 * Generates text response using Gemini
 */
async function generateText(prompt, systemInstruction = "") {
  try {
    const model = getModel();
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction || undefined,
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error (generateText):", error);
    throw new Error("AI service temporarily unavailable. Please try again later.");
  }
}

/**
 * Streams Gemini chat response directly to Express Response stream
 */
async function streamChat(messages, systemInstruction, expressRes) {
  try {
    const model = getModel();
    
    // Format messages for Gemini api
    // Gemini expects: { role: 'user'|'model', parts: [{ text: '...' }] }
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContentStream({
      contents,
      systemInstruction: systemInstruction || undefined,
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      expressRes.write(text);
    }
    expressRes.end();
  } catch (error) {
    console.error("Gemini API Error (streamChat):", error);
    expressRes.write("\n\n[Error: AI service temporarily unavailable. Please try again later.]");
    expressRes.end();
  }
}

/**
 * Analyzes uploaded PDF to generate summary and key points
 */
async function analyzePDF(fileBuffer, mimeType) {
  try {
    const model = getModel("gemini-2.5-flash");
    const filePart = fileToGenerativePart(fileBuffer, mimeType);

    const prompt = `Analyze this PDF document. Provide two structured sections:
1. SUMMARY: A brief, comprehensive summary of the document.
2. KEY_POINTS: A bulleted list of the most critical takeaways, findings, or sections.

Ensure your output is returned in clean markdown format, matching these two headings.`;

    const result = await model.generateContent([filePart, prompt]);
    const text = result.response.text();

    // Split summary and key points
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
      // If parsing fails, store whole text in summary
      summary = text;
      keyPoints = "Key points extraction could not be formatted automatically. Please read the summary.";
    }

    // Strip leading headers/symbols like '#', '##', ':' from the parsed text
    summary = summary.replace(/^[:\-\s#*]+/g, "").trim();
    keyPoints = keyPoints.replace(/^[:\-\s#*]+/g, "").trim();

    return { summary, keyPoints };
  } catch (error) {
    console.error("Gemini API Error (analyzePDF):", error);
    throw new Error("AI service temporarily unavailable. Please try again later.");
  }
}

/**
 * Answers questions about an uploaded PDF
 */
async function askDocumentQuestion(fileBuffer, mimeType, question, history = []) {
  try {
    const model = getModel("gemini-2.5-flash");
    const filePart = fileToGenerativePart(fileBuffer, mimeType);

    // Build prompts with optional context/history
    const historyText = history
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n\n");

    const prompt = `You are an AI analyzing the attached PDF file.
Here is the previous conversation history:
${historyText}

Answer the following question based on the document's content:
Question: ${question}

Provide a direct, accurate answer using context from the document. Use markdown for styling if necessary.`;

    const result = await model.generateContent([filePart, prompt]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error (askDocumentQuestion):", error);
    throw new Error("AI service temporarily unavailable. Please try again later.");
  }
}

/**
 * Generates a structured slide presentation (JSON Mode)
 */
async function generatePresentationSlides(topic, slideCount = 5) {
  try {
    const model = getModel("gemini-2.5-flash");
    
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
  } catch (error) {
    console.error("Gemini API Error (generatePresentationSlides):", error);
    throw new Error("AI service temporarily unavailable. Please try again later.");
  }
}

/**
 * Generates structured CV/Resume details (JSON Mode)
 */
async function generateResumeDetails(promptInput) {
  try {
    const model = getModel("gemini-2.5-flash");

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
  } catch (error) {
    console.error("Gemini API Error (generateResumeDetails):", error);
    throw new Error("AI service temporarily unavailable. Please try again later.");
  }
}

module.exports = {
  generateText,
  streamChat,
  analyzePDF,
  askDocumentQuestion,
  generatePresentationSlides,
  generateResumeDetails,
};
