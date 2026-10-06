
import React from 'react';

const Emissions: React.FC = () => {
  const monitors = [
    { name: 'Misfire', status: 'Ready' },
    { name: 'Fuel System', status: 'Ready' },
    { name: 'Components', status: 'Ready' },
    { name: 'Catalyst', status: 'Not Ready' },
    { name: 'Evaporative System', status: 'Ready' },
    { name: 'Oxygen Sensor', status: 'Ready' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Emissions</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">I/M Readiness Status</p>
      </div>

      <div className="grid gap-3">
        {monitors.map((m, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${m.status === 'Ready' ? 'text-primary' : 'text-orange-400'}`}>
                {m.status}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Ready' ? 'bg-primary shadow-[0_0_8px_#13ec6d]' : 'bg-orange-400'}`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-orange-400/5 border border-orange-400/20">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-orange-400">info</span>
          <h4 className="text-orange-400 font-bold text-sm">Catalyst Monitor Not Ready</h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The drive cycle has not been completed. You need to drive approximately 20-30 miles at highway speeds for this sensor to calibrate.
        </p>
      </div>
    </div>
  );
};

export default Emissions;
