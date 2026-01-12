
import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

// دروستکردنی Client ڕاستەوخۆ پێش هەر بانگکردنێک بۆ دڵنیابوونەوە لە بەردەستبوونی API Key
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key نەدۆزرایەوە. تکایە لە ڕێکخستنەکاندا دڵنیابەرەوە.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateKurdishVideo = async (
  prompt: string, 
  config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' },
  onStatusUpdate: (status: string, progress: number) => void
) => {
  const ai = getAIClient();
  const enhancedPrompt = `Hyper-realistic cinematic video, Kurdish culture, 8k: ${prompt}`;

  onStatusUpdate('پەیوەندی بە سێرڤەری ڤیدیۆ دەکات...', 5);
  
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
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    const progress = (operation.metadata as any)?.progressPercentage || 50;
    onStatusUpdate('خەریکی دروستکردنی ڤیدیۆکەیە...', progress);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateKurdishArt = async (
  prompt: string, 
  style: string = 'Photorealistic', 
  quality: '1K' | '2K' = '1K',
  base64Image?: string | null,
  mimeType: string = 'image/jpeg'
) => {
  const ai = getAIClient();
  const model = quality === '2K' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const contents: any = {
    parts: [
      { text: `Kurdish Artistic Creation: ${prompt}. Artistic Style: ${style}. High detail, 8k.` }
    ]
  };

  if (base64Image) {
    contents.parts.unshift({
      inlineData: { data: base64Image.split(',')[1], mimeType }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { 
      imageConfig: { aspectRatio: "1:1", imageSize: quality === '2K' ? '2K' : '1K' }
    }
  });

  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (!part) throw new Error("سێرڤەر نەیتوانی وێنەکە دروست بکات.");
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
      temperature: 0.7,
      topP: 0.95
    }
  });
};

export const translateKurdishStream = async (text: string, sourceLang: string, targetLang: string, tone: string, imageBase64: string | null, mimeType: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `Translate clearly from ${sourceLang} to ${targetLang}, with a ${tone} tone. Content: ${text}` }];
  
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "You are a world-class Kurdish translator specialized in all dialects." }
  });
};

export const analyzeMathStream = async (query: string, imageBase64: string | null, mimeType: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: query }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "You are a Kurdish STEM expert. Explain math and science problems step-by-step." }
  });
};

export const getLandmarks = async (region: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List top landmarks and historical information for ${region}, Kurdistan. Return in valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cityNarrative: { type: Type.STRING },
          landmarks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                imageQuery: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const analyzeHealthImageStream = async (imageBase64: string | null, mimeType: string, question: string) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: question }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "Kurdish Medical AI. Provide general medical insights based on images or symptoms. Always advise consulting a doctor." }
  });
};
