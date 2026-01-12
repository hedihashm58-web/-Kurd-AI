
import React, { useState, useRef } from 'react';
import { generateKurdishArt } from '../services/geminiService';

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
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { id: 'Photorealistic', label: 'واقیعی', icon: '📸' },
    { id: 'Cinematic', label: 'سینەمایی', icon: '🎬' },
    { id: 'Oil Painting', label: 'زەیتی', icon: '🎨' },
    { id: 'Digital Art', label: 'دیجیتاڵ', icon: '💻' }
  ];

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
    setLoading(true);
    setError(null);
    setImage(null);
    setStatusMsg('خەریکی ئامادەکردنی بزوێنەری داهێنانە...');

    try {
      if (quality === '2K' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setStatusMsg('تکایە کلیلێکی API هەڵبژێرە...');
          await window.aistudio.openSelectKey();
        }
      }

      setStatusMsg(userImage ? 'دەستکاری وێنەکە دەکات...' : 'تابلۆکە دروست دەکات...');
      const result = await generateKurdishArt(prompt, selectedStyle, quality, userImage, userMimeType);
      setImage(result);
      setStatusMsg('وێنەکە بە سەرکەوتوویی دروست کرا!');
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        setError("هەڵەی دەسەڵات: پێویستت بە کلیلێکی API هەیە کە Billing ی بۆ چالاک کرابێت بۆ ئەم جۆرە مۆدێلە.");
      } else if (msg.includes("safety") || msg.includes("blocked")) {
        setError("هەڵەی پاراستن: ئەم داوایە ڕێگری لێکراوە لەبەر یاساکانی سەلامەتی و ناوەڕۆک.");
      } else if (msg.includes("image_size")) {
        setError("هەڵەی قەبارە: ئەم مۆدێلە پشتگیری ئەو قەبارەیە ناکات. تکایە Standard هەڵبژێرە.");
      } else {
        setError("ببورە، کێشەیەک لە سێرڤەر ڕوویدا. دڵنیابەرەوە لە هەبوونی باڵانس و کلیلی دروست لە پڕۆژەکەتدا.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20" dir="rtl">
      <div className="text-center space-y-6">
        <h2 className="text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">ستۆدیۆی <span className="text-yellow-500 italic">داهێنان</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] font-['Noto_Sans_Arabic']">بەرهەمهێنانی تابلۆی هونەری بە ژیریی دەستکرد</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="glass-panel p-10 rounded-[3rem] space-y-8 bg-[#050507] border border-white/5 shadow-2xl">
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] px-4 font-['Noto_Sans_Arabic']">وەسفی تابلۆ</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="چی دروست بکەم؟ بۆ نموونە: پیرەمێردێکی کورد لە کاتی کارکردندا..."
              className="w-full p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 text-xl font-['Noto_Sans_Arabic'] focus:border-yellow-500 h-40 resize-none text-right transition-all outline-none"
            />
          </div>

          <div className="flex gap-4 items-center">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUserImageChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center gap-4 transition-all ${userImage ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 hover:bg-white/5'}`}
            >
              <span className="text-xl">{userImage ? '✅' : '🖼️'}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-['Noto_Sans_Arabic']">وێنەی خۆت بەکاربهێنە</span>
            </button>
            {userImage && (
              <button onClick={() => setUserImage(null)} className="px-6 h-20 bg-red-500/10 text-red-500 rounded-2xl text-xs hover:bg-red-500/20 font-['Noto_Sans_Arabic']">لابردن</button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {styles.map(style => (
              <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={`p-4 rounded-2xl border transition-all ${selectedStyle === style.id ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}>
                <span className="text-xl block mb-1">{style.icon}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic']">{style.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl">
            {['1K', '2K'].map(q => (
              <button key={q} onClick={() => setQuality(q as any)} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase transition-all ${quality === q ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
                {q === '1K' ? 'Standard' : 'Ultra (Pro)'}
              </button>
            ))}
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-bold text-center font-['Noto_Sans_Arabic']">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={loading || (!prompt.trim() && !userImage)}
            className="w-full py-7 bg-yellow-500 text-black font-black text-lg rounded-[2rem] shadow-xl disabled:opacity-20 transition-all active:scale-95 font-['Noto_Sans_Arabic']"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>{statusMsg}</span>
              </div>
            ) : 'دروستکردن'}
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {image ? (
            <div className="glass-panel p-6 rounded-[3rem] border border-white/5 animate-in zoom-in duration-500 group relative">
              <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-black/40">
                <img src={image} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-[5s]" alt="Generated" />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => { const l = document.createElement('a'); l.href = image; l.download = 'kurdai.png'; l.click(); }} className="flex-1 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest font-['Noto_Sans_Arabic']">داگرتن</button>
                <button onClick={() => setImage(null)} className="px-8 py-4 bg-white/5 text-white rounded-xl text-xs font-['Noto_Sans_Arabic']">سڕینەوە</button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-20 p-20 bg-white/[0.01]">
               <div className={`text-9xl mb-6 transition-all duration-1000 ${loading ? 'animate-pulse scale-110 opacity-30 grayscale-0' : 'grayscale'}`}>🎨</div>
               <p className="text-[10px] font-black uppercase tracking-widest text-center font-['Noto_Sans_Arabic']">{loading ? statusMsg : 'تابلۆکە لێرە دەردەکەوێت'}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {SUGGESTED_IDEAS.slice(0, 2).map((idea, i) => (
              <button key={i} onClick={() => setPrompt(idea.prompt)} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-right hover:bg-white/5 transition-all group">
                <p className="text-yellow-500 font-black text-[9px] uppercase tracking-widest mb-2 font-['Noto_Sans_Arabic']">بیرۆکە</p>
                <p className="text-slate-300 text-sm font-['Noto_Sans_Arabic'] leading-relaxed group-hover:text-white">{idea.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtStudio;
