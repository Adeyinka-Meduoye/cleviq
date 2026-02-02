
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/gemini';

interface Props {
  script: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir';
}

export const AudioPlayer: React.FC<Props> = ({ script, voice }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const togglePlayback = async () => {
    if (isLoading) return;
    setError(null);

    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        pausedAtRef.current = (audioContextRef.current?.currentTime || 0) - startTimeRef.current;
        setIsPlaying(false);
      }
      return;
    }

    try {
      if (!bufferRef.current) {
        setIsLoading(true);
        bufferRef.current = await gemini.generateTTS(script, voice);
        setIsLoading(false);
      }

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = ctx;

      const source = ctx.createBufferSource();
      source.buffer = bufferRef.current;
      source.connect(ctx.destination);
      
      const offset = pausedAtRef.current;
      source.start(0, offset);
      startTimeRef.current = ctx.currentTime - offset;
      sourceRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        if (ctx.currentTime - startTimeRef.current >= (bufferRef.current?.duration || 0)) {
          setIsPlaying(false);
          setProgress(100);
          pausedAtRef.current = 0;
        }
      };

    } catch (err: any) {
      console.error("TTS Error:", err);
      setIsLoading(false);
      setIsPlaying(false);
      setError(err.message || "Failed to generate audio.");
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioContextRef.current && bufferRef.current) {
          const current = audioContextRef.current.currentTime - startTimeRef.current;
          setProgress((current / bufferRef.current.duration) * 100);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative h-2 w-full bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ${error ? 'bg-red-500' : 'bg-indigo-600'}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all mx-auto disabled:opacity-50 ${
            error ? 'bg-red-950/50 border border-red-500 text-red-500' : 'bg-indigo-600 text-white'
          }`}
        >
          {isLoading ? (
            <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" strokeWidth="4" strokeLinecap="round"></path></svg>
          ) : isPlaying ? (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        
        <p className={`text-[10px] font-black uppercase tracking-widest text-center max-w-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
          {isLoading ? 'CLEVIQ is orchestrating audio...' : error ? error : isPlaying ? 'Playing Lecture' : 'Ready to Listen'}
        </p>
        
        {error && (
          <button 
            onClick={togglePlayback}
            className="text-[10px] font-bold text-indigo-400 underline uppercase tracking-tighter"
          >
            Retry Now
          </button>
        )}
      </div>
    </div>
  );
};
