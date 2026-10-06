
import React, { useState, useRef, useEffect } from 'react';
import { startDiagnosticChat, transcribeAudio } from '../services/geminiService';
import { Language } from '../types';

const AIChat: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    en: {
      welcome: 'Hello! I am your AutoEngine assistant. How can I help you today?',
      placeholder: 'Describe symptoms...',
      tags: ['White smoke', 'Brake squeal', 'Hard start', 'Low mpg'],
      recording: 'Listening...',
      transcribing: 'Thinking...'
    },
    es: {
      welcome: '¡Hola! Soy tu asistente AutoEngine en español. ¿En qué puedo ayudarte hoy?',
      placeholder: 'Describe los síntomas...',
      tags: ['Humo blanco', 'Frenos chillan', 'Arranque difícil', 'Mucho consumo'],
      recording: 'Escuchando...',
      transcribing: 'Pensando...'
    }
  }[lang];

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: t.welcome }
  ]);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const init = async () => {
      const c = await startDiagnosticChat();
      setChat(c);
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chat || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);
    try {
      const response = await chat.sendMessage({ message: textToSend });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: lang === 'en' ? 'Error.' : 'Error de conexión.' }]);
    } finally {
      setLoading(false);
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
              sendMessage(text);
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
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-primary text-background-dark font-medium shadow-lg' 
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {(loading || isTranscribing) && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></span>
              </div>
              {isTranscribing && <span className="text-[10px] font-black uppercase text-primary tracking-widest">{t.transcribing}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-white/5">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1 flex items-center bg-slate-100 dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 p-1 px-4 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white py-3 text-sm placeholder:text-slate-500"
            />
            <button 
              onClick={() => sendMessage()} 
              disabled={loading || !input.trim()} 
              className={`p-2 rounded-xl transition-all ${input.trim() ? 'bg-primary text-background-dark' : 'text-slate-500 opacity-30'}`}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-primary text-background-dark'
            }`}
          >
            <span className="material-symbols-outlined">{isRecording ? 'stop' : 'mic'}</span>
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {t.tags.map(tag => (
            <button key={tag} onClick={() => setInput(tag)} className="px-3 py-1 bg-slate-100 dark:bg-surface-dark rounded-full text-[10px] font-bold text-slate-500 hover:text-primary transition-colors whitespace-nowrap uppercase tracking-widest border border-slate-200 dark:border-white/5">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
