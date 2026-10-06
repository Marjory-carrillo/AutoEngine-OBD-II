
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { VehicleInfo } from "../types";

// Lazy initialization of the AI client
let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
      // We still return an instance but methods will likely fail with a clear error
      // Or we could throw a more descriptive error here
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
}

// Audio Decoding Helper
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

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const generateSpeech = async (text: string) => {
  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with a professional and reassuring mechanic voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const generatePartImage = async (partName: string) => {
  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A professional black and white technical line drawing of a car part: ${partName}. 
          Schematic style, clear white background, workshop service manual aesthetic, 
          high contrast, no text, no colors, professional engineering illustration.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const getDTCExplanation = async (code: string) => {
  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explica el código ${code} para un usuario común. JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          description: { type: Type.STRING },
          symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
          causes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                probability: { type: Type.NUMBER }
              },
              required: ["description", "probability"]
            }
          },
          solutions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["step", "description"]
            }
          }
        },
        required: ["code", "description", "symptoms", "causes", "solutions"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getFullDiagnostic = async (codes: string[], symptoms: string, vehicle: VehicleInfo, videoBase64?: string) => {
  const parts: any[] = [
    {
      text: `Actúa como Ingeniero Maestro Automotriz. Genera un Diagnóstico Maestro para un ${vehicle.brand} ${vehicle.model} ${vehicle.year} motor ${vehicle.engine}.
      Analiza los códigos: ${codes.join(', ')} y síntomas: ${symptoms}.
      Identifica las 3 causas probables y genera dibujos esquemáticos en blanco y negro.
      BUSCA INFORMACIÓN REAL sobre la pieza "${codes.length > 0 ? codes[0] : symptoms}" en: Amazon, eBay, Mercado Libre, Refacciones Treviño y Joomar.
      Incluye una TABLA COMPARATIVA de precios (en MXN o USD) y tipos de envío para cada tienda.
      Formato de respuesta: JSON en ESPAÑOL.`
    }
  ];

  if (videoBase64) {
    parts.push({
      inlineData: { mimeType: 'video/mp4', data: videoBase64 }
    });
  }

  const response = await getAI().models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          likelyRootCause: { type: Type.STRING },
          possibleFailures: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                probability: { type: Type.NUMBER },
                partNameEnglish: { type: Type.STRING }
              }
            }
          },
          affectedPart: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          priceComparison: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                store: { type: Type.STRING },
                price: { type: Type.STRING },
                shipping: { type: Type.STRING },
                url: { type: Type.STRING }
              }
            }
          },
          repairSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.NUMBER },
                instruction: { type: Type.STRING }
              }
            }
          },
          requiredTools: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedDifficulty: { type: Type.STRING }
        },
        required: ["summary", "likelyRootCause", "possibleFailures", "affectedPart", "confidence", "priceComparison", "repairSteps", "requiredTools"]
      }
    }
  });

  const rawResult = JSON.parse(response.text || "{}");
  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (grounding) {
    rawResult.groundingSources = grounding
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
  }

  return rawResult;
};

export const startDiagnosticChat = async (instruction?: string) => {
  return getAI().chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: instruction || 'Eres un técnico maestro automotriz de AutoEngine. Usa razonamiento avanzado.',
    },
  });
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Audio } },
        { text: "Transcripción técnica automotriz exacta. Solo el texto." }
      ]
    }
  });
  return response.text;
};

export const getYoutubeTutorials = async (part: string, vehicle: any) => {
  const query = `YouTube video tutorial repair ${part} ${vehicle.brand} ${vehicle.model}`;
  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: { tools: [{ googleSearch: {} }] },
  });
  
  const vids: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((c: any) => {
      if (c.web?.uri.includes('youtube.com')) vids.push({ title: c.web.title, url: c.web.uri });
    });
  }
  return vids.length > 0 ? vids.slice(0, 3) : [{ title: `Ver tutoriales en YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` }];
};

export const analyzeEngineImage = async (base64: string) => {
  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        { text: "Actúa como un experto mecánico. Analiza esta imagen de un componente automotriz e identifica posibles fallas, desgaste, fugas o daños visibles. Responde en español." }
      ]
    }
  });
  return response.text;
};

export const getVehicleSensorMap = async (vehicle: VehicleInfo) => {
  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Lista los sensores principales y su ubicación para un ${vehicle.brand} ${vehicle.model} ${vehicle.engine} ${vehicle.year}. Responde en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            importance: { type: Type.STRING, enum: ["Alta", "Media", "Baja"] },
            location: { type: Type.STRING },
            function: { type: Type.STRING }
          },
          required: ["name", "importance", "location", "function"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const translateTechnicalText = async (text: string) => {
  const response = await getAI().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Traduce el siguiente texto técnico automotriz del inglés al español, manteniendo la terminología técnica correcta: "${text}"`,
  });
  return response.text;
};
