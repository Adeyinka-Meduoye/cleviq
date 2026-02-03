
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Course, SkillLevel, CourseFormat } from "../types";

// Keys are pulled from the environment. Gemini uses process.env.API_KEY per instructions.
const GEMINI_API_KEY = process.env.API_KEY || "";
const GROQ_API_KEY = (process.env as any).GROQ_API_KEY || "";
const OPENAI_API_KEY = (process.env as any).OPENAI_API_KEY || "";

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

type Provider = 'groq' | 'gemini' | 'openai';

interface TierConfig {
  provider: Provider;
  model: string;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  /**
   * Universal AI Caller
   */
  private async callProvider(config: TierConfig, params: any): Promise<string> {
    const { provider, model } = config;

    if (provider === 'gemini') {
      const res = await this.ai.models.generateContent({
        ...params,
        model: model,
      });
      return res.text || "";
    }

    if (provider === 'groq') {
      if (!GROQ_API_KEY) throw new Error("Groq API Key missing");
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: params.contents }],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Groq error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    }

    if (provider === 'openai') {
      if (!OPENAI_API_KEY) throw new Error("OpenAI API Key missing");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: params.contents }],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `OpenAI error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  /**
   * 6-Tier Fallback Strategy using Groq, Gemini, and OpenAI
   */
  private async callWithFallback(params: any): Promise<string> {
    const tiers: TierConfig[] = [
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },  // Tier 1: Groq High-End
      { provider: 'gemini', model: 'gemini-3-pro-preview' },   // Tier 2: Gemini Pro
      { provider: 'openai', model: 'gpt-4o' },                // Tier 3: OpenAI GPT-4o
      { provider: 'groq', model: 'llama-3.1-8b-instant' },     // Tier 4: Groq Instant
      { provider: 'gemini', model: 'gemini-3-flash-preview' }, // Tier 5: Gemini Flash
      { provider: 'openai', model: 'gpt-4o-mini' }            // Tier 6: OpenAI GPT-4o-mini
    ];

    let lastError: any = null;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      try {
        console.debug(`[CLEVIQ Orchestrator] Attempting Tier ${i + 1} (${tier.provider}: ${tier.model})`);
        return await this.callProvider(tier, params);
      } catch (err: any) {
        lastError = err;
        const msg = err.message.toLowerCase();
        
        // Handle Quota/Rate Limit (429) specifically
        if (msg.includes('quota') || msg.includes('429') || msg.includes('limit') || msg.includes('exhausted')) {
          console.warn(`[CLEVIQ Orchestrator] Tier ${i + 1} (${tier.provider}) rate limit exceeded. Falling back...`);
          // Exponential wait to give the provider a chance to recover
          await new Promise(r => setTimeout(r, (i + 1) * 1500));
          continue;
        }

        // Handle 404/Not Found
        if (msg.includes('not found') || msg.includes('404')) {
          console.error(`[CLEVIQ Orchestrator] Tier ${i + 1} model unavailable. Skipping.`);
          continue;
        }

        console.error(`[CLEVIQ Orchestrator] Tier ${i + 1} failed with technical error:`, err.message);
      }
    }

    throw new Error(`CLEVIQ Master AI System Failure: All 6 fallback tiers (Groq, Gemini, OpenAI) were exhausted. Last Error: ${lastError?.message}`);
  }

  async generateCourse(
    topic: string,
    skillLevel: SkillLevel = SkillLevel.BEGINNER,
    format: CourseFormat = CourseFormat.MIXED
  ): Promise<Course> {
    const prompt = `Generate a structured educational course about "${topic}". 
    Level: ${skillLevel}. Format Preference: ${format}.
    
    CONTENT STYLE: Use a professional yet vibrant "Nigerian Storytelling" approach. 
    Use Nigerian English expressions like "Oya", "Chai", or "Abeg" sparingly but effectively in audio scripts.
    
    IMPORTANT: You must return the response strictly as a JSON object matching this schema:
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "targetAudience": "string",
      "learningObjectives": ["string"],
      "estimatedDuration": "string",
      "modules": [
        {
          "id": "string",
          "title": "string",
          "lessons": [
            {
              "id": "string",
              "title": "string",
              "content": "string (markdown)",
              "summary": "string",
              "imagePrompt": "string",
              "audioScript": "string",
              "podcastScript": "string",
              "quiz": [
                {
                  "question": "string",
                  "options": ["string"],
                  "correctAnswerIndex": number,
                  "explanation": "string"
                }
              ]
            }
          ]
        }
      ]
    }`;

    const params = {
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    };

    const textResponse = await this.callWithFallback(params);
    const courseData = JSON.parse(textResponse.trim());
    courseData.completedLessonIds = []; 
    return courseData;
  }

  async generateTTS(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' = 'Kore'): Promise<AudioBuffer> {
    // TTS is currently exclusive to Gemini as specialized modality
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

    // We still use fallback logic but restrict to Gemini models that support TTS
    const models = ["gemini-2.5-flash-preview-tts"];
    
    // For TTS, we wrap the Gemini SDK call
    let lastErr;
    for (const model of models) {
      try {
        const res = await this.ai.models.generateContent({ ...params, model });
        const base64Audio = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) continue;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBytes = decode(base64Audio);
        return await decodeAudioData(audioBytes, audioCtx, 24000, 1);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("TTS generation failed");
  }
}

export const gemini = new GeminiService();
