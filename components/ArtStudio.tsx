
import React, { useState, useRef, useEffect } from 'react';
import { generateKurdishArt } from '../services/geminiService';

const ULTRA_LIMIT = 3;
const RESET_TIME_MS = 24 * 60 * 60 * 1000; // 24 Hours

const SUGGESTED_IDEAS = [
  { label: 'قەڵای هەولێر ساڵی ١٩٠٠', prompt: 'Ancient Erbil Citadel in year 1900, historical black and white vintage look with traditional Kurdish people.' },
  { label: 'نەورۆزی ئاکرێ', prompt: 'Akre Nawroz celebration, thousands of torches on the mountains at night, cinematic fire lighting.' },
  { label: 'کچێکی کورد لە هەورامان', prompt: 'A beautiful Kurdish girl in colorful traditional clothes in Hawraman mountains, realistic, cinematic lighting.' },
  { label: 'شەڕڤانێکی دلێر', prompt: 'A brave Kurdish warrior in traditional Ranka and Choxa, heroic posture, mountain background, digital art style.' }
];

const ArtStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userMimeType, setUserMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [quality, setQuality] = useState<'1K' | '2K'>('1K');
  const [error, setError] = useState<string | null>(null);
  const [ultraUsage, setUltraUsage] = useState({ count: 0, resetAt: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and sync Ultra usage from localStorage
  useEffect(() => {
    const savedUsage = localStorage.getItem('kurdai_ultra_usage');
    if (savedUsage) {
      const parsed = JSON.parse(savedUsage);
      const now = Date.now();
      if (now > parsed.resetAt) {
        // Reset if 24 hours have passed
        const fresh = { count: 0, resetAt: 0 };
        setUltraUsage(fresh);
        localStorage.setItem('kurdai_ultra_usage', JSON.stringify(fresh));
      } else {
        setUltraUsage(parsed);
      }
    }
  }, []);

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => setUserImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !userImage) return;

    // Check Ultra Limit
    if (quality === '2K') {
      const now = Date.now();
      if (ultraUsage.resetAt !== 0 && now < ultraUsage.resetAt && ultraUsage.count >= ULTRA_LIMIT) {
        setError("ببورە، ٣ وێنەی ئۆڵترات بەکارهێناوە. دوای ٢٤ کاتژمێر یان بە کڕینی پلانی Unlimited دەتوانیت بەردەوام بیت.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setImage(null);
    setStatusMsg('خەریکی ئامادەکردنی بزوێنەری وێنە...');

    try {
      if (quality === '2K' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setStatusMsg('تکایە کلیلێکی API هەڵبژێرە...');
          await window.aistudio.openSelectKey();
        }
      }

      setStatusMsg(userImage ? 'دەستکاری وێنەکە دەکات...' : 'خەریکی ڕێندەرکردنی تابلۆکەیە...');
      const result = await generateKurdishArt(prompt, 'Hyper-Realistic', quality, userImage, userMimeType);
      
      setImage(result);
      setStatusMsg('وێنەکە بە سەرکەوتوویی دروست کرا!');

      // Update Usage if it was Ultra
      if (quality === '2K') {
        const now = Date.now();
        setUltraUsage(prev => {
          const newResetAt = prev.resetAt === 0 ? now + RESET_TIME_MS : prev.resetAt;
          const updated = { count: prev.count + 1, resetAt: newResetAt };
          localStorage.setItem('kurdai_ultra_usage', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("permission") || msg.includes("entity was not found")) {
        setError("هەڵەی دەسەڵات: پێویستت بە کلیلێکی API هەیە کە Billing ی بۆ چالاک کرابێت و مۆڵەتی ئەم مۆدێلەی هەبێت.");
        if (window.aistudio) {
          setTimeout(() => window.aistudio?.openSelectKey(), 2000);
        }
      } else if (msg.includes("safety") || msg.includes("blocked")) {
        setError("هەڵەی پاراستن: ئەم داوایە ڕێگری لێکراوە لەبەر یاساکانی سەلامەتی و ناوەڕۆک.");
      } else {
        setError("ببورە، کێشەیەک لە سێرڤەر ڕوویدا. دڵنیابەرەوە کە کلیلێکی API دروستت بەکارهێناوە.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isUltraLocked = quality === '2K' && ultraUsage.count >= ULTRA_LIMIT && Date.now() < ultraUsage.resetAt;

  return (
    <div className="max-w-6xl mx-auto space-y-12 md:space-y-16 pb-20" dir="rtl">
      <div className="text-center space-y-6">
        <h2 className="text-4xl md:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">دروستکردنی <span className="text-yellow-500 italic">تابلۆ</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-['Noto_Sans_Arabic']">بەرهەمهێنانی وێنەی واقیعی و داهێنەرانە بە ژیریی دەستکرد</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-start">
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-8 bg-[#050507] border border-white/5 shadow-2xl">
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] px-4 font-['Noto_Sans_Arabic']">وەسفی تابلۆ (بە وردی بنووسە)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="باسی دیمەنەکە بکە... بۆ نموونە: کچێکی کورد لە ناو باخچەیەکی گوڵ، بە وردەکاری زۆرەوە..."
              className="w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/10 text-lg md:text-xl font-['Noto_Sans_Arabic'] focus:border-yellow-500 h-48 md:h-60 resize-none text-right transition-all outline-none"
            />
          </div>

          <div className="flex gap-4 items-center">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUserImageChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 h-16 md:h-20 rounded-2xl border-2 border-dashed flex items-center justify-center gap-4 transition-all ${userImage ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 hover:bg-white/5'}`}
            >
              <span className="text-xl">{userImage ? '✅' : '📸'}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-['Noto_Sans_Arabic']">بەکارهێنانی وێنەی سەرچاوە</span>
            </button>
            {userImage && (
              <button onClick={() => setUserImage(null)} className="px-6 h-16 md:h-20 bg-red-500/10 text-red-500 rounded-2xl text-xs hover:bg-red-500/20 font-['Noto_Sans_Arabic']">لابردن</button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl">
              <button onClick={() => setQuality('1K')} className={`flex-1 py-4 rounded-xl font-black text-[9px] uppercase transition-all flex flex-col items-center gap-1 ${quality === '1K' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                <span>Standard</span>
                <span className="text-[8px] opacity-60">بە خۆڕایی و بێ سنوور</span>
              </button>
              <button onClick={() => setQuality('2K')} className={`flex-1 py-4 rounded-xl font-black text-[9px] uppercase transition-all flex flex-col items-center gap-1 ${quality === '2K' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                <span>Ultra (PRO)</span>
                <span className="text-[8px] opacity-60">
                   {ultraUsage.count >= ULTRA_LIMIT && Date.now() < ultraUsage.resetAt ? 'داخراوە 🔒' : `${ULTRA_LIMIT - ultraUsage.count} لە ${ULTRA_LIMIT} ماوەتەوە`}
                </span>
              </button>
            </div>
            {quality === '2K' && (
              <div className="flex justify-between px-2">
                 <p className="text-[9px] text-slate-500 font-bold font-['Noto_Sans_Arabic'] uppercase tracking-widest">٣ وێنە بۆ هەر ٢٤ کاتژمێرێک</p>
                 {ultraUsage.resetAt > 0 && (
                   <p className="text-[9px] text-yellow-500/60 font-bold font-['Noto_Sans_Arabic']">نوێبوونەوە: {new Date(ultraUsage.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-bold text-center font-['Noto_Sans_Arabic'] space-y-3">
              <p>{error}</p>
              {isUltraLocked && (
                <button className="w-full py-3 bg-red-500 text-white rounded-xl text-[10px] uppercase tracking-widest">کڕینی Unlimited 🚀</button>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || (!prompt.trim() && !userImage) || isUltraLocked}
            className={`w-full py-6 md:py-8 font-black text-lg md:text-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl transition-all active:scale-95 font-['Noto_Sans_Arabic'] ${
              isUltraLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>{statusMsg}</span>
              </div>
            ) : isUltraLocked ? 'بڕی وێنەکان تەواو بوو' : 'دروستکردنی تابلۆ'}
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {image ? (
            <div className="glass-panel p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 animate-in zoom-in duration-500 group relative">
              <div className="overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl bg-black/40 aspect-square">
                <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[5s]" alt="Generated" />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => { const l = document.createElement('a'); l.href = image; l.download = 'kurdai_tablet.png'; l.click(); }} className="flex-1 py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest font-['Noto_Sans_Arabic']">داگرتنی وێنە</button>
                <button onClick={() => setImage(null)} className="px-8 py-4 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest font-['Noto_Sans_Arabic']">سڕینەوە</button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-20 p-10 md:p-20 bg-white/[0.01]">
               <div className={`text-7xl md:text-9xl mb-6 transition-all duration-1000 ${loading ? 'animate-pulse scale-110 opacity-30 grayscale-0' : 'grayscale'}`}>📸</div>
               <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center font-['Noto_Sans_Arabic'] leading-relaxed">{loading ? statusMsg : 'تابلۆکە لێرە دەردەکەوێت'}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {SUGGESTED_IDEAS.slice(0, 2).map((idea, i) => (
              <button key={i} onClick={() => setPrompt(idea.prompt)} className="p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl text-right hover:bg-white/5 transition-all group">
                <p className="text-yellow-500 font-black text-[8px] md:text-[9px] uppercase tracking-widest mb-2 font-['Noto_Sans_Arabic']">نموونەی واقیعی</p>
                <p className="text-slate-300 text-xs md:text-sm font-['Noto_Sans_Arabic'] leading-relaxed group-hover:text-white line-clamp-2">{idea.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtStudio;
