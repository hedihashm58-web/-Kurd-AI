
import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "") {
    throw new Error("کلیلەکەت (API Key) چالاک نییە. تکایە پشکنینی بۆ بکە.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateKurdishVideo = async (
  prompt: string, 
  config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' },
  onStatusUpdate: (status: string, progress: number) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const enhancedPrompt = `Cinematic Kurdish theme: ${prompt}`;

  onStatusUpdate('پەیوەندی بە سێرڤەرەوە دەکات...', 10);
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: enhancedPrompt,
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    onStatusUpdate('خەریکی دروستکردنیە...', 50);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("کێشەیەک لە داگرتنی ڤیدیۆکە ڕوویدا.");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateKurdishArt = async (
  prompt: string, 
  style: string = 'Cinematic', 
  quality: '1K' | '2K' = '1K',
  base64Image?: string | null,
  mimeType: string = 'image/jpeg'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isPro = quality === '2K';
  const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const qualityModifiers = "hyper-realistic, photorealistic, 8k resolution, highly detailed masterpiece, sharp focus, cinematic lighting, natural textures, professional photography";
  const enhancedPrompt = `Kurdish Theme: ${prompt}. Style: ${qualityModifiers}, ${style}`;

  const contents: any = {
    parts: [{ text: enhancedPrompt }]
  };

  if (base64Image) {
    contents.parts.unshift({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  }

  const imageConfig: any = { aspectRatio: "1:1" };
  if (isPro) {
    imageConfig.imageSize = "2K";
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { 
      imageConfig,
      ...(isPro ? { tools: [{ googleSearch: {} }] } : {})
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error("سێرڤەر نەیتوانی وێنەکە دروست بکات. تکایە دووبارە هەوڵ بدەرەوە.");
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const chatWithKurdAIStream = async (message: string, history: Content[] = [], imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const ai = getAIClient();
  const parts: any[] = [{ text: message }];
  
  if (imageBase64) {
    parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });
  }

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts }],
    config: { 
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
      topP: 0.8
    }
  });
};

export const translateKurdishStream = async (text: string, sourceLang: string, targetLang: string, tone: string, imageBase64: string | null, mimeType: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `Translate from ${sourceLang} to ${targetLang} (${tone}): ${text}` }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "You are a fast and accurate Kurdish translator. Translate ONLY and DIRECTLY." }
  });
};

export const analyzeMathStream = async (query: string, imageBase64: string | null, mimeType: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: query }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts }],
    config: { 
      systemInstruction: "تۆ پسپۆڕی زانستی، بیرکاری و ئاماریت (Statistician & Mathematician). ئەرکی تۆ شیکارکردنی وردی هاوکێشەکان، شیکاری داتا، خشتە ئامارییەکان و گرافەکانە. وەڵامەکانت با زۆر بە کورتی و هەنگاو بە هەنگاو بن بە زمانی کوردی.",
      thinkingConfig: { thinkingBudget: 24576 }
    }
  });
};

export const getLandmarks = async (region: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List the top 8 famous landmarks, tourist sites, and historical places in ${region}, Iraqi Kurdistan. 
               Provide translations in Kurdish (ku), Arabic (ar), and English (en) for all fields. 
               The city narrative should also be in these three languages.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cityNarrative: {
            type: Type.OBJECT,
            properties: {
              ku: { type: Type.STRING },
              ar: { type: Type.STRING },
              en: { type: Type.STRING }
            },
            required: ["ku", "ar", "en"]
          },
          landmarks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.OBJECT,
                  properties: {
                    ku: { type: Type.STRING },
                    ar: { type: Type.STRING },
                    en: { type: Type.STRING }
                  },
                  required: ["ku", "ar", "en"]
                },
                category: {
                   type: Type.OBJECT,
                   properties: {
                     ku: { type: Type.STRING },
                     ar: { type: Type.STRING },
                     en: { type: Type.STRING }
                   },
                   required: ["ku", "ar", "en"]
                },
                description: {
                  type: Type.OBJECT,
                  properties: {
                    ku: { type: Type.STRING },
                    ar: { type: Type.STRING },
                    en: { type: Type.STRING }
                  },
                  required: ["ku", "ar", "en"]
                }
              },
              required: ["name", "category", "description"]
            }
          }
        },
        required: ["cityNarrative", "landmarks"]
      }
    }
  });
  const jsonStr = (response.text || "").trim();
  if (!jsonStr) throw new Error("سێرڤەر وەڵامی دروستی نەداوە.");
  return JSON.parse(jsonStr);
};

export const analyzeHealthImageStream = async (imageBase64: string | null, mimeType: string, question: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: question }];
  if (imageBase64) {
    parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });
  }

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "Kurdish Medical AI. Short, direct insights only. Advise doctor visit." }
  });
};
