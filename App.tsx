
import React, { useState, useEffect } from 'react';
import { AppView, Language, VehicleInfo, FaultCode, SavedDiagnostic } from './types';
import Dashboard from './views/Dashboard';
import DTCDetail from './views/DTCDetail';
import Faults from './views/Faults';
import FullDiagnostic from './views/FullDiagnostic';
import Components from './views/Components';
import Logs from './views/Logs';
import AIChat from './views/AIChat';
import Vision from './views/Vision';
import Settings from './views/Settings';
import LiveMonitor from './views/LiveMonitor';
import LiveDataCourse from './views/LiveDataCourse';
import GradientMenu from './components/ui/gradient-menu';
import { Home, Scan, History, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [history, setHistory] = useState<AppView[]>([]);
  const [selectedDTC, setSelectedDTC] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<SavedDiagnostic | null>(null);
  const [lang, setLang] = useState<Language>('es');
  
  const STORAGE_KEYS = {
    VEHICLES: 'autoengine_vehicles',
    ACTIVE_INDEX: 'autoengine_active_index',
    FAULTS: 'autoengine_faults',
    SYMPTOMS: 'autoengine_symptoms',
    LOGS: 'autoengine_logs',
    LANG: 'autoengine_lang'
  };

  const [vehicles, setVehicles] = useState<VehicleInfo[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return stored ? JSON.parse(stored) : [{ brand: 'Toyota', model: 'Hilux', engine: '2.8L Diesel', year: '2023' }];
  });

  const [activeVehicleIndex, setActiveVehicleIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_INDEX);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [vehicleFaults, setVehicleFaults] = useState<Record<number, FaultCode[]>>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FAULTS);
    return stored ? JSON.parse(stored) : {};
  });

  const [vehicleSymptoms, setVehicleSymptoms] = useState<Record<number, string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SYMPTOMS);
    return stored ? JSON.parse(stored) : {};
  });

  const [savedLogs, setSavedLogs] = useState<SavedDiagnostic[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_INDEX, activeVehicleIndex.toString()); }, [activeVehicleIndex]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FAULTS, JSON.stringify(vehicleFaults)); }, [vehicleFaults]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(vehicleSymptoms)); }, [vehicleSymptoms]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(savedLogs)); }, [savedLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LANG, lang); }, [lang]);

  const activeVehicle = vehicles[activeVehicleIndex] || vehicles[0];
  const currentFaults = vehicleFaults[activeVehicleIndex] || [];
  const currentSymptoms = vehicleSymptoms[activeVehicleIndex] || "";

  const navigateTo = (view: AppView, params?: any) => {
    setHistory(prev => [...prev, currentView]);
    if (view === AppView.DTC_DETAIL && params?.code) setSelectedDTC(params.code);
    if (view === AppView.FULL_DIAGNOSTIC && params?.log) setSelectedLog(params.log);
    else if (view === AppView.FULL_DIAGNOSTIC) setSelectedLog(null);
    setCurrentView(view);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentView(prev);
    }
  };

  const handleRemoveVehicle = (index: number) => {
    if (vehicles.length <= 1) {
      alert(lang === 'es' ? "Debes tener al menos un vehículo registrado." : "You must have at least one vehicle registered.");
      return;
    }
    if (confirm(lang === 'es' ? `¿Estás seguro de eliminar el ${vehicles[index].brand} ${vehicles[index].model}?` : `Are you sure you want to remove the ${vehicles[index].brand} ${vehicles[index].model}?`)) {
      const newVehicles = vehicles.filter((_, i) => i !== index);
      setVehicles(newVehicles);
      
      if (activeVehicleIndex === index) {
        setActiveVehicleIndex(0);
      } else if (activeVehicleIndex > index) {
        setActiveVehicleIndex(activeVehicleIndex - 1);
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: 
        return <Dashboard 
          navigateTo={navigateTo} lang={lang} vehicles={vehicles} 
          activeVehicleIndex={activeVehicleIndex} setActiveVehicleIndex={setActiveVehicleIndex}
          onAddVehicle={(v) => { setVehicles(p => [...p, v]); setActiveVehicleIndex(vehicles.length); }}
          onRemoveVehicle={handleRemoveVehicle}
        />;
      case AppView.FAULTS: 
        return <Faults 
          navigateTo={navigateTo} lang={lang} vehicle={activeVehicle} faults={currentFaults} symptoms={currentSymptoms}
          onUpdateSymptoms={(v) => setVehicleSymptoms(p => ({ ...p, [activeVehicleIndex]: v }))}
          onAddFault={(c) => setVehicleFaults(p => ({ ...p, [activeVehicleIndex]: [{code:c, severity:'N/A', desc:'Buscando...', system:'Engine'}, ...(p[activeVehicleIndex] || [])] }))}
          onRemoveFault={(i) => setVehicleFaults(p => ({ ...p, [activeVehicleIndex]: p[activeVehicleIndex].filter((_, idx) => idx !== i) }))}
          onClearAll={() => setVehicleFaults(p => ({ ...p, [activeVehicleIndex]: [] }))}
        />;
      case AppView.FULL_DIAGNOSTIC:
        return <FullDiagnostic 
          codes={selectedLog ? selectedLog.codes : currentFaults.map(f => f.code)}
          symptoms={selectedLog ? selectedLog.symptoms : currentSymptoms}
          vehicle={selectedLog ? selectedLog.vehicle : activeVehicle}
          existingResult={selectedLog ? selectedLog.result : undefined}
          onSaveReport={(log) => setSavedLogs(p => [log, ...p])} goBack={goBack}
        />;
      case AppView.LOGS:
        return <Logs lang={lang} logs={savedLogs} onViewLog={(log) => navigateTo(AppView.FULL_DIAGNOSTIC, { log })} onDeleteLog={(id) => setSavedLogs(p => p.filter(l => l.id !== id))} />;
      case AppView.DTC_DETAIL: return <DTCDetail code={selectedDTC || 'P0000'} goBack={goBack} />;
      case AppView.CHAT: return <AIChat lang={lang} />;
      case AppView.VISION: return <Vision lang={lang} />;
      case AppView.COMPONENTS: return <Components vehicle={activeVehicle} onAddVehicle={(v) => { setVehicles(p => [...p, v]); setActiveVehicleIndex(vehicles.length); }} />;
      case AppView.LIVE_MONITOR: return <LiveMonitor mode="correct" lang={lang} />;
      case AppView.LIVE_DATA_COURSE: return <LiveDataCourse lang={lang} />;
      case AppView.SETTINGS: return <Settings lang={lang} setLang={setLang} />;
      default: return <Dashboard navigateTo={navigateTo} lang={lang} vehicles={vehicles} activeVehicleIndex={activeVehicleIndex} setActiveVehicleIndex={setActiveVehicleIndex} onAddVehicle={() => {}} onRemoveVehicle={() => {}} />;
    }
  };

  // Modernized Nav Items for GradientMenu integration
  const menuItems = [
    { 
      title: lang === 'es' ? 'Inicio' : 'Home', 
      icon: <Home size={20} />, 
      gradientFrom: '#13ec6d', 
      gradientTo: '#00d2ff',
      onClick: () => setCurrentView(AppView.DASHBOARD),
      isActive: currentView === AppView.DASHBOARD
    },
    { 
      title: lang === 'es' ? 'Scanner' : 'Scanner', 
      icon: <Scan size={20} />, 
      gradientFrom: '#00d2ff', 
      gradientTo: '#3a7bd5',
      onClick: () => setCurrentView(AppView.FAULTS),
      isActive: currentView === AppView.FAULTS || currentView === AppView.FULL_DIAGNOSTIC
    },
    { 
      title: lang === 'es' ? 'Archivo' : 'Archive', 
      icon: <History size={20} />, 
      gradientFrom: '#ff9966', 
      gradientTo: '#ff5e62',
      onClick: () => setCurrentView(AppView.LOGS),
      isActive: currentView === AppView.LOGS
    },
    { 
      title: lang === 'es' ? 'Chat' : 'AI Chat', 
      icon: <MessageSquare size={20} />, 
      gradientFrom: '#a955ff', 
      gradientTo: '#ea51ff',
      onClick: () => setCurrentView(AppView.CHAT),
      isActive: currentView === AppView.CHAT
    },
    { 
      title: lang === 'es' ? 'Ajustes' : 'Setup', 
      icon: <SettingsIcon size={20} />, 
      gradientFrom: '#80FF72', 
      gradientTo: '#7EE8FA',
      onClick: () => setCurrentView(AppView.SETTINGS),
      isActive: currentView === AppView.SETTINGS
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button onClick={goBack} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <span className="material-symbols-outlined text-primary font-bold">arrow_back</span>
            </button>
          )}
          <h1 className="text-xl font-display font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Auto<span className="text-primary">Engine</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">OBD-II Cloud Connected</span>
            <span className="text-[9px] text-slate-500 font-bold">{activeVehicle?.brand} {activeVehicle?.model}</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 max-w-5xl mx-auto w-full">
        {renderView()}
      </main>

      {/* Modern High-End Gradient Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <GradientMenu items={menuItems} />
        </div>
      </div>
    </div>
  );
};

export default App;
