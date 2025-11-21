
import React, { useState, useRef } from 'react';
import { Upload, Film, X, Sparkles, Monitor, Smartphone, Square, Layout } from 'lucide-react';

interface ScriptInputProps {
  onSubmit: (text: string, videoFile: File | null, aspectRatio: string) => void;
  isLoading: boolean;
}

const RATIO_OPTIONS = [
  { id: "16:9", label: "横屏影院 (16:9)", icon: Monitor },
  { id: "9:16", label: "竖屏短剧 (9:16)", icon: Smartphone },
  { id: "4:3", label: "复古电视 (4:3)", icon: Layout },
  { id: "1:1", label: "社媒正方 (1:1)", icon: Square },
];

export const ScriptInput: React.FC<ScriptInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && !videoFile) return;
    onSubmit(text, videoFile, aspectRatio);
  };

  const clearFile = () => {
    setVideoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6 shadow-xl">
      <div className="mb-4">
        <label className="block text-slate-300 text-sm font-bold mb-2 font-mono">
          CREATIVE BRIEF / 创意梗概
        </label>
        <textarea
          className="w-full bg-slate-900/80 text-white border border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none h-32 placeholder-slate-500"
          placeholder="例如：主角重生回到了高考前一天，但他决定去卖煎饼果子..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="mb-4">
         <label className="block text-slate-300 text-sm font-bold mb-2 font-mono flex items-center gap-2">
           ASPECT RATIO / 画幅比例
         </label>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {RATIO_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAspectRatio(opt.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  aspectRatio === opt.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <opt.icon size={20} className="mb-1" />
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            ))}
         </div>
      </div>

      <div className="mb-6">
        <label className="block text-slate-300 text-sm font-bold mb-2 font-mono flex items-center gap-2">
          <Film size={16} /> 参考视频 (可选)
        </label>
        
        {!videoFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/80 hover:border-purple-500 transition-all group"
          >
            <Upload className="text-slate-500 group-hover:text-purple-400 mb-2" size={32} />
            <span className="text-slate-500 group-hover:text-slate-300 text-sm">
              点击上传视频素材 (MP4, MOV)
            </span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-purple-900/30 rounded flex items-center justify-center text-purple-400">
                <Film size={20} />
              </div>
              <span className="text-sm text-slate-200 truncate max-w-[200px]">{videoFile.name}</span>
            </div>
            <button onClick={clearFile} className="text-slate-400 hover:text-red-400 p-1">
              <X size={20} />
            </button>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || (!text && !videoFile)}
        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] ${
          isLoading || (!text && !videoFile)
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            正在解构套路...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            生成反套路剧本
          </>
        )}
      </button>
    </div>
  );
};
