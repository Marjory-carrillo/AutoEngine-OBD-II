
import React, { useState, useRef } from 'react';
import { analyzeEngineImage } from '../services/geminiService';
import { Language } from '../types';

const Vision: React.FC<{ lang: Language }> = ({ lang }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = {
    en: {
      title: "Visual Diagnostic",
      retake: "Retake",
      desc: "Point camera at parts for AI analysis.",
      launch: "Launch Scanner",
      analyzing: "Analyzing Visual Data...",
      obs: "AI Observations"
    },
    es: {
      title: "Diagnóstico Visual",
      retake: "Reintentar",
      desc: "Apunta a las partes para análisis AI.",
      launch: "Iniciar Escáner",
      analyzing: "Analizando Datos Visuales...",
      obs: "Observaciones AI"
    }
  }[lang];

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      console.error('Camera error:', e);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        runAnalysis(dataUrl.split(',')[1]);
      }
    }
  };

  const runAnalysis = async (base64: string) => {
    setLoading(true);
    try {
      const result = await analyzeEngineImage(base64);
      setAnalysis(result || "Error.");
    } catch (e) {
      setAnalysis("Error.");
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{t.title}</h2>
        {capturedImage && (
          <button 
            onClick={() => { setCapturedImage(null); setAnalysis(null); startCamera(); }}
            className="text-primary text-xs font-bold uppercase tracking-widest"
          >
            {t.retake}
          </button>
        )}
      </div>

      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-surface-dark border border-white/10 shadow-2xl">
        {!stream && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <span className="material-symbols-outlined text-primary text-6xl">linked_camera</span>
            <p className="text-slate-400 text-sm">{t.desc}</p>
            <button 
              onClick={startCamera}
              className="bg-primary text-background-dark px-6 py-3 rounded-2xl font-bold tracking-widest uppercase shadow-lg shadow-primary/20"
            >
              {t.launch}
            </button>
          </div>
        )}

        <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!stream && 'hidden'}`} />
        {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />}
        <canvas ref={canvasRef} className="hidden" />

        {stream && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button onClick={capture} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-primary/20 backdrop-blur-md">
              <div className="w-12 h-12 bg-white rounded-full"></div>
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="p-8 space-y-4 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-bold text-sm uppercase tracking-widest animate-pulse">{t.analyzing}</p>
        </div>
      )}

      {analysis && (
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-slate-200 dark:border-white/5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h3 className="text-slate-900 dark:text-white font-bold">{t.obs}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default Vision;
