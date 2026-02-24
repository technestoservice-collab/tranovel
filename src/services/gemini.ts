import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
// Note: In a real production app, you might want to proxy this through a backend to protect the key,
// but for this client-side demo as per instructions, we use it directly if the user provides it.
// The environment variable is injected by the platform.
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDUHAFradgTJMDuxs6hZFM290EcRGMiVU8";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!ai) {
    console.error("Gemini API key is missing");
    return "Error: Gemini API key is missing. Please configure it in the AI Studio secrets.";
  }

  try {
    const prompt = `Translate the following text into ${targetLanguage}. 
    Important: Keep all names and proper nouns in English (do not translate them).
    Do not add any explanations, just provide the translation.
    
    Text to translate:
    "${text}"`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return result.text || "Translation failed.";
    } catch (primaryError) {
      console.warn("Primary model failed, attempting fallback...", primaryError);
      try {
        // Fallback to a different model if the primary one fails (e.g., due to access/quota)
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
        });
        return result.text || "Translation failed.";
      } catch (fallbackError: any) {
        throw fallbackError; // Throw to outer catch block
      }
    }
  } catch (error: any) {
    console.error("Translation error:", error);
    return `Error: ${error.message || "Unknown error occurred during translation."}`;
  }
}
