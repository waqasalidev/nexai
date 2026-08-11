const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Builds an enhanced image prompt while preserving original user intent.
 */
function enhancePrompt(userPrompt, options = {}) {
  const cleanPrompt = userPrompt ? userPrompt.trim() : "";
  if (!cleanPrompt) return "";

  const styleModifier = options.style ? `, ${options.style} style` : "";
  const qualityKeywords = ", highly detailed, cinematic lighting, 8k resolution, professional finish";

  // If user prompt is already long and detailed, keep it as is; otherwise enhance subtly
  if (cleanPrompt.length > 80 || cleanPrompt.includes("resolution") || cleanPrompt.includes("detailed")) {
    return `${cleanPrompt}${styleModifier}`;
  }

  return `${cleanPrompt}${styleModifier}${qualityKeywords}`;
}

/**
 * Ensures the uploads/images directory exists on disk.
 */
function ensureImageDirectory() {
  const dir = path.join(__dirname, "../uploads/images");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Saves binary image buffer locally to server disk and returns relative permanent static URL.
 */
function saveImageBuffer(buffer, extension = "png") {
  const targetDir = ensureImageDirectory();
  const filename = `img_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${extension}`;
  const filePath = path.join(targetDir, filename);
  
  fs.writeFileSync(filePath, buffer);
  
  // Return relative static endpoint route path served by Express
  return `/uploads/images/${filename}`;
}

/**
 * Dedicated AI Image Generation Service for NexAI
 * Supports OpenAI DALL-E, Stability AI, HuggingFace FLUX, or Fallback AI Image Provider Engine.
 */
async function generateImage(rawPrompt, options = {}) {
  if (!rawPrompt || typeof rawPrompt !== "string" || !rawPrompt.trim()) {
    throw new Error("Invalid prompt provided for image generation.");
  }

  const prompt = enhancePrompt(rawPrompt, options);
  const width = options.width || 768;
  const height = options.height || 768;

  // 1. Check for OpenAI API Key (DALL-E)
  const openAiKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.startsWith("sk-")) {
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI provider returned status ${response.status}`);
      }

      const data = await response.json();
      const b64Data = data.data?.[0]?.b64_json;
      if (!b64Data) throw new Error("No image payload received from OpenAI DALL-E API.");

      const buffer = Buffer.from(b64Data, "base64");
      const relativeUrl = saveImageBuffer(buffer, "png");
      return {
        url: relativeUrl,
        prompt: rawPrompt,
        enhancedPrompt: prompt,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("OpenAI DALL-E error:", err.message);
      throw new Error(`Image generation failed: ${err.message}`);
    }
  }

  // 2. Check for Stability AI Key
  const stabilityKey = process.env.STABILITY_API_KEY;
  if (stabilityKey) {
    try {
      const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${stabilityKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height,
          width,
          steps: 30,
          samples: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Stability AI status ${response.status}`);
      }

      const data = await response.json();
      const b64Data = data.artifacts?.[0]?.base64;
      if (!b64Data) throw new Error("No image artifacts returned from Stability AI.");

      const buffer = Buffer.from(b64Data, "base64");
      const relativeUrl = saveImageBuffer(buffer, "png");
      return {
        url: relativeUrl,
        prompt: rawPrompt,
        enhancedPrompt: prompt,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("Stability AI error:", err.message);
      throw new Error(`Image generation failed: ${err.message}`);
    }
  }

  // 3. Check for HuggingFace API Token
  const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (hfToken) {
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hfToken}`,
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > 100) {
          const relativeUrl = saveImageBuffer(buffer, "png");
          return {
            url: relativeUrl,
            prompt: rawPrompt,
            enhancedPrompt: prompt,
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (hfErr) {
      console.warn("HuggingFace Inference API warning:", hfErr.message);
    }
  }

  // 3. Fallback High-Quality AI Image Provider Engine (Multi-Endpoint Rotation)
  const imageEndpoints = [
    (p, s) => `https://image.pollinations.ai/p/${p}?width=${width}&height=${height}&seed=${s}&nologo=true&model=flux`,
    (p, s) => `https://image.pollinations.ai/p/${p}?width=${width}&height=${height}&seed=${s}&nologo=true&model=turbo`,
    (p, s) => `https://image.pollinations.ai/p/${p}?width=${width}&height=${height}&seed=${s}&nologo=true`,
  ];

  let lastImageError = null;

  for (let attempt = 0; attempt < imageEndpoints.length; attempt++) {
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const escapedPrompt = encodeURIComponent(prompt);
      const providerUrl = imageEndpoints[attempt](escapedPrompt, seed);
      
      const imageRes = await fetch(providerUrl, {
        signal: AbortSignal.timeout(25000),
      });

      if (imageRes.status === 429 && attempt < imageEndpoints.length - 1) {
        console.warn(`[Image Generation] Endpoint ${attempt + 1} hit 429 rate limit. Trying next endpoint...`);
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }

      if (!imageRes.ok) {
        const err = new Error(`AI Image Provider returned status ${imageRes.status}`);
        err.status = imageRes.status;
        throw err;
      }

      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 100) {
        throw new Error("Received invalid or corrupted image buffer from AI provider.");
      }

      // Persist to disk local server uploads storage
      const relativeUrl = saveImageBuffer(buffer, "jpg");

      return {
        url: relativeUrl,
        prompt: rawPrompt,
        enhancedPrompt: prompt,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      lastImageError = err;
      if (attempt < imageEndpoints.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
    }
  }

  console.error("AI Image Generation Error:", lastImageError ? lastImageError.message : "Unknown error");
  if (lastImageError && (lastImageError.name === "TimeoutError" || lastImageError.message.includes("timeout"))) {
    const err = new Error("Image generation timed out. Please try again.");
    err.statusCode = 408;
    throw err;
  }
  
  if (lastImageError && (lastImageError.status === 429 || lastImageError.message.includes("429"))) {
    const err = new Error("Image generation rate limit reached. Please try again in a few seconds.");
    err.statusCode = 429;
    throw err;
  }

  const err = new Error("Image generation service is temporarily unavailable. Please try again later.");
  err.statusCode = 503;
  throw err;
}

module.exports = {
  generateImage,
  enhancePrompt,
};
