
import React, { useEffect, useState } from 'react';
import { getDTCExplanation } from '../services/geminiService';
import { DTCExplanation } from '../types';

const DTCDetail: React.FC<{ code: string; goBack: () => void }> = ({ code, goBack }) => {
  const [data, setData] = useState<DTCExplanation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getDTCExplanation(code);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [code]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 space-y-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <p className="text-primary font-display font-bold text-xl">Consultando a Gemini AI...</p>
          <p className="text-slate-500 text-sm animate-pulse">Calculando probabilidades y patrones de falla</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center">Fallo al cargar el diagnóstico.</div>;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Falla Detectada</span>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sistema de Tren Motriz</span>
        </div>
        <h2 className="text-5xl font-display font-black text-slate-900 dark:text-white leading-tight">
          {data.code}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
          {data.description}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Causes with Probabilities */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400">
            <span className="material-symbols-outlined text-sm">analytics</span> Probabilidad de Causas
          </h3>
          <div className="grid gap-3">
            {data.causes.map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{c.description}</span>
                  <span className="text-lg font-display font-black text-orange-400">{c.probability}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-400 h-full transition-all duration-1000"
                    style={{ width: `${c.probability}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-sm">list</span> Síntomas Comunes
          </h3>
          <ul className="grid gap-2">
            {data.symptoms.map((s, i) => (
              <li key={i} className="flex gap-3 p-3 rounded-xl bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-primary">•</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
            <span className="material-symbols-outlined text-sm">build</span> Acciones Recomendadas
          </h3>
          <div className="space-y-3">
            {data.solutions.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">{s.step}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={goBack}
        className="w-full py-4 rounded-2xl bg-primary text-background-dark font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-primary/20"
      >
        Guardar Reporte
      </button>
    </div>
  );
};

export default DTCDetail;
