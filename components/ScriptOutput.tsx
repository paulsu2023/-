
import React, { useState, useEffect } from 'react';
import { GeneratedScript, Asset, StoryboardShot } from '../types';
import { generateStoryboardImage } from '../services/geminiService';
import { CAMERA_MOVEMENTS } from '../constants';
import { Copy, Terminal, Image as ImageIcon, FileText, User, Box, MapPin, Upload, Check, Video, Camera, Loader2, Key, ChevronDown, Info, Eye, EyeOff, Download, ZoomIn, RefreshCw, Maximize2, X, ArrowRight, Film } from 'lucide-react';

interface ScriptOutputProps {
  script: GeneratedScript;
}

export const ScriptOutput: React.FC<ScriptOutputProps> = ({ script }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'assets' | 'storyboard'>('script');
  const [generationMode, setGenerationMode] = useState<'single' | 'sequence'>('single');
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<string | null>(null);
  const [assetImages, setAssetImages] = useState<Record<string, string>>({}); 
  const [showPrompts, setShowPrompts] = useState<Record<number, boolean>>({}); 
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const [storyboard, setStoryboard] = useState<StoryboardShot[]>(script.storyboard || []);
  // Track which specific image is generating: { shotId: number, type: 'start' | 'end' }
  const [generatingState, setGeneratingState] = useState<{id: number, type: 'start' | 'end'} | null>(null);

  useEffect(() => {
    if(script.storyboard) {
        setStoryboard(prev => {
           if (prev.length === 0) return script.storyboard;
           return script.storyboard.map(shot => {
             const existing = prev.find(p => p.id === shot.id);
             return existing ? { 
                 ...shot, 
                 generatedImage: existing.generatedImage,
                 generatedEndImage: existing.generatedEndImage 
             } : shot;
           });
        });
    }
  }, [script]);

  const handleCopyScript = () => {
    const textToCopy = `剧名: ${script.title}\n\n槽点: ${script.coreRoast}\n\n场景: ${script.sceneSetup}\n\n${script.content}`;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptIndex(id);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const handleAssetImageUpload = async (id: string, file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            setAssetImages(prev => ({ ...prev, [id]: reader.result as string }));
        }
    };
  };

  // type: 'start' (default/single) or 'end'
  const handleGenerateShotImage = async (shot: StoryboardShot, type: 'start' | 'end') => {
    setGeneratingState({ id: shot.id, type });
    
    try {
        let prompt = shot.visualPrompt;
        let references: { data: string, mimeType: string }[] = [];

        if (type === 'start') {
            // Standard generation using Asset images
            references = shot.involvedAssetIds
                .map(assetId => assetImages[assetId])
                .filter(Boolean)
                .map(dataUrl => {
                    const [prefix, data] = dataUrl.split(',');
                    const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/png';
                    return { data, mimeType };
                });
            
        } else {
            // END FRAME GENERATION
            // Logic: Reference = The Start Frame of THIS shot.
            
            // Determine the start image for this shot
            let startImageBase64 = shot.generatedImage;
            
            // In sequence mode, for shots > 1, the start image is the previous shot's end image
            if (generationMode === 'sequence' && shot.id > 1) {
                const prevShot = storyboard.find(s => s.id === shot.id - 1);
                if (prevShot?.generatedEndImage) {
                    startImageBase64 = prevShot.generatedEndImage;
                }
            }

            if (!startImageBase64) {
                alert("必须先有起始帧 (Start Frame) 才能生成结束帧。");
                setGeneratingState(null);
                return;
            }

            const [prefix, data] = startImageBase64.split(',');
            const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/png';
            references = [{ data, mimeType }];

            // Modify prompt for End Frame
            prompt = `${shot.visualPrompt}. Show the result of the action after 8 seconds. The state of the scene at the END of the shot. Maintain character consistency with reference image.`;
        }

        // Use script.aspectRatio
        const imageUrl = await generateStoryboardImage(prompt, references, script.aspectRatio);
        
        setStoryboard(prev => prev.map(s => {
            if (s.id !== shot.id) return s;
            if (type === 'start') return { ...s, generatedImage: imageUrl };
            return { ...s, generatedEndImage: imageUrl };
        }));

    } catch (e) {
        console.error("Failed to generate shot", e);
        alert("生成失败，请检查网络或 Key");
    } finally {
        setGeneratingState(null);
    }
  };

  const handleDownloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const constructVeoPrompt = (shot: StoryboardShot) => {
    const movementObj = CAMERA_MOVEMENTS.find(cm => cm.label === shot.cameraMovement);
    const movePromptEnglish = movementObj ? movementObj.prompt : "Cinematic camera movement";
    const englishDescription = shot.visualPrompt.replace(/"/g, '\\"');
    const englishGlobalStyle = script.globalStyle.replace(/[\u4e00-\u9fa5]/g, '');
    const characterList = script.assets
        .filter(a => shot.involvedAssetIds.includes(a.id))
        .map(a => a.name)
        .join(", ");

    // Stability and optimization params for Veo 3.1
    const stabilityParams = "Slow motion, high fidelity, smooth temporal consistency. 8k resolution, photorealistic cinematic lighting. Avoid rapid morphing.";

    if (generationMode === 'sequence') {
        return `{
  "//-- VEO 3.1 CONFIG --//": "Keyframe Control (Start & End)",
  "prompt": "${englishGlobalStyle}. ${englishDescription}. ${movePromptEnglish}. ${stabilityParams} Starting from the provided start frame, evolving smoothly to the end frame. NO TEXT. Characters: ${characterList}.",
  "image_prompt_setup": {
     "image_1": "Start Frame",
     "image_2": "End Frame"
  },
  "motion_control": {
     "camera": "${movePromptEnglish}",
     "speed": "Slow",
     "consistency": "High"
  },
  "negative_prompt": "text, subtitles, watermark, distorted faces, rapid morphing, blur, low quality, extra limbs",
  "technical": {
    "aspect_ratio": "${script.aspectRatio}",
    "duration": "8s",
    "fps": 24
  }
}`;
    }

    // Single Frame Mode (Default)
    return `{
  "//-- VEO 3.1 CONFIG --//": "Single Image to Video",
  "prompt": "${englishGlobalStyle}. ${englishDescription}. ${movePromptEnglish}. ${stabilityParams} NO TEXT. Characters: ${characterList}.",
  "image_prompt": "Start Frame",
  "motion_control": {
     "camera": "${movePromptEnglish}",
     "speed": "Slow"
  },
  "negative_prompt": "text, subtitles, watermark, distortion, morphing, low quality",
  "technical": {
    "aspect_ratio": "${script.aspectRatio}",
    "duration": "8s"
  }
}`;
  };

  const togglePrompt = (id: number) => {
    setShowPrompts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'character': return <User size={16} className="text-blue-400" />;
      case 'scene': return <MapPin size={16} className="text-green-400" />;
      case 'prop': return <Box size={16} className="text-orange-400" />;
      default: return <Box size={16} />;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Zoom Lightbox */}
      {zoomedImage && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
              <button className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
                  <X size={32} />
              </button>
              <img src={zoomedImage} alt="Zoomed Shot" className="max-w-full max-h-full object-contain rounded shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/80 p-2 border-b border-slate-700 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <button onClick={() => setActiveTab('script')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'script' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><FileText size={16} /> 剧本正文</button>
          <button onClick={() => setActiveTab('assets')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'assets' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><ImageIcon size={16} /> 资产库</button>
          <button onClick={() => setActiveTab('storyboard')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'storyboard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Video size={16} /> AI 分镜导演</button>
        </div>
        
        {activeTab === 'script' && <button onClick={handleCopyScript} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Copy size={18} /></button>}
        
        {activeTab === 'storyboard' && (
             <div className="flex items-center gap-2">
                 {/* Mode Selector */}
                 <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 mr-2">
                     <button 
                        onClick={() => setGenerationMode('single')}
                        className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${generationMode === 'single' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                     >
                        <ImageIcon size={12} /> 首帧模式
                     </button>
                     <button 
                        onClick={() => setGenerationMode('sequence')}
                        className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${generationMode === 'sequence' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                     >
                        <Film size={12} /> 首尾帧序列
                     </button>
                 </div>

                 <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 border border-slate-700 py-1.5">
                     <span className="text-[10px] text-slate-500 font-bold font-mono">RATIO:</span>
                     <span className="text-xs text-slate-300 font-bold">{script.aspectRatio}</span>
                 </div>
                 <button
                    onClick={async () => { if(window.aistudio) await window.aistudio.openSelectKey(); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 border border-slate-600"
                 >
                     <Key size={12} /> Key
                 </button>
             </div>
        )}
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        {/* SCRIPT TAB */}
        {activeTab === 'script' && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 leading-tight mb-2">{script.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-red-900/30 border border-red-500/50 rounded px-3 py-1 text-red-300 text-sm font-mono">槽点: {script.coreRoast}</div>
                  <div className="bg-purple-900/30 border border-purple-500/50 rounded px-3 py-1 text-purple-300 text-sm font-mono">风格: {script.globalStyle}</div>
                  <div className="bg-blue-900/30 border border-blue-500/50 rounded px-3 py-1 text-blue-300 text-sm font-mono">画幅: {script.aspectRatio}</div>
              </div>
            </div>
            <div className="mb-6 bg-slate-900/50 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">场景设定</h3>
              <p className="text-slate-300 italic">{script.sceneSetup}</p>
            </div>
            <div className="space-y-4">
               {script.content.split('\n').map((line, i) => {
                 if (line.trim() === '') return <br key={i} />;
                 const isDialogue = line.includes('：') || line.includes(':');
                 if (isDialogue) {
                   const [speaker, text] = line.split(/[:：](.*)/s);
                   return <div key={i} className="flex gap-3 p-1 hover:bg-slate-800/30 rounded"><span className="font-bold text-yellow-500 min-w-[80px] text-right text-sm pt-1">{speaker}</span><span className="text-slate-200 bg-slate-800/30 px-3 py-1 rounded-r-lg border-l border-slate-700 w-full">{text}</span></div>;
                 }
                 return <p key={i} className={`text-slate-300 pl-20 ${line.startsWith('(') ? 'italic text-slate-400 text-sm' : ''}`}>{line}</p>;
               })}
            </div>
          </>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {script.assets && script.assets.map((asset: Asset) => (
                  <div key={asset.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="shrink-0">
                        <label className="block w-full md:w-40 h-40 rounded-lg border-2 border-dashed border-slate-700 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center overflow-hidden relative bg-slate-950 group">
                          {assetImages[asset.id] ? (
                            <><img src={assetImages[asset.id]} alt={asset.name} className="w-full h-full object-contain" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"><span className="text-xs text-white font-bold">更换</span></div></>
                          ) : (
                            <><Upload size={24} className="text-slate-500 mb-2" /><span className="text-[10px] text-slate-500 px-2 text-center">上传图片</span></>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) handleAssetImageUpload(asset.id, e.target.files[0]); }} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2"><div className="p-1.5 rounded bg-slate-800 border border-slate-700">{getAssetIcon(asset.type)}</div><h4 className="font-bold text-slate-200">{asset.name}</h4></div>
                        <p className="text-sm text-slate-400">{asset.description}</p>
                        <div className="bg-black/30 rounded-lg p-3 border border-slate-800 relative group">
                          <p className="text-xs text-green-400/90 font-mono line-clamp-3">{asset.visualPrompt}</p>
                          <button onClick={() => handleCopyPrompt(asset.visualPrompt, asset.id)} className="absolute top-2 right-2 p-1 bg-slate-800 text-slate-400 rounded">{copiedPromptIndex === asset.id ? <Check size={12} /> : <Copy size={12} />}</button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* STORYBOARD TAB */}
        {activeTab === 'storyboard' && (
          <div className="space-y-8">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
               <h3 className="text-blue-300 font-bold flex items-center gap-2 mb-2"><Video size={18} /> 导演模式: {generationMode === 'single' ? '首帧生成' : '首尾帧序列'}</h3>
               <p className="text-slate-400 text-sm">
                  当前画幅: <span className="font-bold text-white">{script.aspectRatio}</span>。
                  {generationMode === 'single' 
                    ? "仅生成每一镜的「起始帧」。适合简单动作或无需严格连续性的镜头。" 
                    : "生成「起始帧」和「结束帧」。第 N 镜的起始帧会自动承接第 N-1 镜的结束帧，构建连贯的时间线。"}
               </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
               {storyboard.map((shot, index) => {
                   // SEQUENCE LOGIC:
                   // Start Image: IF index > 0, it comes from prev shot's end image. IF index == 0, it's independent.
                   // End Image: Always generated for the current shot.
                   const prevShot = index > 0 ? storyboard[index - 1] : null;
                   
                   let effectiveStartImage = shot.generatedImage;
                   let isStartImageInherited = false;

                   if (generationMode === 'sequence' && index > 0) {
                       effectiveStartImage = prevShot?.generatedEndImage;
                       isStartImageInherited = true;
                   }

                   return (
                 <div key={shot.id} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-lg">
                    {/* VISUALS CONTAINER */}
                    <div className="flex flex-col md:flex-row h-[300px] bg-black border-b border-slate-700">
                        
                        {/* --- START FRAME --- */}
                        <div className="relative flex-1 border-r border-slate-800 flex items-center justify-center group bg-slate-950">
                            {effectiveStartImage ? (
                                <>
                                  <img src={effectiveStartImage} alt="Start Frame" className="w-full h-full object-contain" />
                                  <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 rounded text-[10px] font-mono font-bold text-white z-20 shadow">START FRAME</div>
                                  
                                  {/* Overlay Controls */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                                        <button onClick={() => setZoomedImage(effectiveStartImage!)} className="p-2 bg-slate-900 text-white rounded-full hover:bg-blue-600"><Maximize2 size={18} /></button>
                                        <button onClick={() => handleDownloadImage(effectiveStartImage!, `shot-${shot.id}-start.png`)} className="p-2 bg-slate-900 text-white rounded-full hover:bg-green-600"><Download size={18} /></button>
                                  </div>
                                </>
                            ) : (
                                <div className="text-center p-4 opacity-50">
                                    {isStartImageInherited ? (
                                        <>
                                            <ArrowRight className="mx-auto text-slate-600 mb-2" size={32} />
                                            <p className="text-slate-500 text-[10px] font-mono">WAITING FOR SHOT {index} END FRAME</p>
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="mx-auto text-slate-600 mb-2" size={32} />
                                            <p className="text-slate-500 text-[10px] font-mono">NO START FRAME</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Generate Start Button (Only enabled for Shot 1 OR Single Mode) */}
                            {(!isStartImageInherited || !effectiveStartImage) && (
                                <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 ${effectiveStartImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
                                    <button 
                                        onClick={() => handleGenerateShotImage(shot, 'start')}
                                        disabled={generatingState?.id === shot.id}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold text-[10px] flex items-center gap-1 shadow-lg border border-blue-400"
                                    >
                                        {generatingState?.id === shot.id && generatingState?.type === 'start' ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                                        {effectiveStartImage ? "REGEN START" : "GEN START"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* --- END FRAME (Sequence Mode Only) --- */}
                        {generationMode === 'sequence' && (
                            <div className="relative flex-1 flex items-center justify-center group bg-slate-950 border-l border-slate-800">
                                {shot.generatedEndImage ? (
                                    <>
                                      <img src={shot.generatedEndImage} alt="End Frame" className="w-full h-full object-contain" />
                                      <div className="absolute top-2 right-2 bg-purple-600/80 px-2 py-1 rounded text-[10px] font-mono font-bold text-white z-20 shadow">END FRAME</div>
                                      
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                                            <button onClick={() => setZoomedImage(shot.generatedEndImage!)} className="p-2 bg-slate-900 text-white rounded-full hover:bg-blue-600"><Maximize2 size={18} /></button>
                                            <button onClick={() => handleDownloadImage(shot.generatedEndImage!, `shot-${shot.id}-end.png`)} className="p-2 bg-slate-900 text-white rounded-full hover:bg-green-600"><Download size={18} /></button>
                                      </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4 opacity-50">
                                        <Film className="mx-auto text-slate-600 mb-2" size={32} />
                                        <p className="text-slate-500 text-[10px] font-mono">NO END FRAME</p>
                                    </div>
                                )}
                                
                                {/* Generate End Button */}
                                <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 ${shot.generatedEndImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
                                    <button 
                                        onClick={() => handleGenerateShotImage(shot, 'end')}
                                        disabled={generatingState?.id === shot.id || !effectiveStartImage}
                                        className={`px-4 py-1.5 rounded-full font-bold text-[10px] flex items-center gap-1 shadow-lg border transition-all ${!effectiveStartImage ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'}`}
                                    >
                                        {generatingState?.id === shot.id && generatingState?.type === 'end' ? <Loader2 className="animate-spin" size={12} /> : <ArrowRight size={12} />}
                                        {shot.generatedEndImage ? "REGEN END" : "GEN END (AFTER 8s)"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Control Section */}
                    <div className="p-4 flex flex-col gap-3">
                       <div className="flex flex-wrap gap-3 pb-2 border-b border-slate-800 items-center">
                          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-xs text-blue-300 font-mono"><Camera size={12} /> {shot.shotType}</div>
                          
                          <div className="relative group min-w-[150px]">
                              <div className="flex items-center justify-between gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-xs text-orange-300 font-mono cursor-pointer border border-slate-700 hover:border-orange-500/50">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                      <Video size={12} className="shrink-0" /> 
                                      <select value={shot.cameraMovement} onChange={(e) => setStoryboard(prev => prev.map(s => s.id === shot.id ? { ...s, cameraMovement: e.target.value } : s))} className="bg-transparent outline-none appearance-none w-full cursor-pointer text-ellipsis">
                                          <option value={shot.cameraMovement}>{shot.cameraMovement} (Default)</option>
                                          {CAMERA_MOVEMENTS.map(cm => <option key={cm.id} value={cm.label}>{cm.label}</option>)}
                                      </select>
                                  </div>
                                  <ChevronDown size={10} className="shrink-0 pointer-events-none" />
                              </div>
                          </div>
                          
                          <button onClick={() => togglePrompt(shot.id)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${showPrompts[shot.id] ? 'bg-purple-900/40 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                             {showPrompts[shot.id] ? <Eye size={12} /> : <EyeOff size={12} />} {showPrompts[shot.id] ? 'HIDE VEO PROMPT' : 'SHOW VEO PROMPT'}
                          </button>
                       </div>

                       {showPrompts[shot.id] && (
                           <div className="bg-black/30 rounded-lg p-3 border border-slate-800 relative">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-[10px] text-purple-400 font-mono uppercase font-bold">Veo 3.1 Prompt ({generationMode})</span>
                                   <button onClick={() => handleCopyPrompt(constructVeoPrompt(shot), `veo-${shot.id}`)} className="flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-[10px]">
                                      {copiedPromptIndex === `veo-${shot.id}` ? <Check size={10} /> : <Copy size={10} />} COPY JSON
                                   </button>
                               </div>
                               <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-tight max-h-40 custom-scrollbar">{constructVeoPrompt(shot)}</pre>
                           </div>
                       )}

                       <div className="flex gap-4">
                           <div className="flex-1"><label className="text-[10px] text-slate-500 font-bold block mb-1">Action</label><textarea value={shot.action} onChange={(e) => setStoryboard(prev => prev.map(s => s.id === shot.id ? { ...s, action: e.target.value } : s))} className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none resize-none h-12" /></div>
                           <div className="flex-1"><label className="text-[10px] text-slate-500 font-bold block mb-1">Dialogue</label><textarea value={shot.dialogue} onChange={(e) => setStoryboard(prev => prev.map(s => s.id === shot.id ? { ...s, dialogue: e.target.value } : s))} className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-xs text-yellow-100/80 outline-none resize-none h-12 font-serif" /></div>
                       </div>
                    </div>
                 </div>
               )})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
