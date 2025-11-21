
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, GEMINI_MODEL, IMAGE_MODEL } from "../constants";
import { GeneratedScript } from "../types";

const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || process.env.API_KEY || "";
  }
  return process.env.API_KEY || "";
};

export const validateApiKey = async (key: string): Promise<boolean> => {
  if (!key) return false;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // Lightweight check
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: "ping" }] },
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
};

const outputSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "讽刺感拉满的标题" },
    coreRoast: { type: Type.STRING, description: "一句话概括反转逻辑" },
    globalStyle: { type: Type.STRING, description: "Visual style keyword for AI consistency (e.g., 'Unreal Engine 5 render, Cyberpunk style')" },
    sceneSetup: { type: Type.STRING, description: "简要交代场景和人物" },
    content: { type: Type.STRING, description: "剧本正文" },
    stats: {
      type: Type.OBJECT,
      properties: {
        logic: { type: Type.INTEGER },
        absurdity: { type: Type.INTEGER },
        tropeDeconstruction: { type: Type.INTEGER },
        pacing: { type: Type.INTEGER },
        emotionalDamage: { type: Type.INTEGER },
      },
      required: ["logic", "absurdity", "tropeDeconstruction", "pacing", "emotionalDamage"]
    },
    assets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID (e.g., 'char_1')" },
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["character", "scene", "prop"] },
          description: { type: Type.STRING, description: "Chinese description" },
          visualPrompt: { type: Type.STRING, description: "English prompt. For characters, specify 'Three-view character sheet'." }
        },
        required: ["id", "name", "type", "description", "visualPrompt"]
      }
    },
    storyboard: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          shotType: { type: Type.STRING, description: "e.g., Close-up, Wide Shot" },
          cameraMovement: { type: Type.STRING, description: "必须从以下中文选项中选择: 固定镜头, 缓慢推镜, 缓慢拉镜, 水平跟摇, 侧向跟拍, 斯坦尼康, 手持摄影, 手持跟拍, 身挂镜头, 环绕拍摄, 摇臂上升, 低角度仰拍, 高角度俯拍, 上帝视角, 第一人称, 希区柯克变焦, 荷兰倾斜, 极速甩镜, 急推变焦, 焦点转移, FPV穿越" },
          action: { type: Type.STRING, description: "Action description in Chinese. Must be suitable for a 6-8s shot." },
          dialogue: { type: Type.STRING, description: "Dialogue in this shot" },
          visualPrompt: { type: Type.STRING, description: "Full English prompt for generating this specific frame. NO TEXT, NO SUBTITLES." },
          involvedAssetIds: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of Asset IDs that appear in this shot"
          }
        },
        required: ["id", "shotType", "cameraMovement", "action", "dialogue", "visualPrompt", "involvedAssetIds"]
      }
    }
  },
  required: ["title", "coreRoast", "globalStyle", "sceneSetup", "content", "stats", "assets", "storyboard"],
};

export const generateScript = async (
  inputText: string,
  videoBase64?: string,
  mimeType?: string,
  aspectRatio: string = "16:9"
): Promise<GeneratedScript> => {
  
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key missing. Please set it in the top-right corner.");
  }

  // Always create a new instance to pick up the latest API Key if it changed
  const currentAi = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  if (videoBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: videoBase64,
        mimeType: mimeType,
      },
    });
  }

  parts.push({
    text: `User Request: ${inputText}\nTarget Aspect Ratio: ${aspectRatio}\n\nGenerate an anti-trope script, extract assets (characters with 3-view sheets), and create a detailed storyboard (shots 6-8s duration). Choose camera movements carefully from the library. Output cameraMovement in CHINESE.`,
  });

  try {
    const response = await currentAi.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: outputSchema,
        temperature: 1.0,
      },
      contents: {
        parts: parts
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as GeneratedScript;
      // Ensure aspectRatio is attached to the result
      parsed.aspectRatio = aspectRatio;
      return parsed;
    } else {
      throw new Error("No text returned from Gemini.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateStoryboardImage = async (
  prompt: string,
  referenceImages: { data: string, mimeType: string }[],
  aspectRatio: string = "16:9"
): Promise<string> => {
  
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key missing. Please set it in the top-right corner.");
  }

  const currentAi = new GoogleGenAI({ apiKey });
  try {
    const parts: any[] = [];

    // Add reference images (e.g., character sheets) to maintain consistency
    referenceImages.forEach(img => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });

    // Enriched Prompt for High Quality
    // Re-adding aspect ratio to text prompt for better adherence with Flash model
    const enrichedPrompt = `${prompt}. Aspect Ratio ${aspectRatio}. High resolution, cinematic composition. NO TEXT. NO SUBTITLES. CLEAN BACKGROUND. Only show the main characters specified.`;

    parts.push({ text: enrichedPrompt });

    const response = await currentAi.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: parts,
      },
      config: {
        // Use native imageConfig for supported aspect ratios
        imageConfig: {
           aspectRatio: aspectRatio
        }
      },
    });

    // When generating with Gemini 3 Pro Image or Flash Image, output may contain multiple parts.
    const partsResponse = response.candidates?.[0]?.content?.parts;
    if (partsResponse) {
        for (const part of partsResponse) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
    }
    throw new Error("Failed to generate image");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
