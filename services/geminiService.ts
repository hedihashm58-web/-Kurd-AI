
import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithKurdAIStream = async (message: string, history: Content[] = [], imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const ai = getAIClient();
  
  // 1. ئامادەکردنی بەشی ئێستای بەکارهێنەر
  const userParts: any[] = [{ text: message || "..." }];
  if (imageBase64) {
    userParts.push({ 
      inlineData: { 
        data: imageBase64.split(',')[1], 
        mimeType 
      } 
    });
  }

  // 2. پاککردنەوەی مێژووی گفتوگۆ (History Sanitization)
  // Gemini پێویستی بەوەیە کە ڕۆڵەکان یەک لە دوای یەک بن: user, model, user...
  const sanitizedHistory: Content[] = [];
  let expectedRole: "user" | "model" = "user";

  for (const entry of history) {
    const role = entry.role === 'model' ? 'model' : 'user';
    // تەنها ئەو نامانە وەردەگرین کە دەقیان تێدایە و بەپێی ڕیزبەندی ڕۆڵەکانن
    const textPart = entry.parts.find(p => p.text);
    if (textPart && textPart.text.trim() !== "" && role === expectedRole) {
      sanitizedHistory.push({
        role: role,
        parts: [{ text: textPart.text.trim() }]
      });
      // گۆڕینی ڕۆڵی چاوەڕوانکراو بۆ جاری داهاتوو
      expectedRole = expectedRole === "user" ? "model" : "user";
    }
  }

  // ئەگەر مێژووەکە بە User کۆتایی هاتبوو، لای دەبەین چونکە نامەی ئێستاش هەر Userـە
  // ئەمە ڕێگری دەکات لە هەڵەی 400 (Consecutive roles must be different)
  if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === "user") {
    sanitizedHistory.pop();
  }

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [...sanitizedHistory, { role: 'user', parts: userParts }],
    config: { 
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.5,
      topP: 0.9,
    }
  });
};

export const generateKurdishArt = async (
  prompt: string, 
  style: string = 'Cinematic', 
  quality: '1K' | '2K' = '1K',
  base64Image?: string | null,
  mimeType: string = 'image/jpeg'
) => {
  const ai = getAIClient();
  const isPro = quality === '2K';
  const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const qualityModifiers = "hyper-realistic, photorealistic, 8k resolution, highly detailed masterpiece, sharp focus, cinematic lighting, natural textures, professional photography, kurdish cultural aesthetics";
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
  if (!part) throw new Error("GENERATE_FAILED");
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateKurdishVideo = async (
  prompt: string, 
  config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' },
  onStatusUpdate: (status: string, progress: number) => void
) => {
  const ai = getAIClient();
  const enhancedPrompt = `Cinematic Kurdish theme: ${prompt}. High quality render.`;

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
    onStatusUpdate('خەریکی ڕێندەرکردنی ڤیدیۆکەیە...', 50);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("DOWNLOAD_FAILED");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const translateKurdishStream = async (text: string, sourceLang: string, targetLang: string, tone: string, imageBase64: string | null, mimeType: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `Translate from ${sourceLang} to ${targetLang}: ${text}` }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "You are a Kurdish translator. Provide direct translations." }
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
      systemInstruction: "تۆ پسپۆڕی زانستی و بیرکاریت. بە زمانی کوردی وەڵام بدەرەوە.",
      thinkingConfig: { thinkingBudget: 16000 }
    }
  });
};

export const getLandmarks = async (region: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List 8 famous historical or tourist sites in ${region}, Iraqi Kurdistan. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cityNarrative: {
            type: Type.OBJECT,
            properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } },
            required: ["ku", "ar", "en"]
          },
          landmarks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.OBJECT, properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } } },
                category: { type: Type.OBJECT, properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } } },
                description: { type: Type.OBJECT, properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } } }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeHealthImageStream = async (imageBase64: string | null, mimeType: string, question: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: question }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "Kurdish Medical AI advisor. Suggest seeing a doctor." }
  });
};
