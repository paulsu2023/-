
import React, { useState, useEffect } from 'react';
import { ScriptInput } from './components/ScriptInput';
import { ScriptOutput } from './components/ScriptOutput';
import { ScriptStats } from './components/ScriptStats';
import { generateScript, validateApiKey } from './services/geminiService';
import { GeneratedScript, ProcessingState } from './types';
import { Zap, AlertTriangle, Key, Check, Loader2, X } from 'lucide-react';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove Data URL prefix (e.g. "data:video/mp4;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

const ApiKeyInput: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
        setStatus('valid');
        setKey(stored);
    }
  }, []);

  const handleValidate = async () => {
    if (!key.trim()) return;
    setStatus('validating');
    const isValid = await validateApiKey(key);
    if (isValid) {
        localStorage.setItem('gemini_api_key', key);
        setStatus('valid');
        setIsOpen(false);
    } else {
        setStatus('invalid');
    }
  };

  const clearKey = () => {
      localStorage.removeItem('gemini_api_key');
      setKey('');
      setStatus('idle');
      setIsOpen(true);
  };

  if (status === 'valid' && !isOpen) {
      return (
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-mono hover:bg-green-900/40 transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              API KEY READY
          </button>
      );
  }

  return (
      <div className="flex items-center gap-2 animate-in fade-in duration-300">
          <div className="relative flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 focus-within:border-purple-500 transition-colors">
              <div className="pl-2 pr-1 text-slate-500">
                  <Key size={14} />
              </div>
              <input 
                type="password" 
                value={key}
                onChange={(e) => { setKey(e.target.value); setStatus('idle'); }}
                placeholder="Gemini API Key"
                className="bg-transparent border-none text-xs text-white w-32 sm:w-48 h-8 focus:ring-0 outline-none placeholder-slate-600 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              />
              {key && (
                  <button onClick={clearKey} className="p-1 text-slate-500 hover:text-slate-300">
                      <X size={12} />
                  </button>
              )}
          </div>
          <button 
            onClick={handleValidate}
            disabled={status === 'validating' || !key}
            className={`h-9 px-3 rounded-lg flex items-center justify-center transition-all ${
                status === 'invalid' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20'
            }`}
          >
            {status === 'validating' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
      </div>
  );
};

const App: React.FC = () => {
  const [scriptData, setScriptData] = useState<GeneratedScript | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isLoading: false,
    error: null,
  });

  const handleGenerate = async (text: string, videoFile: File | null, aspectRatio: string) => {
    setProcessing({ isLoading: true, error: null });
    
    try {
      let videoBase64: string | undefined;
      let mimeType: string | undefined;

      if (videoFile) {
        videoBase64 = await fileToBase64(videoFile);
        mimeType = videoFile.type;
      }

      const result = await generateScript(text, videoBase64, mimeType, aspectRatio);
      setScriptData(result);
    } catch (err: any) {
      setProcessing({ 
        isLoading: false, 
        error: err.message || "An unexpected error occurred while generating the script." 
      });
    } finally {
      setProcessing(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30 selection:text-purple-200 flex flex-col">
      
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ANTI-TROPE STUDIO
              </h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                反套路短剧创作助手
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500 border-r border-slate-800 pr-4">
                <span>LOGIC v3.1</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">GEMINI 3.0 PRO</span>
            </div>
            <ApiKeyInput />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
             <ScriptInput onSubmit={handleGenerate} isLoading={processing.isLoading} />
             
             {processing.error && (
               <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 text-red-300">
                 <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                 <p className="text-sm">{processing.error}</p>
               </div>
             )}

             {/* Show stats only if we have data */}
             {scriptData && (
               <div className="hidden lg:block bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl p-4 h-[350px]">
                 <ScriptStats stats={scriptData.stats} />
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-8 h-full">
          {scriptData ? (
             <div className="h-full space-y-6">
                <ScriptOutput script={scriptData} />
                {/* Mobile only stats */}
                <div className="lg:hidden h-[300px] bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                   <ScriptStats stats={scriptData.stats} />
                </div>
             </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
               <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Zap className="text-slate-600" size={32} />
               </div>
               <h3 className="text-slate-400 font-bold text-lg mb-2">准备好解构套路了吗？</h3>
               <p className="text-slate-600 text-center max-w-md px-6">
                 输入一个老掉牙的网文梗，或者上传一段视频，AI 将为你生成逻辑严密、反转惊人的短剧剧本及分镜 Prompt。
               </p>
               <p className="text-slate-700 text-xs mt-4 font-mono">请确保右上角已配置 API Key</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;
