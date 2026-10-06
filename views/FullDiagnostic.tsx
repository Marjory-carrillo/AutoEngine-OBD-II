
import React, { useEffect, useState, useRef } from 'react';
import { getFullDiagnostic, getYoutubeTutorials, generateSpeech, decodeAudioData, decodeBase64, generatePartImage } from '../services/geminiService';
import { FullDiagnosticResult, VehicleInfo, SavedDiagnostic } from '../types';

interface Props {
  codes: string[];
  symptoms: string;
  vehicle: VehicleInfo;
  existingResult?: FullDiagnosticResult;
  onSaveReport?: (log: SavedDiagnostic) => void;
  goBack: () => void;
}

const FullDiagnostic: React.FC<Props> = ({ codes, symptoms, vehicle, existingResult, onSaveReport, goBack }) => {
  const [data, setData] = useState<FullDiagnosticResult | null>(existingResult || null);
  const [loading, setLoading] = useState(!existingResult);
  const [isSaved, setIsSaved] = useState(!!existingResult);
  const [videoTutorials, setVideoTutorials] = useState<any[]>(existingResult?.videoTutorials || []);
  const [videosLoading, setVideosLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [partImages, setPartImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingResult) {
      fetchPartImages(existingResult.possibleFailures);
      return;
    }
    fetchDiagnostic();
  }, [existingResult]);

  const fetchPartImages = async (failures: any[]) => {
    failures?.slice(0, 3).forEach(async (f) => {
      const partName = f.partNameEnglish || f.description;
      try {
        const img = await generatePartImage(partName);
        if (img) setPartImages(prev => ({ ...prev, [partName]: img }));
      } catch (e) {
        console.error("Image gen error:", e);
      }
    });
  };

  const fetchDiagnostic = async () => {
    try {
      const videoBase64 = localStorage.getItem('temp_diag_video') || undefined;
      const result = await getFullDiagnostic(codes, symptoms, vehicle, videoBase64);
      setData(result);
      fetchPartImages(result.possibleFailures);
      setVideosLoading(true);
      getYoutubeTutorials(result.affectedPart, vehicle).then(vids => {
        setVideoTutorials(vids);
        setVideosLoading(false);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const playSummaryAudio = async () => {
    if (!data || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const base64Audio = await generateSpeech(data.summary);
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start(0);
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_20px_#13ec6d33]"></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-black text-primary italic tracking-tighter uppercase">Procesando Diagnóstico Maestro</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Cruzando Datos con Gemini 3 Pro...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center">Error en el análisis.</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-32 bg-background-light dark:bg-background-dark">
      {/* Resumen Superior */}
      <div className="bg-slate-900 border border-primary/30 rounded-[2.5rem] p-6 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex justify-between items-center relative z-10">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{vehicle.brand} • {vehicle.year}</span>
          <button 
            onClick={playSummaryAudio}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isPlayingAudio ? 'bg-primary text-background-dark animate-pulse' : 'bg-white/10 text-white hover:bg-primary/20'}`}
          >
            <span className="material-symbols-outlined">{isPlayingAudio ? 'graphic_eq' : 'volume_up'}</span>
          </button>
        </div>
        <h2 className="text-4xl font-display font-black text-white leading-none uppercase italic tracking-tighter relative z-10">
          {data.likelyRootCause}
        </h2>
        <div className="flex items-center gap-3 relative z-10">
           <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-lg">
             <span className="text-[10px] font-black text-primary uppercase">Confianza: {data.confidence}%</span>
           </div>
           <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
             <span className="text-[10px] font-black text-slate-400 uppercase">Dificultad: {data.estimatedDifficulty}</span>
           </div>
        </div>
      </div>

      {/* Galería de Componentes Sospechosos */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Causas Probables y Esquemáticos</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.possibleFailures?.slice(0, 3).map((f: any, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm space-y-4 flex flex-col group hover:border-primary/30 transition-all">
              <div className="aspect-square w-full rounded-3xl bg-white flex items-center justify-center overflow-hidden border border-slate-100 p-6 group-hover:scale-105 transition-transform">
                {partImages[f.partNameEnglish || f.description] ? (
                  <img src={partImages[f.partNameEnglish || f.description]} alt={f.description} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <span className="material-symbols-outlined text-4xl text-slate-400">hardware</span>
                    <span className="text-[8px] font-black uppercase">Cargando Dibujo...</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tighter italic">{f.description}</span>
                  <span className="text-sm font-display font-black text-primary">{f.probability}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${f.probability}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TABLA COMPARATIVA DE PRECIOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Marketplace de Repuestos: {data.affectedPart}</h3>
          <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">Precios en Tiempo Real</span>
        </div>
        
        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tienda</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Precio Est.</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Envío</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.priceComparison.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-primary">store</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{item.store}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-display font-black text-primary italic tracking-tight">{item.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.shipping}</span>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-primary dark:text-background-dark rounded-xl text-[9px] font-black uppercase tracking-widest transition-transform active:scale-95 shadow-lg"
                      >
                        Comprar <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guía de Pasos Técnicos */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Protocolo de Reparación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.repairSteps.map((s, i) => (
            <div key={i} className="flex gap-4 p-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-primary/40 transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-primary text-background-dark flex items-center justify-center font-display font-black text-lg italic shadow-lg shadow-primary/20">
                {s.number}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold pt-1 uppercase tracking-tight">
                {s.instruction}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Herramientas Requeridas */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Herramientas Necesarias</h3>
        <div className="flex flex-wrap gap-2">
          {data.requiredTools.map((tool, i) => (
            <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest italic">
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* Acciones Finales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <button 
          onClick={() => { 
            if (!isSaved) { 
              onSaveReport?.({ 
                id: Date.now().toString(), 
                date: new Date().toISOString(), 
                vehicle, 
                result: data, 
                codes, 
                symptoms 
              }); 
              setIsSaved(true); 
            } 
          }} 
          className={`w-full py-5 rounded-3xl font-display font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isSaved ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : 'bg-primary text-background-dark'}`}
        >
          <span className="material-symbols-outlined">{isSaved ? 'verified' : 'save_as'}</span>
          {isSaved ? 'Reporte en Archivo' : 'Archivar en Historial'}
        </button>
        <button onClick={goBack} className="w-full py-5 rounded-3xl bg-slate-900 text-white font-display font-black text-sm uppercase tracking-[0.2em] opacity-90 transition-all active:scale-95">
          Nueva Consulta
        </button>
      </div>
    </div>
  );
};

export default FullDiagnostic;
