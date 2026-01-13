import React, { useState, useRef } from 'react';
import { analyzeMathStream } from '../services/geminiService';

const SUGGESTED_IDEAS = [
  { label: 'شیکاری ئاماری', prompt: 'ئەم داتایانەم بۆ شیکار بکە و لادانی پێوانەیی و تێکڕای ژمارەیی بدۆزەرەوە: 12, 15, 18, 22, 25, 30' },
  { label: 'کێشەی ئەگەرەکان', prompt: 'ئەگەری دەرچوونی ژمارەیەکی جووت لە کاتی فڕێدانی زارێکدا چەندە؟' },
  { label: 'هاوکێشەی جەبری', prompt: 'شیکاری ئەم هاوکێشەیەم بۆ بکە: 2x + 5 = 15' },
  { label: 'فیزیا (هێز)', prompt: 'تەنیەک بارستاییەکەی 5kg بێت و بە خێرایی 2m/s بجوڵێت، وزەی جووڵەکەی چەندە؟' }
];

const MathAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (customPrompt?: string) => {
    const activeQuery = customPrompt || query;
    if ((!activeQuery.trim() && !image) || loading) return;
    
    if (customPrompt) setQuery(customPrompt);
    
    setLoading(true);
    setResult("");
    try {
      const stream = await analyzeMathStream(activeQuery, image, mimeType);
      let fullResult = "";
      for await (const chunk of stream) {
        fullResult += chunk.text;
        setResult(fullResult);
      }
    } catch (error) {
      console.error(error);
      setResult("ببورە، هەڵەیەک لە کاتی شیکارکردن ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 text-right" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">شیکارکەری <span className="text-yellow-500">زانستی و ئاماری</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] font-['Noto_Sans_Arabic']">شیکاریی ورد بۆ بیرکاری، فیزیا، کیمیا و ئامار بە پشتگیری وێنە</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 lg:p-12 rounded-[3.5rem] border border-white/5 shadow-3xl space-y-10 bg-[#050507]">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">وەسفی کێشەکە، هاوکێشەکە یان داتا ئامارییەکان</label>
            <textarea 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              className="w-full h-48 bg-white/[0.02] p-8 rounded-[2.5rem] text-white text-xl border border-white/5 font-['Noto_Sans_Arabic'] focus:border-yellow-500/30 outline-none transition-all resize-none shadow-inner"
              placeholder="پرسیارەکە لێرە بنووسە یان وێنەی خشتە و گرافەکە باربکە..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 w-full py-6 bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/[0.05] transition-all group"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">📸</div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-['Noto_Sans_Arabic']">بارکردنی وێنەی کێشەکە</span>
            </button>

            {image && (
              <div className="relative w-full sm:w-48 aspect-square rounded-[2rem] overflow-hidden border-2 border-yellow-500/30 group">
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleAnalyze()} 
            disabled={loading || (!query.trim() && !image)}
            className="w-full py-8 bg-yellow-500 text-black rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] font-['Noto_Sans_Arabic'] shadow-2xl shadow-yellow-500/10 hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>خەریکی شیکارکردنی زانیارییەکانە...</span>
              </>
            ) : (
              <>
                <span>دەستپێکردنی شیکاری زانستی</span>
                <span className="text-2xl">📐</span>
              </>
            )}
          </button>
        </div>

        {/* Sidebar Ideas */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-yellow-500 font-black text-xs uppercase tracking-widest font-['Noto_Sans_Arabic'] mb-4">نموونە بۆ تاقیکردنەوە</h3>
            <div className="space-y-4">
              {SUGGESTED_IDEAS.map((idea, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAnalyze(idea.prompt)}
                  className="w-full p-6 bg-white/5 rounded-2xl text-right hover:bg-white/10 transition-all border border-white/5 group"
                >
                  <p className="text-white font-bold text-sm font-['Noto_Sans_Arabic'] mb-2 group-hover:text-yellow-500">{idea.label}</p>
                  <p className="text-slate-500 text-[10px] line-clamp-1 font-['Noto_Sans_Arabic']">{idea.prompt}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] flex gap-6 items-start">
            <div className="text-3xl">📊</div>
            <div className="space-y-2">
               <h4 className="text-yellow-500 font-black text-[10px] uppercase tracking-widest font-['Noto_Sans_Arabic']">شیکاری داتا</h4>
               <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-['Noto_Sans_Arabic']">
                 دەتوانیت وێنەی خشتەی ئاماری یان گراف باربکەیت بۆ وەرگرتنی شیکاری وردی ماتماتیکی.
               </p>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="p-1 text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] mb-4 px-4">ئەنجامی شیکارییەکە</div>
          <div className="p-10 lg:p-14 bg-black/40 rounded-[3rem] border border-white/5 text-slate-200 font-['Noto_Sans_Arabic'] leading-[2.2] text-xl lg:text-2xl text-justify whitespace-pre-wrap shadow-inner backdrop-blur-xl">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathAnalyzer;
