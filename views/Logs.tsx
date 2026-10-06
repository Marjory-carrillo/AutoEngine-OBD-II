
import React from 'react';
import { Language, SavedDiagnostic } from '../types';

interface LogsProps {
  lang: Language;
  logs: SavedDiagnostic[];
  onViewLog: (log: SavedDiagnostic) => void;
  onDeleteLog: (id: string) => void;
}

const Logs: React.FC<LogsProps> = ({ lang, logs, onViewLog, onDeleteLog }) => {
  const t = {
    en: {
      title: "Diagnostic History",
      empty: "No saved reports yet.",
      view: "View Report",
      delete: "Delete",
      system: "Master Diagnostic",
      confirm: "Delete this report?"
    },
    es: {
      title: "Historial de Reportes",
      empty: "Aún no hay reportes guardados.",
      view: "Ver Reporte",
      delete: "Eliminar",
      system: "Diagnóstico Maestro",
      confirm: "¿Eliminar este reporte?"
    }
  }[lang];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{t.title}</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Informes Guardados</p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl opacity-50">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
          <p className="text-sm font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="group relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-primary/50 transition-all"
            >
              <div 
                className="cursor-pointer space-y-3"
                onClick={() => onViewLog(log)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{formatDate(log.date)}</p>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">
                      {log.vehicle.brand} {log.vehicle.model}
                    </h3>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {log.codes.slice(0, 2).map(c => (
                    <span key={c} className="text-[10px] font-bold bg-orange-400/10 text-orange-400 px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                  {log.codes.length > 2 && <span className="text-[10px] text-slate-500">+{log.codes.length - 2}</span>}
                </div>

                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  <span className="text-primary font-bold">Resumen:</span> {log.result.likelyRootCause}
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(t.confirm)) onDeleteLog(log.id);
                }}
                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 group-hover:scale-100"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface-dark/40 border border-white/5 flex gap-4 items-center">
          <span className="material-symbols-outlined text-primary text-3xl">cloud_done</span>
          <div className="space-y-0.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Almacenamiento Local</h4>
            <p className="text-[10px] text-slate-500">Tus datos están seguros en este dispositivo.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
