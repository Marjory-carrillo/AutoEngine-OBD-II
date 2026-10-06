
import React, { useState } from 'react';
import { Language } from '../types';

const LiveDataCourse: React.FC<{ lang: Language }> = ({ lang }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Fuel Trims (Ajustes de Combustible)",
      icon: "gas_meter",
      concept: "El STFT (Short Term) y LTFT (Long Term) indican cuánta gasolina está agregando o quitando la computadora para mantener el equilibrio.",
      normal: "Entre -10% y +10%. Lo ideal es 0%.",
      alert: "Valores superiores a +15% indican una FUGA DE VACÍO o inyectores tapados (Mezcla Pobre). Valores inferiores a -15% indican exceso de gasolina (Mezcla Rica).",
      simulation: { stft: 22, ltft: 18, diagnosis: "Posible Fuga de Vacío" }
    },
    {
      title: "Sensores de Oxígeno (O2)",
      icon: "sensors",
      concept: "Monitorean el oxígeno en el escape. El Sensor 1 (antes del catalizador) debe oscilar constantemente.",
      normal: "Oscilación rápida entre 0.1V y 0.9V.",
      alert: "Si el sensor se queda pegado en 0.1V, el motor está pobre. Si se queda en 0.9V, está rico. Si no se mueve, el sensor está dañado.",
      simulation: { o2: 0.12, diagnosis: "Sensor detectando falta de combustible" }
    },
    {
      title: "MAF (Flujo de Masa de Aire)",
      icon: "air",
      concept: "Mide cuánto aire entra al motor. Es crucial para el cálculo de la inyección.",
      normal: "En ralentí, aprox. 2g/s a 5g/s (varía por motor).",
      alert: "Un valor que no sube al acelerar indica un sensor sucio o dañado, causando falta de potencia.",
      simulation: { maf: 1.2, diagnosis: "MAF reportando lectura baja (posible suciedad)" }
    }
  ];

  const next = () => setCurrentStep((prev) => (prev + 1) % steps.length);

  const step = steps[currentStep];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Maestría en Live Data</h2>
          <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Módulo {currentStep + 1} de {steps.length}</p>
        </div>
        <button onClick={next} className="bg-primary text-background-dark p-3 rounded-2xl shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-slate-900 text-primary rounded-3xl flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-4xl">{step.icon}</span>
          </div>
          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase italic leading-tight">{step.title}</h3>
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{step.concept}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="bg-primary/5 border border-primary/10 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">Valores Normales</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{step.normal}</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Señal de Alerta</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{step.alert}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Dashboard */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-inner space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Simulador de Escáner Profesional</h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {Object.entries(step.simulation).map(([key, val]) => (
            key !== 'diagnosis' && (
              <div key={key} className="text-center space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">{key}</span>
                <div className="text-3xl font-display font-black text-primary italic drop-shadow-[0_0_8px_rgba(19,236,109,0.3)]">{val}{key === 'stft' || key === 'ltft' ? '%' : key === 'o2' ? 'V' : 'g/s'}</div>
              </div>
            )
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center space-y-2">
           <span className="text-[9px] font-black text-primary uppercase tracking-widest">Interpretación del Experto</span>
           <p className="text-sm font-bold text-white italic">"{step.simulation.diagnosis}"</p>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex gap-4 items-center">
        <span className="material-symbols-outlined text-orange-500">auto_fix_high</span>
        <p className="text-[11px] text-slate-500 font-bold leading-snug">Consejo: Siempre compara el STFT con el LTFT. Si el STFT corrige a 0% pero el LTFT está alto, el problema es persistente y no esporádico.</p>
      </div>
    </div>
  );
};

export default LiveDataCourse;
