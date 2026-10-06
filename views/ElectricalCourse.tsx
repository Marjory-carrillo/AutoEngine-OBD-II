
import React, { useState } from 'react';
import { Language } from '../types';

const ElectricalCourse: React.FC<{ lang: Language }> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'teoria' | 'simulador'>('simulador');
  const [simTarget, setSimTarget] = useState<'bateria' | 'alternador' | 'sensor' | null>(null);
  const [multimeterValue, setMultimeterValue] = useState<string>("0.00");

  const simulateValue = (target: 'bateria' | 'alternador' | 'sensor') => {
    setSimTarget(target);
    let val = "0.00";
    if (target === 'bateria') val = (12.4 + Math.random() * 0.4).toFixed(2);
    if (target === 'alternador') val = (13.8 + Math.random() * 0.8).toFixed(2);
    if (target === 'sensor') val = (4.98 + Math.random() * 0.04).toFixed(2);
    setMultimeterValue(val);
  };

  const lessons = [
    {
      id: 1,
      title: "Uso del Multímetro",
      icon: "electric_meter",
      desc: "Cómo configurar el equipo para mediciones seguras.",
      steps: [
        "Selecciona DC Voltios (V⎓) en el rango de 20V.",
        "Conecta la punta negra en COM y la roja en V.",
        "Verifica el voltaje de la batería: debe marcar +12.6V apagado."
      ]
    },
    {
      id: 2,
      title: "Prueba de Tierras (Grounds)",
      icon: "grounding",
      desc: "Descartar corrosión o cables flojos.",
      steps: [
        "Coloca una punta en el polo negativo (-) de la batería.",
        "Coloca la otra punta en el bloque del motor o chasis.",
        "La lectura debe ser menor a 0.1V (Caída de tensión).",
        "Si es mayor a 0.5V, limpia los puntos de contacto."
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Clínica Eléctrica Pro</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Diagnóstico Avanzado de Voltajes</p>
      </div>

      {/* Tabs Professional Switch */}
      <div className="flex bg-slate-100 dark:bg-surface-dark p-1 rounded-2xl border border-slate-200 dark:border-white/5">
        {(['teoria', 'simulador'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === tab 
              ? 'bg-primary text-background-dark shadow-md' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. TEORIA SECTION */}
      {activeTab === 'teoria' && (
        <div className="space-y-4 animate-in slide-in-from-left-4">
          <div className="p-5 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 flex gap-4 items-center">
            <span className="material-symbols-outlined text-yellow-500 text-3xl">warning</span>
            <div>
              <h4 className="text-yellow-500 font-bold text-sm uppercase tracking-tighter">Seguridad Eléctrica</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Nunca midas resistencia en circuitos bajo tensión. Podrías freír el multímetro o la ECU.</p>
            </div>
          </div>
          {lessons.map((lesson) => (
            <div key={lesson.id} className="p-6 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">{lesson.icon}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase">{lesson.title}</h3>
               </div>
               <div className="space-y-2">
                 {lesson.steps.map((s, i) => (
                   <div key={i} className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                     <span className="text-primary font-bold">{i+1}.</span>
                     <span>{s}</span>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. SIMULADOR SECTION */}
      {activeTab === 'simulador' && (
        <div className="space-y-6 animate-in zoom-in-95">
          {/* Multimeter Display UI */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="flex justify-between items-center mb-6">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-primary/40 uppercase tracking-tighter">AutoEngine Pro-Meter</span>
                 <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">True RMS Diagnostics</span>
               </div>
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#13ec6d]"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
               </div>
            </div>
            
            <div className="bg-[#2a2a2a] p-8 rounded-xl border border-white/5 text-center relative group">
              <div className="absolute top-2 right-4 flex flex-col items-end opacity-40">
                <span className="text-[10px] font-bold text-primary tracking-widest">DC</span>
                <span className="text-[10px] font-bold text-primary">V⎓</span>
              </div>
              <span className="text-6xl font-display font-black text-primary drop-shadow-[0_0_15px_rgba(19,236,109,0.3)] tabular-nums">
                {multimeterValue}
              </span>
              <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Voltios Directos</div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
               <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl">
                 <div className="w-3 h-3 rounded-full bg-red-600"></div>
                 <span className="text-[8px] font-bold text-slate-400 uppercase">Punta Positiva (+)</span>
               </div>
               <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl">
                 <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                 <span className="text-[8px] font-bold text-slate-400 uppercase">Punta Negativa (-)</span>
               </div>
            </div>
          </div>

          {/* Interaction Targets */}
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest text-center">Selecciona Punto de Prueba</h3>
             <div className="grid grid-cols-3 gap-3">
                {[
                  {id: 'bateria', label: 'Batería', icon: 'battery_std'},
                  {id: 'alternador', label: 'Alternador', icon: 'cyclone'},
                  {id: 'sensor', label: 'Sensor (5V)', icon: 'sensors'}
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => simulateValue(item.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                      simTarget === item.id 
                      ? 'bg-primary/20 border-primary scale-105' 
                      : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/5 grayscale'
                    }`}
                  >
                    <span className={`material-symbols-outlined mb-2 ${simTarget === item.id ? 'text-primary' : 'text-slate-400'}`}>{item.icon}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${simTarget === item.id ? 'text-primary' : 'text-slate-500'}`}>{item.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Analysis Result */}
          {simTarget && (
            <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center gap-3 mb-2">
                 <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                 <h4 className="text-primary font-bold text-xs uppercase tracking-widest">Interpretación AI</h4>
               </div>
               <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                 {simTarget === 'bateria' && Number(multimeterValue) > 12.2 ? "Voltaje de reposo correcto. La batería tiene buena carga superficial." : ""}
                 {simTarget === 'bateria' && Number(multimeterValue) <= 12.2 ? "Batería descargada o con celdas dañadas. Requiere carga o reemplazo." : ""}
                 {simTarget === 'alternador' && Number(multimeterValue) > 13.5 ? "Sistema de carga funcionando. El alternador está suministrando corriente correctamente." : ""}
                 {simTarget === 'sensor' && Number(multimeterValue) > 4.8 ? "Alimentación de referencia (Vref) de 5V presente. Circuito de computadora íntegro." : ""}
               </p>
            </div>
          )}
        </div>
      )}

      <div className="p-6 rounded-3xl bg-slate-900 dark:bg-primary/5 border border-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">psychology</span>
          <h4 className="text-primary font-bold text-sm uppercase tracking-widest">Consejo Maestro</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed italic">
          "El 70% de las fallas de sensores 'fantasma' se deben a una tierra deficiente. Antes de cambiar un sensor costoso, mide la caída de tensión entre el motor y el polo negativo."
        </p>
      </div>
    </div>
  );
};

export default ElectricalCourse;
