
export interface ScriptStats {
  logic: number;
  absurdity: number;
  tropeDeconstruction: number;
  pacing: number;
  emotionalDamage: number;
}

export interface Asset {
  id: string; // Unique ID for linking
  name: string;
  type: 'character' | 'scene' | 'prop';
  description: string; // Description in Chinese
  visualPrompt: string; // Optimized prompt for AI Image Gen (English)
  referenceImage?: string; // Base64 or URL of user uploaded image
}

export interface StoryboardShot {
  id: number;
  shotType: string; // e.g., "Close-up", "Long Shot"
  cameraMovement: string; // Chinese label
  action: string; // Chinese description of action
  dialogue: string; // Dialogue in this shot
  visualPrompt: string; // English prompt for Image Gen
  involvedAssetIds: string[]; // IDs of assets appearing in this shot
  generatedImage?: string; // URL of the generated image (Start Frame)
  generatedEndImage?: string; // URL of the generated end frame (For sequence mode)
}

export interface GeneratedScript {
  title: string;
  coreRoast: string;
  globalStyle: string; // Enforce consistent art style (e.g., "Pixar 3D", "Cyberpunk Anime")
  aspectRatio: string; // e.g., "16:9", "9:16"
  sceneSetup: string;
  content: string;
  stats: ScriptStats;
  assets: Asset[]; 
  storyboard: StoryboardShot[]; // New Storyboard array
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
}
