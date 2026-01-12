
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { KURDISH_COLORS } from '../constants';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

interface TranscriptEntry { role: 'user' | 'model'; text: string; timestamp: Date; }

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('ئامادەیە بۆ گفتوگۆی دەنگی');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Use refs for transcription fragments to avoid stale closures in callbacks
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const [visualInput, setVisualInput] = useState('');
  const [visualOutput, setVisualOutput] = useState('');

  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTo({ top: transcriptScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcripts, visualInput, visualOutput]);

  const startSession = async () => {
    try {
      setTranscripts([]);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('پەیوەندی ڕاستەوخۆ چالاکە');
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(data.length);
              for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
            }

            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              currentInputRef.current += text;
              setVisualInput(currentInputRef.current);
            }
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              currentOutputRef.current += text;
              setVisualOutput(currentOutputRef.current);
            }
            
            if (msg.serverContent?.turnComplete) {
              const finalInput = currentInputRef.current;
              const finalOutput = currentOutputRef.current;
              
              setTranscripts(prev => {
                const newEntries = [...prev];
                if (finalInput.trim()) newEntries.push({ role: 'user', text: finalInput, timestamp: new Date() });
                if (finalOutput.trim()) newEntries.push({ role: 'model', text: finalOutput, timestamp: new Date() });
                return newEntries;
              });

              currentInputRef.current = '';
              currentOutputRef.current = '';
              setVisualInput('');
              setVisualOutput('');
            }

            if (msg.serverContent?.interrupted) {
              for (const s of sourcesRef.current) {
                try { s.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => { setIsActive(false); setStatus('پەیوەندی داخرا'); },
          onerror: (e) => { console.error(e); setStatus('هەڵەیەک ڕوویدا'); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `
            تۆ KurdAI Proیت. پێویستە وەڵامەکانت زۆر خێرا و کورت و پوخت بن.
            زمانی فەرمی: کوردی سۆرانی.
            تێگەیشتنی زاراوە: سۆرانی، کرمانجی، گەرمیانی، هەورامی.
            ڕێسا: هەر کاتێک بەکارهێنەر قسەی کرد، یەکسەر بوەستە.
            وەڵامی کورت بدەرەوە بۆ ئەوەی خێراتر بگات.
          `,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('هەڵەی مایکرۆفۆن یان API');
    }
  };

  const stopSession = () => { 
    sessionRef.current?.close(); 
    setIsActive(false); 
    for (const s of sourcesRef.current) {
      try { s.stop(); } catch(e) {}
    } 
    sourcesRef.current.clear(); 
  };

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-stretch min-h-[75vh]" dir="rtl">
      <div className="lg:col-span-5 glass-panel rounded-[3.5rem] p-12 flex flex-col items-center justify-between bg-[#050507] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
        <div className="w-full flex justify-between items-center mb-8">
           <div className="flex gap-1.5"><div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div><div className="w-2 h-2 rounded-full bg-slate-700"></div></div>
           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Neural Voice V2</span>
        </div>
        <div className="relative flex-1 flex items-center justify-center">
           <div className={`w-64 h-64 lg:w-80 lg:h-80 rounded-full border-4 border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-center transition-all duration-700 ${isActive ? 'scale-110 shadow-[0_0_100px_rgba(234,179,8,0.1)]' : 'opacity-40 grayscale'}`}>
              {isActive ? (
                <div className="flex gap-2 items-center h-24">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1 bg-yellow-500 rounded-full" style={{ height: '30%', animation: `wave 0.5s ease-in-out infinite alternate ${i * 0.05}s`, backgroundColor: i % 2 === 0 ? KURDISH_COLORS.yellow : KURDISH_COLORS.green }}></div>
                  ))}
                </div>
              ) : <div className="text-7xl">🎙️</div>}
           </div>
        </div>
        <div className="text-center w-full mt-10 space-y-8">
           <div className="space-y-2">
              <h2 className="text-5xl font-black text-white font-['Noto_Sans_Arabic']">KurdAI <span className="text-yellow-500">دەنگی</span></h2>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-yellow-500' : 'text-slate-600'}`}>{status}</p>
           </div>
           {!isActive ? (
             <button onClick={startSession} className="w-full py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl">دەستپێکردن</button>
           ) : (
             <button onClick={stopSession} className="w-full py-6 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">وەستان</button>
           )}
        </div>
      </div>

      <div className="lg:col-span-7 glass-panel rounded-[3.5rem] flex flex-col overflow-hidden bg-black/40 border border-white/5">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تۆماری گفتوگۆ</span>
           <button onClick={() => setTranscripts([])} className="text-[9px] font-black text-slate-700 hover:text-red-500">سڕینەوە</button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar" ref={transcriptScrollRef}>
           {transcripts.map((t, i) => (
             <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2`}>
                <span className="text-[8px] font-black text-slate-600 mb-2 px-4 uppercase">{t.role === 'user' ? 'بەکاربهێنەر' : 'KurdAI'}</span>
                <div className={`p-6 rounded-3xl text-lg font-['Noto_Sans_Arabic'] leading-relaxed max-w-[90%] shadow-lg ${t.role === 'user' ? 'bg-white/[0.03] text-slate-300' : 'bg-yellow-500/5 text-yellow-500 border border-yellow-500/10'}`}>
                   {t.text}
                </div>
             </div>
           ))}
           {visualInput && <div className="text-slate-600 italic text-sm px-4 animate-pulse" dir="rtl">...{visualInput}</div>}
           {visualOutput && <div className="text-yellow-500/50 italic text-sm px-4 text-left animate-pulse" dir="rtl">{visualOutput}...</div>}
        </div>
      </div>
      <style>{`@keyframes wave { from { transform: scaleY(0.5); opacity: 0.3; } to { transform: scaleY(1.5); opacity: 1; } }`}</style>
    </div>
  );
};

export default VoiceAssistant;
