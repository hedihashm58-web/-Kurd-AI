
import React, { useState } from 'react';

const HISTORY_CATEGORIES = [
  { id: 'origins', label: 'ڕەچەڵەک و مێژووی کۆن', icon: '⛰️', shortDesc: 'سەرەتای نیشتەجێبوون' },
  { id: 'dynasties', label: 'ئیمپراتۆرییەت و دەسەڵات', icon: '👑', shortDesc: 'سەردەمی فەرمانڕەوایی' },
  { id: 'principalities', label: 'میرنشینە کوردییەکان', icon: '🏰', shortDesc: 'سەربەخۆیی ناوخۆیی' },
  { id: 'leaders', label: 'سەرکردە و تێکۆشەران', icon: '⚔️', shortDesc: 'داستانی خۆڕاگری' },
  { id: 'writers', label: 'شاعیر و نووسەران', icon: '🖋️', shortDesc: 'لووتکەی ئەدەب و زانست' }
];

const HISTORY_DATA: Record<string, any[]> = {
  origins: [
    {
      title: 'چەرمۆ (Jarmo)',
      period: '٧٠٠٠ پ.ز',
      desc: 'یەکێک لە گرنگترین و کۆنترین گوندە کشتوکاڵییەکانی جیهان کە لە ناو چەمچەماڵ هەڵکەوتووە. چەرمۆ شوێنی یەکەم گۆڕانکاری گەورەی مرۆڤایەتییە بۆ نیشتەجێبوون و کشتوکاڵ.'
    },
    {
      title: 'میدییەکان (The Medes)',
      period: '٦٧٨ - ٥٥٠ پ.ز',
      desc: 'میدییەکان گەورەترین و بەهێزترین یەکێتیی هۆزە کوردییەکانیان دروست کرد. پایتەختەکەیان "ئەکباتان" بوو. نەورۆز وەک جەژنی سەرکەوتنی میدییەکان دەناسرێت.'
    },
    {
      title: 'ئیمپراتۆرییەتی گوتی (Guti)',
      period: '٢٢٠٠ پ.ز',
      desc: 'گوتییەکان یەکێکن لە کۆنترین هۆزە نیشتەجێبووەکانی چیاکانی زاگرۆس کە توانییان بۆ ماوەیەک حوکمی ناوچەی میزۆپۆتامیا بکەن و شوێنەواری گەورەی مێژوویی جێبهێڵن.'
    }
  ],
  dynasties: [
    {
      title: 'ئەییووبییەکان',
      period: '١١٧١ - ١٣٤١ ز',
      desc: 'گەورەترین دەسەڵاتی کوردی لە مێژووی ئیسلامیدا کە سەڵاحەدینی ئەییووبی دایمەزراند. ئەوان نەک تەنها قودسیان ڕزگار کرد، بەڵکو قەوارەیەکی یەکگرتوویان دروست کرد.'
    },
    {
      title: 'زەندییەکان',
      period: '١٧٥٠ - ١٧٩٤ ز',
      desc: 'کەریم خانی زەند، ئەو سەرکردە کوردەی کە حوکمی ئێرانی کرد و شاری شیرازی کردە پایتەخت. ئەو بە دادپەروەری و خاکەڕایی ناسرابوو و خۆی بە "وەکیلی ڕەعایە" دەناسی.'
    }
  ],
  principalities: [
    {
      title: 'میرنشینی بابان',
      period: '١٦٤٩ - ١٨٥١ ز',
      desc: 'سلێمان پاشای بابان شاری "سلێمانی" وەک پایتەخت بونیاد نا. ئەوان ناوەندێکی گەورەی زانست و شیعر بوون و شاعیرانی وەک نالی و سالم لەوێ گەشەیان کرد.'
    },
    {
      title: 'میرنشینی سۆران',
      period: '١٨١٦ - ١٨٣٦ ز',
      desc: 'لە سەردەمی میر محەمەد (پاشای کۆر)، ئەم میرنشینە گەیشتە لووتکەی هێزی خۆی و توانی چەکی تایبەت بەخۆی دروست بکات و دراو لێ بدات.'
    }
  ],
  leaders: [
    {
      title: 'جەلال تاڵەبانی (مام جەلال)',
      period: '١٩٣٣ - ٢٠١٧ ز',
      desc: 'سەرکردەیەکی کارێزماتیک و یەکەم سەرۆک کۆماری کورد لە عێراق. ئەو بە سیمبولی پێکەوەژیان و "سەروەری پارێزەری دەستوور" دەناسرێت.'
    },
    {
      title: 'مستەفا بارزانی',
      period: '١٩٠٣ - ١٩٧٩ ز',
      desc: 'ڕابەری بزووتنەوەی ڕزگاریخوازی نیشتمانی کورد و سەرکردەی شۆڕشی ئەیلوول. ئەو ژیانی خۆی لە پێناو خاک و گەلدا فیدا کرد.'
    },
    {
      title: 'شێخ مەحمودی حەفید',
      period: '١٨٧٨ - ١٩٥٦ ز',
      desc: 'پادشای کوردستان کە لە سلێمانی دژی داگیرکاری بەریتانیا ڕاپەڕی و بۆ یەکەمجار حکومەتی نیشتمانی کوردی لە سەدەی بیستەمدا دامەزراند.'
    }
  ],
  writers: [
    {
      title: 'ئەحمەدی خانی',
      period: '١٦٥٠ - ١٧٠٧ ز',
      desc: 'فەیلەسوف، شاعیر و ڕۆشنبیری گەورەی کورد و نووسەری داستانی "مەم و زین". ئەو بە یەکەم کەس دادەنرێت کە داوای یەکگرتوویی و دەوڵەتی نیشتمانی بۆ کورد کردووە.'
    },
    {
      title: 'فەقێی تەیران',
      period: '١٥٩٠ - ١٦٦٠ ز',
      desc: 'شاعیر و عارفی گەورەی کورد کە بە زمانی باڵندەکان و سروشت شیعرەکانی دەهۆنییەوە. ئەو یەکێکە لە کۆڵەکەکانی ئەدەبی کلاسیکی کرمانجی و خاوەنی داستانی "شێخی سەنعان"ە.'
    },
    {
      title: 'مەلای جزیری',
      period: '١٥٧٠ - ١٦٤٠ ز',
      desc: 'گەورە شاعیر و عارفی کورد کە بە زمانی کرمانجی شیعرەکانی نووسیوە. ئەو شاعیرێکی سۆفی بووە و دیوانەکەی بە یەکێک لە گرنگترین کارە ئەدەبییەکان دادەنرێت.'
    },
    {
      title: 'نالی (مەلا خدر)',
      period: '١٧٩٥ - ١٨٥٥ ز',
      desc: 'دامەزرێنەری قوتابخانەی شیعری بابان و گەورەترین شاعیری کلاسیکی کورد. ئەو زمانی کوردی (سۆرانی) گەیاندە لووتکەی ئەدەب و جوانی.'
    },
    {
      title: 'مەحوی (مەلا محەمەد)',
      period: '١٨٣٠ - ١٩٠٦ ز',
      desc: 'شاعیرێکی عاریف و گەورەی کورد بوو کە شیعرەکانی تێکەڵەیەکن لە عیشقی خودایی و نیشتمانپەروەری. خانەقاکەی لە سلێمانی مەڵبەندی ڕۆشنبیری بوو.'
    },
    {
      title: 'دڵدار (یونس ڕەئووف)',
      period: '١٩١٨ - ١٩٤٨ ز',
      desc: 'شاعیری نیشتمانی و دانەری سروودی "ئەی ڕەقیب" کە بووەتە مارشی نەتەوەیی کورد. ئەو ژیانێکی کورتی هەبوو بەڵام کاریگەرییەکی نەمری جێهێشت.'
    },
    {
      title: 'هەژار موکریانی',
      period: '١٩٢١ - ١٩٩١ ز',
      desc: 'شاعیر، نووسەر و وەرگێڕی مەزنی کورد. ئەو خاوەنی فەرهەنگی "هەنبانە بۆرینە"یە و قورئانی پیرۆز و چەندین شاکاری جیهانی وەرگێڕاوەتە سەر زمانی کوردی.'
    },
    {
      title: 'هێمن موکریانی',
      period: '١٩٢١ - ١٩٨٦ ز',
      desc: 'شاعیری نیشتمان و عیشق و جوانی. ئەو بە شیعرە ناسکەکانی وەک "ناڵەی جودایی" لە ناو دڵی هەموو کوردێکدا جێگەی گرتووە.'
    },
    {
      title: 'جگەرخوێن',
      period: '١٩٠٣ - ١٩٨٤ ز',
      desc: 'شاعیری هەژاران و ڕاپەڕین. ئەو بە هەشت دیوانە شیعرییەکەی هاندەری سەرەکی خەباتی نەتەوەیی بوو لە باکوور و ڕۆژئاوای کوردستان.'
    },
    {
      title: 'گۆران (عەبدوڵڵا گۆران)',
      period: '١٩٠٤ - ١٩٦٢ ز',
      desc: 'باوکی شیعری نوێی کوردییە. ئەو شێوازی عەرووزی گۆڕی بۆ کێشی پەنجە و سروشتی کوردستانی کردە هەوێنی سەرەکی شیعرەکانی.'
    },
    {
      title: 'شێرکۆ بێکەس',
      period: '١٩٤٠ - ٢٠١٣ ز',
      desc: 'ئیمپراتۆری شیعری کورد و نوێخوازێکی گەورە. ئەو خاوەنی خەڵاتی تۆخۆڵسکی سویدییە و دەیان دیوانی شیعری نەمری بۆ جێهێشتووین.'
    },
    {
      title: 'بەختیار عەلی',
      period: '١٩٦٠ - ئێستا',
      desc: 'ڕۆماننووس و فەیلەسوفی هاوچەرخی کورد. ڕۆمانەکانی وەک "دواهەمین هەناری دونیا" وەرگێڕدراونەتە سەر زۆربەی زمانە زیندووەکانی جیهان.'
    },
    {
      title: 'کەژاڵ ئەحمەد',
      period: '١٩٦٧ - ئێستا',
      desc: 'شاعیر، ڕۆژنامەنووس و یەکێک لە دەنگە هەرە مۆدێرنەکانی شیعری ژنی کورد کە باس لە ئازادی، مێینە و نیشتمان دەکات.'
    }
  ]
};

const HistorySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('origins');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-24 animate-in fade-in duration-1000" dir="rtl">
      {/* Royal Header */}
      <div className="text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        <div className="flex items-center justify-center gap-6 pt-10">
           <div className="h-px w-24 bg-yellow-500/20"></div>
           <div className="w-10 h-10 rounded-full border border-yellow-500/30 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,215,0,0.2)]">📜</div>
           <div className="h-px w-24 bg-yellow-500/20"></div>
        </div>
        <h2 className="text-5xl lg:text-8xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter leading-none">کۆشکی <span className="text-yellow-500 italic">مێژوو</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-[10px] font-['Noto_Sans_Arabic']">گەشتێکی شکۆدار بەناو مێژووی نەتەوەی کورد</p>
      </div>

      {/* Advanced Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
        {HISTORY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveTab(cat.id); setSelectedItem(null); }}
            className={`relative group p-5 rounded-[2rem] text-right transition-all duration-500 overflow-hidden border ${
              activeTab === cat.id 
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 shadow-[0_20px_40px_-10px_rgba(234,179,8,0.3)] scale-[1.03] z-10' 
                : 'bg-white/[0.03] border-white/5 hover:border-yellow-500/30 hover:bg-white/[0.05] grayscale-[0.5] hover:grayscale-0'
            }`}
          >
            <div className="relative flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-700 group-hover:rotate-[360deg] shadow-xl ${
                activeTab === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
              }`}>
                {cat.icon}
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm md:text-base font-black font-['Noto_Sans_Arabic'] leading-tight ${
                  activeTab === cat.id ? 'text-black' : 'text-white'
                }`}>
                  {cat.label}
                </h3>
                <p className={`text-[8px] font-bold uppercase tracking-widest ${
                  activeTab === cat.id ? 'text-black/60' : 'text-slate-500'
                }`}>
                  {cat.shortDesc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
        {HISTORY_DATA[activeTab]?.map((item, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedItem(item)}
            className="group relative h-[400px] md:h-[480px] rounded-[3.5rem] overflow-hidden border border-white/5 bg-[#0a0a0c] cursor-pointer hover:border-yellow-500/50 transition-all duration-700 shadow-3xl flex flex-col justify-end p-10 lg:p-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.04] via-transparent to-transparent"></div>
            <div className="absolute top-10 right-10 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-125 transition-transform duration-700 shadow-inner">
              {HISTORY_CATEGORIES.find(c => c.id === activeTab)?.icon}
            </div>
            
            <div className="relative space-y-5">
              <span className="text-yellow-500 font-black text-[10px] uppercase tracking-[0.5em]">{item.period}</span>
              <h3 className="text-3xl md:text-4xl font-black text-white font-['Noto_Sans_Arabic'] group-hover:text-yellow-500 transition-colors leading-tight">{item.title}</h3>
              <p className="text-slate-500 text-sm md:text-base line-clamp-3 font-['Noto_Sans_Arabic'] leading-relaxed group-hover:text-slate-300 transition-colors">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-700" onClick={() => setSelectedItem(null)}>
          <div className="relative w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
            <div className="p-16 lg:p-24 text-right space-y-12 overflow-y-auto max-h-[85vh] relative custom-scrollbar">
              <button onClick={() => setSelectedItem(null)} className="absolute top-12 left-12 w-14 h-14 bg-white/5 text-white rounded-full font-black flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all text-xl shadow-2xl">✕</button>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-end gap-6">
                    <span className="text-yellow-500 font-black text-xs uppercase tracking-[0.8em]">{selectedItem.period}</span>
                    <div className="h-px flex-1 bg-yellow-500/10"></div>
                 </div>
                 <h2 className="text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] leading-none tracking-tighter">{selectedItem.title}</h2>
              </div>
              
              <div className="h-px w-full bg-white/5"></div>
              
              <div className="space-y-12">
                <p className="text-slate-300 text-xl lg:text-3xl leading-[2.1] font-medium font-['Noto_Sans_Arabic'] text-justify">
                  {selectedItem.desc}
                </p>
              </div>
              
              <div className="pt-12">
                 <div className="p-10 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] flex items-center gap-8">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">📜</div>
                    <div className="space-y-1">
                       <h4 className="text-yellow-500 font-black text-[10px] uppercase tracking-widest">پاراستنی ناسنامە</h4>
                       <p className="text-xs md:text-sm font-bold text-yellow-600/60 leading-relaxed font-['Noto_Sans_Arabic']">
                         ئەم زانیارییانە بەشێکن لە ئەرشیفی مێژووی نیشتمانی KurdAI بۆ پاراستنی هەمیشەیی ناسنامە و شکۆی گەلی کورد.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySection;
