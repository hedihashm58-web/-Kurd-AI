
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
    { id: View.CHAT, label: 'گفتوگۆی ژیر', icon: '🏛️', desc: 'ژیریی شیکاری و ڕاوێژکاری ئەکادیمی', meta: 'Consultation AI' },
    { id: View.EXPLORE, label: 'نەخشەی کوردستان', icon: '🗺️', desc: 'گەڕان بەدوای پارێزگاکان و شوێنەوارەکان', meta: 'Spatial AI' },
    { id: View.MATH, label: 'شیکاری زانستی', icon: '📐', desc: 'شیکاریی داتا و هاوکێشە ئاڵۆزەکان', meta: 'Analytical AI' },
    { id: View.TRANSLATE, label: 'وەرگێڕی خێرا', icon: '📜', desc: 'وەرگێڕانی فەرمی و پسپۆڕی دیالەکتەکان', meta: 'Linguistic AI' },
    { id: View.HEALTH, label: 'تەندروستی AI', icon: '🩺', desc: 'شیکاریی نیشانەکان و زانیاریی دەرمان', meta: 'Medical AI' },
    { id: View.ART, label: 'ستۆدیۆی وێنە', icon: '🎨', desc: 'بەرهەمهێنانی بینراوی کوالیتی بەرز', meta: 'Creative AI' },
    { id: View.VIDEO, label: 'ستۆدیۆی ڤیدیۆ', icon: '🎥', desc: 'ڕێندەرکردنی ڤیدیۆی سینەمایی و فەرمی', meta: 'Multimedia AI' },
    { id: View.VOICE, label: 'دەنگی کوردی', icon: '🔊', desc: 'پەیوەندی دەنگیی ڕاستەوخۆ و پارێزراو', meta: 'Audio AI' },
  ];

  const handleToolSelect = (id: View) => {
    onViewChange(id);
    setIsVaultOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#010409] text-slate-200" dir="rtl">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000">
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="Context" 
            className="w-full h-full object-cover blur-[150px] scale-150"
          />
        )}
      </div>

      {/* Flag Borders */}
      <div className="h-1 flex fixed top-0 left-0 right-0 z-[100] opacity-80">
        <div className="flex-1 bg-red-700"></div>
        <div className="flex-1 bg-slate-100"></div>
        <div className="flex-1 bg-green-800"></div>
      </div>

      <header className="glass-panel sticky top-3 z-50 px-6 lg:px-12 py-4 grid grid-cols-2 md:grid-cols-3 items-center border-b border-white/[0.05] mx-3 lg:mx-8 mt-4 rounded-[2.5rem] shadow-2xl">
        {/* Branding */}
        <div className="flex items-center gap-4 lg:gap-5 group cursor-pointer justify-start" onClick={() => onViewChange(View.CHAT)}>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl sun-emblem flex items-center justify-center text-2xl lg:text-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
            ☀️
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-none">
              KurdAI <span className="text-yellow-500 italic text-xs ml-1 font-mono">PRO</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 status-pulse"></div>
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">سیستەم چالاکە</p>
            </div>
          </div>
        </div>

        {/* HT Center Badge */}
        <div className="hidden md:flex justify-center order-2">
          <div className="relative group cursor-default">
            <div className="px-8 py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md transition-all group-hover:border-yellow-500/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white tracking-tighter">HT</span>
                <div className="h-4 w-px bg-white/10"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">National Dev</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Toggle */}
        <div className="flex justify-end order-3">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="flex items-center gap-5 pl-2 pr-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all shadow-xl active:scale-95 group"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-yellow-500 transition-colors">خزمەتگوزارییەکان</span>
              <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">PORTAL_V3</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-xl shadow-lg">⚡</div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto max-w-[1400px] p-4 lg:p-12 relative z-10 animate-in fade-in duration-1000">
        {children}
      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 bg-black/60 border-t border-white/5 py-12 px-10 mt-20 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-right space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg sun-emblem flex items-center justify-center text-sm">☀️</div>
              <span className="text-lg font-black text-white">KurdAI Pro</span>
            </div>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed max-w-sm">
              پلاتفۆرمی نیشتمانی بۆ گەشەپێدانی تواناکانی مرۆیی لە ڕێگەی ژیریی دەستکردەوە.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="text-center md:text-right">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-2 block">پەرەپێدەر</span>
              <span className="text-sm font-bold text-white">هێدی هاشم فەتاح</span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">وەشان</span>
              <span className="text-sm font-mono font-bold text-white">V3.5-GOLD</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => setIsFrameworkOpen(true)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">🏗️</button>
             <div className="h-8 w-px bg-white/10 mx-2"></div>
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Kurdistan AI Lab</p>
          </div>
        </div>
      </footer>

      {/* Service Overlay */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-[#010409]/98 backdrop-blur-3xl" onClick={() => setIsVaultOpen(false)}></div>
          
          <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-16 space-y-4">
              <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[1em]">داهاتوویەکی زیرەکتر</div>
              <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter">پێڕستی <span className="text-yellow-500">خزمەتگوزارییەکان</span></h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleToolSelect(item.id)}
                  className="group relative p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] text-right transition-all hover:bg-white/[0.06] hover:border-yellow-500/30 shadow-2xl h-60 flex flex-col justify-between overflow-hidden"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-[8px] font-black text-slate-600 group-hover:text-yellow-500 uppercase tracking-widest font-mono">{item.meta}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-yellow-500 transition-colors">{item.label}</h3>
                    <p className="text-slate-500 text-[10px] font-medium opacity-80 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsVaultOpen(false)}
              className="mt-12 mx-auto block px-12 py-4 border border-white/10 rounded-full text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] hover:text-white hover:border-white/30 transition-all bg-white/2"
            >
              داخستنی پێڕست
            </button>
          </div>
        </div>
      )}

      <FrameworkModal isOpen={isFrameworkOpen} onClose={() => setIsFrameworkOpen(false)} />
    </div>
  );
};

export default Layout;
