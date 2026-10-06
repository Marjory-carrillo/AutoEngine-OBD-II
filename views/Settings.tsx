
import React from 'react';
import { Language } from '../types';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, setLang }) => {
  const t = {
    en: {
      title: "Settings",
      langTitle: "App Language",
      langDesc: "Switch entire application to your preferred language.",
      btnEs: "Switch to Spanish",
      btnEn: "Switch to English",
      current: "Current language: English",
      about: "About AutoEngine",
      aboutDesc: "Powered by Gemini AI for professional automotive diagnostics."
    },
    es: {
      title: "Configuración",
      langTitle: "Idioma de la App",
      langDesc: "Cambia toda la aplicación a tu idioma de preferencia.",
      btnEs: "Cambiar a Español",
      btnEn: "Cambiar a Inglés",
      current: "Idioma actual: Español",
      about: "Sobre AutoEngine",
      aboutDesc: "Potenciado por Gemini AI para diagnósticos automotrices profesionales."
    }
  }[lang];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{t.title}</h2>

      <div className="space-y-4">
        {/* Language Selection Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <span className="material-symbols-outlined">language</span>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold">{t.langTitle}</h3>
              <p className="text-xs text-slate-500">{t.langDesc}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="w-full py-4 rounded-2xl bg-primary text-background-dark font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">translate</span>
              {lang === 'en' ? t.btnEs : t.btnEn}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">
              {t.current}
            </p>
          </div>
        </div>

        {/* About Card */}
        <div className="p-6 rounded-3xl bg-surface-dark/40 border border-white/5 space-y-3">
          <h4 className="text-white font-bold text-sm">{t.about}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t.aboutDesc}
          </p>
          <div className="pt-4 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Version 2.4.0</span>
            <span className="text-primary">AI Engine v3.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
