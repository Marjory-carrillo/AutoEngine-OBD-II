
import React, { useState } from 'react';
import { AppView, Language, VehicleInfo } from '../types';

interface DashboardProps {
  navigateTo: (view: AppView, params?: any) => void;
  lang: Language;
  vehicles: VehicleInfo[];
  activeVehicleIndex: number;
  setActiveVehicleIndex: (index: number) => void;
  onAddVehicle: (car: VehicleInfo) => void;
  onRemoveVehicle: (index: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  navigateTo, lang, vehicles, activeVehicleIndex, setActiveVehicleIndex, onAddVehicle, onRemoveVehicle
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCar, setNewCar] = useState<VehicleInfo>({ brand: '', model: '', engine: '', year: '' });

  const activeVehicle = vehicles[activeVehicleIndex];
  const healthScore = activeVehicle ? Math.max(10, 100 - (2024 - parseInt(activeVehicle.year)) * 4) : 100;

  const t = {
    en: { garage: "Hangar", tools: "Diagnostic Console", learn: "Learn OBD Data", search: "Fault Scan", historical: "Archive" },
    es: { garage: "Mi Hangar", tools: "Consola de Diagnóstico", learn: "Aprender Live Data", search: "Escanear Fallas", historical: "Archivo de Informes" }
  }[lang];

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Garage Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{t.garage}</h2>
          <button onClick={() => setIsAdding(!isAdding)} className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined">{isAdding ? 'close' : 'add'}</span>
          </button>
        </div>

        {isAdding && (
          <div className="bg-white dark:bg-surface-dark border border-primary/30 rounded-[2rem] p-6 space-y-4 animate-in slide-in-from-top-4 shadow-2xl max-w-lg">
             <div className="grid grid-cols-2 gap-3">
                <input placeholder="Marca (ej: Toyota)" value={newCar.brand} onChange={e => setNewCar({...newCar, brand: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-4 dark:text-white font-bold"/>
                <input placeholder="Modelo (ej: Corolla)" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-4 dark:text-white font-bold"/>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <input placeholder="Motor (ej: 1.8L 2ZR-FE)" value={newCar.engine} onChange={e => setNewCar({...newCar, engine: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-4 dark:text-white font-bold"/>
                <input placeholder="Año (ej: 2018)" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-4 dark:text-white font-bold"/>
             </div>
             <button onClick={() => { if (newCar.brand && newCar.model && newCar.year) { onAddVehicle(newCar); setIsAdding(false); } }} className="w-full py-4 bg-primary text-background-dark font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Registrar Unidad</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((car, idx) => (
            <div key={idx} className="relative group">
              <button 
                onClick={() => setActiveVehicleIndex(idx)} 
                className={`w-full p-6 rounded-[2rem] border transition-all flex items-center justify-between ${activeVehicleIndex === idx ? 'bg-slate-900 border-primary shadow-2xl' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/5 opacity-60'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeVehicleIndex === idx ? 'bg-primary text-background-dark' : 'bg-slate-100 dark:bg-white/10'}`}>
                    <span className="material-symbols-outlined">car_repair</span>
                  </div>
                  <div className="text-left">
                    <h3 className={`font-display font-black text-lg uppercase ${activeVehicleIndex === idx ? 'text-white' : 'text-slate-900 dark:text-slate-300'}`}>{car.brand} {car.model}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{car.engine} • {car.year}</p>
                  </div>
                </div>
                <div className="text-right pr-4">
                  <span className={`text-xl font-display font-black ${activeVehicleIndex === idx ? 'text-primary' : 'text-slate-400'}`}>{activeVehicleIndex === idx ? healthScore : '--'}%</span>
                </div>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveVehicle(idx);
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  activeVehicleIndex === idx ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-red-500'
                } opacity-0 group-hover:opacity-100`}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Main Console Tools */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">{t.tools}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <button onClick={() => navigateTo(AppView.FAULTS)} className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-primary/20 shadow-xl group transition-all hover:-translate-y-1">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 group-hover:scale-110 transition-transform">barcode_scanner</span>
            <h3 className="font-black text-lg uppercase tracking-tighter italic">{t.search}</h3>
            <p className="text-slate-500 text-xs font-bold mt-1">Ingresa DTCs y Síntomas</p>
          </button>

          <button onClick={() => navigateTo(AppView.LIVE_DATA_COURSE)} className="p-8 rounded-[2.5rem] bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group transition-all hover:-translate-y-1">
            <span className="material-symbols-outlined text-orange-500 text-5xl mb-4 group-hover:scale-110 transition-transform">school</span>
            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter italic">{t.learn}</h3>
            <p className="text-slate-500 text-xs font-bold mt-1">Curso Maestro Live Data</p>
          </button>

          <button onClick={() => navigateTo(AppView.COMPONENTS)} className="p-8 rounded-[2.5rem] bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group transition-all hover:-translate-y-1">
            <span className="material-symbols-outlined text-blue-500 text-5xl mb-4 group-hover:scale-110 transition-transform">hub</span>
            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter italic">Componentes</h3>
            <p className="text-slate-500 text-xs font-bold mt-1">Mapa de Sensores AI</p>
          </button>

          <button onClick={() => navigateTo(AppView.LOGS)} className="p-8 rounded-[2.5rem] bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group transition-all hover:-translate-y-1">
            <span className="material-symbols-outlined text-slate-400 text-5xl mb-4 group-hover:scale-110 transition-transform">history</span>
            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter italic">{t.historical}</h3>
            <p className="text-slate-500 text-xs font-bold mt-1">Archivo de Consultas</p>
          </button>

           <button onClick={() => navigateTo(AppView.VISION)} className="p-8 rounded-[2.5rem] bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group transition-all hover:-translate-y-1">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 group-hover:scale-110 transition-transform">visibility</span>
            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter italic">Visión</h3>
            <p className="text-slate-500 text-xs font-bold mt-1">Análisis Visual de Motor</p>
          </button>

           <button onClick={() => navigateTo(AppView.LIVE_MONITOR)} className="p-8 rounded-[2.5rem] bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group transition-all hover:-translate-y-1">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4 group-hover:scale-110 transition-transform">equalizer</span>
            <h3 className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter italic">Monitor Real</h3>
            <p className="text-slate-500 text-xs font-bold mt-1">Visualizador de Datos</p>
          </button>
        </div>
      </section>

      {/* Insight Section */}
      <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-center gap-6">
        <div className="w-16 h-16 bg-primary text-background-dark rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-3xl">lightbulb</span>
        </div>
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Mantenimiento Predictivo</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Según los DTC actuales y el millaje estimado, el sistema recomienda revisar el estado del sensor MAF para evitar consumo excesivo de combustible.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
