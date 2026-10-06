
import React, { useState, useRef } from 'react';
import { AppView, Language, FaultCode, VehicleInfo } from '../types';
import { transcribeAudio } from '../services/geminiService';

interface FaultsProps {
  navigateTo: (view: AppView, params?: any) => void;
  lang: Language;
  vehicle: VehicleInfo;
  faults: FaultCode[];
  symptoms: string;
  onUpdateSymptoms: (val: string) => void;
  onAddFault: (code: string) => void;
  onRemoveFault: (index: number) => void;
  onClearAll: () => void;
}

const Faults: React.FC<FaultsProps> = ({ 
  navigateTo, 
  lang, 
  vehicle, 
  faults, 
  symptoms,
  onUpdateSymptoms,
  onAddFault, 
  onRemoveFault, 
  onClearAll 
}) => {
  const [showInput, setShowInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = {
    en: {
      title: "Fault Scanner",
      addBtn: "Add DTC",
      placeholder: "Enter P-Code (e.g. P0301)",
      analyze: "Analyze with Gemini",
      clear: "Clear All",
      symptomsTitle: "Vehicle Symptoms",
      symptomsPlace: "How does the car feel? (e.g. Jerking, vibrating, smoke...)",
      videoTitle: "Audio/Video Evidence",
      videoDesc: "Capture engine sound or visual leaks",
      videoBtn: "Record / Upload Video",
      runFull: "Run Master Diagnostic",
      empty: "No faults recorded. Add yours.",
      deleteConfirm: "Clear all codes?",
      recording: "Listening...",
      transcribing: "Processing Audio..."
    },
    es: {
      title: "Escáner de Fallas",
      addBtn: "Añadir DTC",
      placeholder: "Ej: P0301",
      analyze: "Analizar con Gemini",
      clear: "Limpiar Todo",
      symptomsTitle: "Síntomas del Vehículo",
      symptomsPlace: "¿Cómo se siente el carro? (Ej: vibra al frenar, humo, jaloneo...)",
      videoTitle: "Evidencia de Video/Audio",
      videoDesc: "Captura el sonido del motor o fugas visuales",
      videoBtn: "Grabar / Subir Video",
      runFull: "Ejecutar Diagnóstico Maestro",
      empty: "No hay fallas registradas.",
      deleteConfirm: "¿Borrar todos los códigos?",
      recording: "Escuchando...",
      transcribing: "Procesando Audio..."
    }
  }[lang];

  const handleAddCode = () => {
    if (!manualCode.trim()) return;
    const cleanCode = manualCode.trim().toUpperCase();
    onAddFault(cleanCode);
    navigateTo(AppView.DTC_DETAIL, { code: cleanCode });
    setManualCode('');
    setShowInput(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        localStorage.setItem('temp_diag_video', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            const text = await transcribeAudio(base64Audio, 'audio/webm');
            if (text) {
              onUpdateSymptoms(symptoms ? `${symptoms} ${text}` : text);
            }
          };
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-dark border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
            <h2 className="text-2xl font-display font-bold text-white leading-tight">
              {vehicle.brand} {vehicle.model}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/20 px-2 py-0.5 rounded">
                Motor: {vehicle.engine}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Año: {vehicle.year}
              </span>
            </div>
        </div>
      </div>

      {/* Symptoms Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.symptomsTitle}</h3>
          </div>
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{isRecording ? 'stop' : 'mic'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? t.recording : 'Voz'}</span>
          </button>
        </div>
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden">
          {isTranscribing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center space-y-2">
               <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">{t.transcribing}</span>
            </div>
          )}
          <textarea
            value={symptoms}
            onChange={(e) => onUpdateSymptoms(e.target.value)}
            placeholder={t.symptomsPlace}
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white min-h-[80px] p-0 resize-none placeholder:text-slate-500"
          />
        </div>
      </section>

      {/* Video Evidence Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 ml-1">
            <span className="material-symbols-outlined text-primary text-sm">videocam</span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.videoTitle}</h3>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${videoPreview ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
              <span className="material-symbols-outlined text-2xl">
                {videoPreview ? 'check_circle' : 'mms'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{t.videoBtn}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.videoDesc}</p>
            </div>
          </div>

          {videoPreview ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black group">
              <video src={videoPreview} controls className="w-full h-full object-cover" />
              <button 
                onClick={() => {setVideoPreview(null); localStorage.removeItem('temp_diag_video');}}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:scale-110 transition-transform">add_a_photo</span>
              <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-primary tracking-widest">Grabar o Subir</span>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleVideoUpload} 
            accept="video/*" 
            capture="environment" 
            className="hidden" 
          />
        </div>
      </section>

      {/* Codes Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400 text-sm">settings_input_component</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.title}</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInput(!showInput)} className="text-[10px] font-bold uppercase bg-primary text-background-dark px-3 py-1.5 rounded-full">
              {t.addBtn}
            </button>
          </div>
        </div>

        {showInput && (
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-primary/30 animate-in slide-in-from-top-2 space-y-3 shadow-xl">
            <input 
              type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl text-center text-xl font-display font-black tracking-widest text-slate-900 dark:text-white uppercase"
            />
            <button onClick={handleAddCode} className="w-full py-3 bg-primary/10 text-primary font-bold text-xs uppercase rounded-xl">
              {t.analyze}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {faults.map((item, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => navigateTo(AppView.DTC_DETAIL, { code: item.code })}
                className="w-full text-left bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-4 pr-12 flex items-start gap-4"
              >
                <div className="text-xl font-display font-bold text-primary">{item.code}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{item.desc}</p>
                </div>
              </button>
              <button onClick={() => onRemoveFault(index)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-red-500">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FULL ANALYSIS BUTTON */}
      {(faults.length > 0 || symptoms.length > 10 || videoPreview) && (
        <button 
          onClick={() => navigateTo(AppView.FULL_DIAGNOSTIC)}
          className="w-full py-5 rounded-3xl bg-primary text-background-dark font-display font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined filled">analytics</span>
          {t.runFull}
        </button>
      )}
    </div>
  );
};

export default Faults;
