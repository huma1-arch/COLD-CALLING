import { GoogleGenAI, Modality, Type } from "@google/genai";
import { SearchResult } from "../types";

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 1. Research / Search Grounding
 * Model: gemini-3-flash-preview
 * Tool: googleSearch
 */
export const searchProspects = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find detailed information for sales prospecting about: ${query}. Focus on recent news, leadership changes, and potential pain points.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || "No results found.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

/**
 * 2. Script Generation / Chatbot
 * Model: gemini-3-pro-preview
 */
export const generateScript = async (
  prompt: string,
  history: { role: string; text: string }[] = []
): Promise<string> => {
  try {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: "You are an expert sales script writer and coach. Be concise, persuasive, and professional.",
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Script gen error:", error);
    throw error;
  }
};

/**
 * 3. Text-to-Speech
 * Model: gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Deep, professional voice
          },
        },
      },
    });

    // Returns raw base64 PCM data
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

/**
 * 4. Audio Transcription
 * Model: gemini-3-flash-preview
 */
export const transcribeAudio = async (audioBase64: string, mimeType: string = 'audio/webm'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: "Transcribe this audio accurately. Just return the transcription, no other text."
          }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

/**
 * 5. Video Understanding
 * Model: gemini-3-pro-preview
 */
export const analyzeVideo = async (fileBase64: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: prompt || "Analyze this sales call. Identify key objections, sentiment, and areas for improvement."
          }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Video analysis error:", error);
    throw error;
  }
};
