
import React, { useState } from 'react';
import { View } from '../types';
import FrameworkModal from './FrameworkModal';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  backgroundImage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, backgroundImage }) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isFrameworkOpen, setIsFrameworkOpen] = useState(false);

  const navItems = [
    { id: View.CHAT, label: 'گفتوگۆی ژیر', icon: '🏛️', desc: 'ژیریی شیکاری و ڕاوێژکاری' },
    { id: View.HISTORY, label: 'کۆشکی مێژوو', icon: '📜', desc: 'ڕەچەڵەک و سەرکردەکان' },
    { id: View.EXPLORE, label: 'نەخشەی کوردستان', icon: '🗺️', desc: 'گەڕان بەدوای شوێنەوارەکان' },
    { id: View.MATH, label: 'شیکاری زانستی', icon: '📐', desc: 'شیکاریی داتا و هاوکێشەکان' },
    { id: View.TRANSLATE, label: 'وەرگێڕی زمان', icon: '📜', desc: 'وەرگێڕانی فەرمی دیالەکتەکان' },
    { id: View.HEALTH, label: 'تەندروستی AI', icon: '🩺', desc: 'شیکاریی نیشانە و دەرمان' },
    { id: View.ART, label: 'ستۆدیۆی وێنە', icon: '🎨', desc: 'بەرهەمهێنانی بینراوی بەرز' },
    { id: View.VIDEO, label: 'ستۆدیۆی ڤیدیۆ', icon: '🎥', desc: 'ڕێندەرکردنی ڤیدیۆی فەرمی' },
    { id: View.VOICE, label: 'دەنگی کوردی', icon: '🔊', desc: 'پەیوەندی دەنگیی ڕاستەوخۆ' },
  ];

  const handleToolSelect = (id: View) => {
    onViewChange(id);
    setIsVaultOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#010204] text-slate-200" dir="rtl">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 transition-opacity duration-1000">
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="Context" 
            className="w-full h-full object-cover blur-[140px] scale-150 animate-pulse duration-[8s]"
          />
        )}
      </div>

      <header className="glass-panel sticky top-6 z-50 px-6 md:px-14 py-4 grid grid-cols-3 items-center border border-yellow-500/20 mx-4 md:mx-14 mt-6 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[60px]">
        {/* Right (Start in RTL): Branding */}
        <div className="flex items-center gap-4 md:gap-6 group cursor-pointer justify-self-start" onClick={() => onViewChange(View.CHAT)}>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.2rem] royal-sun-emblem flex items-center justify-center text-2xl md:text-4xl transition-all duration-1000 group-hover:rotate-[360deg]">
            ☀️
          </div>
          <div className="flex flex-col text-right hidden sm:flex">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-none royal-gold-gradient font-['Noto_Sans_Arabic']">
              KurdAI <span className="text-yellow-500 italic text-[8px] md:text-xs ml-1 font-bold">PRO</span>
            </h1>
          </div>
        </div>

        {/* Center: HT Branding Logo */}
        <div className="justify-self-center flex items-center justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.4rem] royal-sun-emblem flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.4)] border border-white/40 group cursor-default">
             <span className="text-black font-black text-base md:text-xl tracking-tighter group-hover:scale-125 transition-transform duration-500">HT</span>
          </div>
        </div>

        {/* Left (End in RTL): Service Toggle */}
        <div className="justify-self-end flex items-center">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="flex items-center gap-3 md:gap-5 pl-2 pr-4 md:pr-8 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-full hover:bg-yellow-500/10 transition-all active:scale-95 group relative overflow-hidden shadow-inner"
          >
            <span className="text-[9px] md:text-[11px] font-black text-yellow-500 uppercase tracking-[0.1em] md:tracking-[0.2em] font-['Noto_Sans_Arabic']">خزمەتگوزارییەکان</span>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full royal-sun-emblem flex items-center justify-center text-lg md:text-2xl shadow-2xl">⚡</div>
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-[1700px] p-6 md:p-14 lg:p-24 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 bg-black/95 border-t border-yellow-500/10 pt-20 pb-12 px-8 md:px-24 mt-24 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Top Row: Brand & Long Description */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl royal-sun-emblem flex items-center justify-center text-2xl shadow-2xl">☀️</div>
                <span className="text-4xl font-black royal-gold-gradient tracking-tighter font-['Noto_Sans_Arabic']">KurdAI Pro</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.5em] font-['Noto_Sans_Arabic']">ژیریی نیشتمانیی کوردستان</p>
            </div>
            
            <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl">
              <p className="text-lg md:text-xl font-medium text-slate-300 leading-[2] font-['Noto_Sans_Arabic'] text-justify">
                پێشکەوتووترین وەڵامدەرەوەی ژیرە کە بە تایبەت بۆ زمانی کوردی و کولتووری کوردستان داڕێژراوە. ئەم بەرنامەیە توانای شیکارکردنی ئاڵۆزترین پرسیارەکان، دروستکردنی وێنە و ڤیدیۆی سینەمایی، شیکاریی پزیشکی و زانستی، و وەرگێڕانی زمانەکانی هەیە بە وردییەکی بێ وێنە.
              </p>
            </div>
          </div>

          {/* Bottom Row: Lab Copyright and Developer Credit */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic']">تاقیگەی توێژینەوەی ژیریی دەستکردی کوردستان © ٢٠٢٥</p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-yellow-500 text-[11px] font-black uppercase tracking-widest font-['Noto_Sans_Arabic']">پەرەپێدراوە لە لایەن هێدی هاشم</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Service Overlay */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-[#010204]/98 backdrop-blur-[80px]" onClick={() => setIsVaultOpen(false)}></div>
          
          <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-12 space-y-4">
              <div className="w-20 h-20 rounded-[1.5rem] royal-sun-emblem flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_0_60px_rgba(255,215,0,0.2)]">⚡</div>
              <h2 className="text-4xl md:text-5xl font-black royal-gold-gradient tracking-tighter leading-none font-['Noto_Sans_Arabic']">پێڕستی خزمەتگوزارییەکان</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar p-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToolSelect(item.id)}
                  className="group relative p-8 md:p-10 bg-white/[0.02] border border-yellow-500/10 rounded-[2.5rem] md:rounded-[3rem] text-right transition-all hover:bg-yellow-500/5 hover:border-yellow-500/40 flex items-center gap-6 md:gap-8 shadow-2xl overflow-hidden gold-border-glow"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl md:text-4xl group-hover:scale-110 transition-all flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-black text-white group-hover:text-yellow-500 transition-colors font-['Noto_Sans_Arabic']">{item.label}</h3>
                    <p className="text-slate-500 text-[9px] md:text-[10px] font-medium leading-relaxed font-['Noto_Sans_Arabic']">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsVaultOpen(false)}
              className="mt-12 mx-auto block px-12 md:px-16 py-4 border border-yellow-500/20 rounded-full text-yellow-500/60 font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] hover:text-yellow-500 hover:border-yellow-500 transition-all shadow-xl font-['Noto_Sans_Arabic']"
            >
              داخستن ✕
            </button>
          </div>
        </div>
      )}

      <FrameworkModal isOpen={isFrameworkOpen} onClose={() => setIsFrameworkOpen(false)} />
    </div>
  );
};

export default Layout;
