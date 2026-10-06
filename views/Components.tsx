
import React, { useState, useEffect } from 'react';
import { getVehicleSensorMap } from '../services/geminiService';
import { VehicleInfo, SensorLocation } from '../types';

interface Props {
  vehicle: VehicleInfo;
  onAddVehicle: (car: VehicleInfo) => void;
}

const Components: React.FC<Props> = ({ vehicle, onAddVehicle }) => {
  const [sensors, setSensors] = useState<SensorLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManualMode, setIsManualMode] = useState(false);
  const [customCar, setCustomCar] = useState<VehicleInfo>({ brand: '', model: '', engine: '', year: '' });

  useEffect(() => {
    if (!isManualMode) {
      fetchSensors(vehicle);
    }
  }, [vehicle]);

  const fetchSensors = async (targetVehicle: VehicleInfo) => {
    setLoading(true);
    try {
      const data = await getVehicleSensorMap(targetVehicle);
      setSensors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (customCar.brand && customCar.model && customCar.engine && customCar.year) {
      fetchSensors(customCar);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Mapa de Sensores</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ubicación Técnica Gemini AI</p>
      </div>

      {/* Selector de Vehículo */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Vehículo en análisis</h3>
          <button 
            onClick={() => setIsManualMode(!isManualMode)}
            className="text-[10px] font-bold text-slate-500 uppercase hover:text-primary transition-colors"
          >
            {isManualMode ? "Usar Garage" : "Cambiar Vehículo"}
          </button>
        </div>

        {isManualMode ? (
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <input placeholder="Marca" value={customCar.brand} onChange={e => setCustomCar({...customCar, brand: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-3 dark:text-white"/>
                <input placeholder="Modelo" value={customCar.model} onChange={e => setCustomCar({...customCar, model: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-3 dark:text-white"/>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <input placeholder="Motor" value={customCar.engine} onChange={e => setCustomCar({...customCar, engine: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-3 dark:text-white"/>
                <input placeholder="Año" value={customCar.year} onChange={e => setCustomCar({...customCar, year: e.target.value})} className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-xs p-3 dark:text-white"/>
             </div>
             <button onClick={handleManualSearch} className="w-full py-3 bg-primary text-background-dark font-bold rounded-xl uppercase tracking-widest text-[10px]">Buscar Sensores</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <span className="material-symbols-outlined text-2xl">directions_car</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{vehicle.brand} {vehicle.model}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{vehicle.engine} • {vehicle.year}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold uppercase text-primary animate-pulse tracking-widest">Generando Mapa de Ubicación...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sensors.map((s, i) => (
            <div key={i} className="p-5 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm space-y-3 group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${s.importance === 'Alta' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <span className="material-symbols-outlined text-xl">sensors</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase">{s.name}</h4>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${s.importance === 'Alta' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                  Prioridad {s.importance}
                </span>
              </div>
              <div className="space-y-1 pl-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">location_on</span> Ubicación
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">{s.location}</p>
              </div>
              <div className="space-y-1 pl-1 pt-1 border-t border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Función Técnica</p>
                <p className="text-xs text-slate-500 leading-tight">{s.function}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Components;
