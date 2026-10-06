
import React from 'react';

const Maintenance: React.FC = () => {
  const items = [
    { type: 'oil', title: 'Oil & Filter Change', date: 'Oct 12, 2023', miles: '42,500 mi', status: 'Completed', cost: '$85.00' },
    { type: 'tires', title: 'Tire Rotation', date: 'Jan 05, 2024', miles: '45,200 mi', status: 'Upcoming', cost: 'Est. $40.00' },
    { type: 'brakes', title: 'Brake Pad Inspection', date: 'Jan 20, 2024', miles: '45,800 mi', status: 'Upcoming', cost: 'Free' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Maintenance</h2>
        <button className="p-2 bg-primary/10 text-primary rounded-xl">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 flex gap-4">
            <div className={`p-3 rounded-xl h-fit ${item.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
              <span className="material-symbols-outlined">
                {item.type === 'oil' ? 'oil_barrel' : item.type === 'tires' ? 'tire_repair' : 'build'}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{item.miles}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{item.date}</span>
                <span className={item.status === 'Completed' ? 'text-primary' : 'text-orange-400'}>{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-4 shadow-xl shadow-blue-500/20">
        <h4 className="font-display font-bold text-lg">Predictive Service</h4>
        <p className="text-sm opacity-90 leading-relaxed">
          Based on your driving patterns, we recommend an alignment check within the next 30 days to prevent uneven tire wear.
        </p>
        <button className="w-full py-3 bg-white text-blue-700 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
          Schedule with Dealer
        </button>
      </div>
    </div>
  );
};

export default Maintenance;
