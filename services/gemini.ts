
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Course, SkillLevel, CourseFormat } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Encodes Uint8Array to base64 string
 */
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes base64 string to Uint8Array
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  /**
   * Enhanced 6-Tier Fallback Request Strategy
   * Corrected model names to match the supported Google Gemini API list.
   */
  private async callWithFallback(params: any, tiers: string[]): Promise<any> {
    let lastError: any = null;
    
    // Canonical models for fallback steps
    const fallbackSequence = [
      tiers[0], // Step 1: User primary choice
      tiers[1] || 'gemini-3-flash-preview', // Step 2: User secondary or Flash Preview
      'gemini-flash-latest', // Step 3: Reliable 1.5 Flash
      'gemini-flash-lite-latest', // Step 4: Low-latency/High-quota Lite
      'gemini-flash-lite-latest', // Step 5: Retry Lite
      'gemini-flash-lite-latest'  // Step 6: Final Lite attempt
    ].slice(0, 6);

    for (let i = 0; i < fallbackSequence.length; i++) {
      const model = fallbackSequence[i];
      try {
        console.debug(`[CLEVIQ Tier ${i+1}] Invoking ${model}...`);
        
        const res = await this.ai.models.generateContent({
          ...params,
          model: model,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        const errorMsg = err?.message?.toLowerCase() || "";
        const isQuotaError = errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('rate limit');
        
        if (isQuotaError) {
          const waitTime = (i + 1) * 3000; 
          console.warn(`[CLEVIQ Tier ${i+1}] Rate limit hit. Cooling down for ${waitTime/1000}s...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }

        // If it's a 404 or structural, skip to next model
        console.error(`[CLEVIQ Tier ${i+1}] Error with ${model}:`, err.message);
      }
    }
    
    throw new Error(
      `CLEVIQ Orchestration Failure: All 6 fallback tiers were exhausted. ` +
      `Details: ${lastError?.message || 'Connection timeout'}`
    );
  }

  async generateCourse(
    topic: string,
    skillLevel: SkillLevel = SkillLevel.BEGINNER,
    format: CourseFormat = CourseFormat.MIXED
  ): Promise<Course> {
    const models = [
      'gemini-3-pro-preview',
      'gemini-3-flash-preview',
    ];

    const prompt = `Generate a structured educational course about "${topic}". 
    Level: ${skillLevel}. Format Preference: ${format}.
    
    CONTENT STYLE: Use a professional yet vibrant "Nigerian Storytelling" approach. 
    Use Nigerian English expressions like "Oya", "Chai", or "Abeg" sparingly but effectively in audio scripts.
    
    OUTPUT: Valid JSON matching the schema.`;

    const config = {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedDuration: { type: Type.STRING },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                lessons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      imagePrompt: { type: Type.STRING },
                      audioScript: { type: Type.STRING },
                      podcastScript: { type: Type.STRING },
                      quiz: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                          },
                          required: ["question", "options", "correctAnswerIndex", "explanation"]
                        }
                      }
                    },
                    required: ["id", "title", "content", "summary", "imagePrompt", "audioScript", "quiz"]
                  }
                }
              },
              required: ["id", "title", "lessons"]
            }
          }
        },
        required: ["id", "title", "description", "targetAudience", "learningObjectives", "estimatedDuration", "modules"]
      }
    };

    const response = await this.callWithFallback({ contents: prompt, config }, models);
    const courseData = JSON.parse(response.text.trim());
    courseData.completedLessonIds = []; 
    return courseData;
  }

  async generateTTS(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' = 'Kore'): Promise<AudioBuffer> {
    const models = ["gemini-2.5-flash-preview-tts"];

    const params = {
      contents: [{ parts: [{ text: `Generate audio for the following script in a warm Nigerian accent: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    };

    const response = await this.callWithFallback(params, models);

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio payload returned from Gemini API.");

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decode(base64Audio);
    return await decodeAudioData(audioBytes, audioCtx, 24000, 1);
  }
}

export const gemini = new GeminiService();
