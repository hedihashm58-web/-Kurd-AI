
import React from 'react';

interface FrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FrameworkModal: React.FC<FrameworkModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const layers = [
    {
      title: 'چینى بەکارهێنەر (UI Layer)',
      tech: 'React 19 + Tailwind CSS',
      desc: 'بەرپرسە لە جوانی، خێرایی و گونجانی ئەپەکە لەگەڵ هەموو جۆرە شاشەیەک.',
      icon: '💎'
    },
    {
      title: 'بزوێنەری ژیری (AI Engine)',
      tech: 'Gemini 3 + Veo 3.1',
      desc: 'مۆخی سیستەمەکە کە شیکاری دەق، وێنە، ڤیدیۆ و دەنگ دەکات بە وردی باڵا.',
      icon: '🧠'
    },
    {
      title: 'پەیوەندی ڕاستەوخۆ (Streaming)',
      tech: 'Google GenAI SDK',
      desc: 'گواستنەوەی زانیارییەکان بە شێوەی خێرا و پارێزراو لە نێوان سێرڤەر و بەکارهێنەر.',
      icon: '⚡'
    },
    {
      title: 'سێرڤەر و هەور (Cloud Infrastructure)',
      tech: 'Vite + Vercel Edge',
      desc: 'بڵاوکردنەوەی ئەپەکە لەسەر خێراترین سێرڤەرەکانی جیهان بۆ دەستڕاگەیشتنی بەردەوام.',
      icon: '🌐'
    }
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300" dir="rtl">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-[#08080a] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-10 lg:p-20 space-y-16">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-500 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-yellow-500/20">🏗️</div>
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">پێکهاتەی <span className="text-yellow-500">فەریمۆرک</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] font-['Noto_Sans_Arabic']">چۆنیەتی کارکردنی تەکنیکی KurdAI Pro</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {layers.map((layer, idx) => (
              <div key={idx} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-center gap-6 flex-row-reverse">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{layer.icon}</div>
                  <div className="text-right">
                    <h3 className="text-xl font-black text-white font-['Noto_Sans_Arabic']">{layer.title}</h3>
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{layer.tech}</span>
                  </div>
                </div>
                <p className="text-slate-400 font-medium font-['Noto_Sans_Arabic'] text-sm leading-relaxed text-justify opacity-80">
                  {layer.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-8">
            <p className="text-xs text-slate-600 font-medium font-['Noto_Sans_Arabic'] text-center max-w-2xl">
              ئەم فەریمۆرکە بە شێوەیەک داڕێژراوە کە بتوانێت قەبارەی زانیارییەکان زیاد بکات و لە داهاتوودا خزمەتگوزاری زیاتر بۆ هەرێمی کوردستان دابین بکات.
            </p>
            <button 
              onClick={onClose}
              className="px-16 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all font-['Noto_Sans_Arabic']"
            >
              داخستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkModal;
