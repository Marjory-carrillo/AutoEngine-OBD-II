
import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface Props {
  mode: 'correct' | 'erroneous';
  lang: Language;
}

const LiveMonitor: React.FC<Props> = ({ mode, lang }) => {
  const isErr = mode === 'erroneous';
  
  const [sensors, setSensors] = useState({
    rpm: isErr ? 1150 : 750,
    temp: isErr ? 238 : 198,
    stft: isErr ? 22 : -1,
    o2: isErr ? 0.12 : 0.45,
    maf: isErr ? 12.4 : 3.8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => ({
        rpm: isErr 
          ? Math.floor(1140 + Math.random() * 30) 
          : Math.floor(745 + Math.random() * 10),
        temp: isErr 
          ? prev.temp + (Math.random() > 0.8 ? 1 : 0) 
          : 198 + (Math.random() > 0.9 ? 1 : -1),
        stft: isErr 
          ? prev.stft + (Math.random() > 0.5 ? 0.5 : -0.5) 
          : -1 + (Math.random() > 0.5 ? 0.2 : -0.2),
        o2: isErr 
          ? 0.1 + Math.random() * 0.05 
          : 0.1 + Math.random() * 0.8, // O2 normal fluctúa
        maf: prev.maf + (Math.random() > 0.5 ? 0.1 : -0.1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isErr]);

  const t = {
    en: {
      title: mode === 'correct' ? "Reference Data" : "Anomaly Detection",
      sub: mode === 'correct' ? "Normal Operating Conditions" : "Faulty Parameters Detected",
      insight: "AI Analysis of Discrepancy",
      insightText: isErr 
        ? "High Fuel Trim (+22%) and Low O2 Voltage (0.1V) indicate a LEAN condition. This is likely caused by a Vacuum Leak or a faulty MAF sensor. High Temp suggests cooling failure."
        : "All parameters are within OEM specifications. Fuel trims are near zero, and O2 sensors are switching correctly.",
      labelRpm: "Engine RPM",
      labelTemp: "Coolant Temp",
      labelStft: "Fuel Trim (STFT)",
      labelO2: "O2 Sensor Bank 1",
      labelMaf: "MAF Flow",
      status: isErr ? "Critical" : "Optimal"
    },
    es: {
      title: mode === 'correct' ? "Datos de Referencia" : "Detección de Anomalías",
      sub: mode === 'correct' ? "Condiciones Normales de Operación" : "Parámetros de Falla Detectados",
      insight: "Análisis de Discrepancia AI",
      insightText: isErr 
        ? "Ajuste de Combustible Alto (+22%) y O2 bajo (0.1V) indican una MEZCLA POBRE. Probable fuga de vacío o sensor MAF sucio. Temperatura alta indica fallo en refrigeración."
        : "Todos los parámetros están en especificaciones OEM. Ajustes de combustible cerca de cero y sensores O2 oscilando correctamente.",
      labelRpm: "RPM del Motor",
      labelTemp: "Temperatura Anticongelante",
      labelStft: "Ajuste Combustible (STFT)",
      labelO2: "Sensor O2 Banco 1",
      labelMaf: "Flujo MAF",
      status: isErr ? "Crítico" : "Óptimo"
    }
  }[lang];

  const Gauge = ({ value, label, unit, max, color, isWarning }: any) => (
    <div className="relative group">
      <div className={`absolute inset-0 bg-${color}/5 blur-xl group-hover:bg-${color}/10 transition-all`}></div>
      <div className={`relative p-5 rounded-3xl bg-white dark:bg-surface-dark border ${isWarning ? 'border-red-500/50' : 'border-slate-200 dark:border-white/5'} space-y-2`}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-display font-bold ${isWarning ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {isWarning && <span className="material-symbols-outlined text-red-500 text-sm animate-pulse">warning</span>}
        </div>
        <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
          <div 
            className={`${isWarning ? 'bg-red-500' : `bg-${color}`} h-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min((Math.abs(value) / max) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-display font-bold ${isErr ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{t.title}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.sub}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isErr ? 'bg-red-500 animate-pulse' : 'bg-primary animate-ping'}`}></span>
          <span className={`text-[10px] font-bold uppercase ${isErr ? 'text-red-500' : 'text-primary'}`}>{t.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Gauge 
          value={sensors.rpm} 
          label={t.labelRpm} 
          unit="RPM" 
          max={8000} 
          color="primary" 
          isWarning={isErr && sensors.rpm > 1000} 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Gauge 
            value={sensors.temp} 
            label={t.labelTemp} 
            unit="°F" 
            max={260} 
            color="orange-400" 
            isWarning={isErr && sensors.temp > 225} 
          />
          <Gauge 
            value={sensors.stft} 
            label={t.labelStft} 
            unit="%" 
            max={25} 
            color="blue-400" 
            isWarning={isErr && sensors.stft > 15} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Gauge 
            value={sensors.o2} 
            label={t.labelO2} 
            unit="V" 
            max={1} 
            color="primary" 
            isWarning={isErr && sensors.o2 < 0.2} 
          />
          <Gauge 
            value={sensors.maf} 
            label={t.labelMaf} 
            unit="g/s" 
            max={50} 
            color="primary" 
            isWarning={isErr && sensors.maf > 10} 
          />
        </div>
      </div>

      {/* Insight Section */}
      <div className={`p-6 rounded-3xl border ${isErr ? 'bg-red-500/5 border-red-500/20' : 'bg-primary/5 border-primary/20'} space-y-3`}>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${isErr ? 'text-red-500' : 'text-primary'}`}>psychology</span>
          <h4 className={`font-bold text-sm ${isErr ? 'text-red-500' : 'text-primary'}`}>{t.insight}</h4>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
          "{t.insightText}"
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-surface-dark/40 border border-white/5 flex gap-3 items-center">
        <span className="material-symbols-outlined text-slate-500">info</span>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
          {isErr ? "Valores detectados fuera de rango dinámico" : "Motor operando en lazo cerrado (Closed Loop)"}
        </p>
      </div>
    </div>
  );
};

export default LiveMonitor;
