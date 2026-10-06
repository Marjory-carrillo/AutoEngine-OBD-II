
import React, { useState } from 'react';
import { translateTechnicalText } from '../services/geminiService';
import { Language } from '../types';

const Translator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: "Technical Translator",
      sub: "English ➔ Spanish Automotive",
      labelIn: "English Text",
      labelOut: "Professional Translation",
      place: "Paste manuals, codes or descriptions in English...",
      btn: "Translate with AI",
      why: "Why use this?",
      whyDesc: "Unlike generic tools, AutoGemini understands 'Crankshaft', 'Lean condition' or 'Brake fade' in their real context."
    },
    es: {
      title: "Traductor Técnico",
      sub: "Inglés ➔ Español Automotriz",
      labelIn: "Texto en Inglés",
      labelOut: "Traducción Profesional",
      place: "Pega manuales, códigos o descripciones en inglés...",
      btn: "Traducir con IA",
      why: "¿Por qué usar este traductor?",
      whyDesc: "A diferencia de herramientas genéricas, AutoGemini entiende términos como 'Cigüeñal', 'Mezcla pobre' o 'Falla de frenos' en su contexto real."
    }
  }[lang];

  const handleTranslate = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    try {
      const result = await translateTechnicalText(inputText);
      setTranslatedText(result || 'Error.');
    } catch (error) {
      setTranslatedText('Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{t.title}</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.sub}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.labelIn}</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.place}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white text-sm min-h-[120px] resize-none p-0"
          />
        </div>

        <button onClick={handleTranslate} disabled={loading || !inputText.trim()} className="w-full py-4 rounded-2xl bg-primary text-background-dark font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <div className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div> : <><span className="material-symbols-outlined">translate</span><span>{t.btn}</span></>}
        </button>

        {translatedText && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest">{t.labelOut}</label>
              <button onClick={() => navigator.clipboard.writeText(translatedText)} className="text-primary p-1 hover:bg-primary/10 rounded-md transition-colors">
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{translatedText}</p>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-surface-dark border border-white/5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/20 rounded-lg text-primary"><span className="material-symbols-outlined text-xl">auto_fix_high</span></div>
          <div><h4 className="text-white font-bold text-sm">{t.why}</h4><p className="text-xs text-slate-500 mt-1">{t.whyDesc}</p></div>
        </div>
      </div>
    </div>
  );
};

export default Translator;
