
import React, { useState, useEffect } from 'react';
import { getLandmarks } from '../services/geminiService';

type Language = 'ku' | 'ar' | 'en';

const REGIONS = [
  { id: 'Erbil', label: 'هەولێر', catchy: { ku: 'پایتەختی مێژوویی و قەڵای دێرین.', ar: 'العاصمة التاريخية والقلعة القديمة.', en: 'The historical capital and ancient citadel.' } },
  { id: 'Sulaymaniyah', label: 'سلێمانی', catchy: { ku: 'مەڵبەندی ڕۆشنبیری و پایتەختی ئاشتی.', ar: 'المركز الثقافي وعاصمة السلام.', en: 'The cultural hub and capital of peace.' } },
  { id: 'Duhok', label: 'دهۆک', catchy: { ku: 'بووکی کوردستان و شاری چیا سەرکەشەکان.', ar: 'عروس كوردستان ومدينة الجبال الشامخة.', en: 'The bride of Kurdistan and the city of lofty mountains.' } },
  { id: 'Kirkuk', label: 'کەرکووک', catchy: { ku: 'شاری بابەگوڕگوڕ و پێکەوەژیان.', ar: 'مدينة بابا كركر والتعايش السلمي.', en: 'The city of Baba Gurgur and coexistence.' } },
  { id: 'Halabja', label: 'هەڵەبجە', catchy: { ku: 'پایتەختی ئاشتی و هێمای خۆڕاگری.', ar: 'عاصمة السلام ورمز الصمود.', en: 'The capital of peace and symbol of resilience.' } },
  { id: 'Garmian', label: 'گەرمیان', catchy: { ku: 'خاکی بەرخودان و گەرمەی مێژوو.', ar: 'أرض المقاومة وحرارة التاريخ.', en: 'The land of resistance and heat of history.' } },
  { id: 'Soran', label: 'سۆران', catchy: { ku: 'دەروازەی زۆزان و لوتکە بەرزەکان.', ar: 'بوابة الوديان والقمم العالية.', en: 'The gateway to highland valleys and high peaks.' } },
  { id: 'Akre', label: 'ئاکرێ', catchy: { ku: 'پایتەختی نەورۆز و شاری کەلەپوور.', ar: 'عاصمة نوروز ومدينة التراث.', en: 'The capital of Newroz and the city of heritage.' } },
  { id: 'Zakho', label: 'زاخۆ', catchy: { ku: 'شاری پردی دەلال و دەروازەی سنوور.', ar: 'مدينة جسر دلال وبوابة الحدود.', en: 'The city of Delal Bridge and the border gateway.' } },
  { id: 'Raperin', label: 'ڕاپەڕین', catchy: { ku: 'دەروازەی ڕاپەڕین و شاری خۆڕاگری.', ar: 'بوابة الانتفاضة ومدينة الصمود.', en: 'The gateway to the uprising and city of resilience.' } }
];

const MASTER_ASSETS: Record<string, string> = {
  'Erbil': 'https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000',
  'Sulaymaniyah': 'https://images.unsplash.com/photo-1628163539063-8828b0303b71?q=80&w=2000',
  'Duhok': 'https://images.unsplash.com/photo-1548685913-fe6574346a23?q=80&w=2000',
  'Kirkuk': 'https://images.unsplash.com/photo-1598369677332-94f488277258?q=80&w=2000',
  'Halabja': 'https://images.unsplash.com/photo-1656513735166-7d079313d4c7?q=80&w=2000',
  'Soran': 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?q=80&w=2000',
  'Akre': 'https://images.unsplash.com/photo-1595180425946-f949a557b667?q=80&w=2000'
};

const UI_TEXT = {
  ku: { header: 'گەڕان لە', span: 'کوردستان', sub: 'گەشتێکی بینراو بەناو شار و ناوچە گەشتیارییەکان', sectionTitle: 'شوێنەوار و جێگا گەشتیارییەکان', noteTitle: 'گەشتوگوزاری نیشتمانی', noteBody: 'کوردستان خاوەنی هەزاران شوێنەواری مێژووییە. KurdAI باشترین زانیاریت پێ دەدات.', cityLabel: 'دۆزینەوەی ناوچەیی' },
  ar: { header: 'استكشاف', span: 'كوردستان', sub: 'جولة بصرية عبر المدن والمناطق السياحية', sectionTitle: 'المعالم والمواقع السياحية', noteTitle: 'السياحة الوطنية', noteBody: 'تمتلك كوردستان آلاف المواقع التاريخية. يوفر لك KurdAI أفضل المعلومات.', cityLabel: 'اكتشاف المنطقة' },
  en: { header: 'Explore', span: 'Kurdistan', sub: 'A visual journey through cities and tourist regions', sectionTitle: 'Landmarks & Tourist Sites', noteTitle: 'National Tourism', noteBody: 'Kurdistan possesses thousands of historical sites. KurdAI provides you with the best insights.', cityLabel: 'Regional Discovery' }
};

const LandmarkExplorer: React.FC<{ onCityChange?: (url: string) => void }> = ({ onCityChange }) => {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [lang, setLang] = useState<Language>('ku');
  const [data, setData] = useState<{ cityNarrative: Record<Language, string>, landmarks: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeBackground, setActiveBackground] = useState<string>(MASTER_ASSETS['Erbil']);

  const fetchLandmarks = async (regionLabel: string) => {
    const found = REGIONS.find(r => r.label === regionLabel);
    if (found) {
      setSelectedRegion(found);
      const img = MASTER_ASSETS[found.id] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000';
      setActiveBackground(img);
      if (onCityChange) onCityChange(img);
    }
    setLoading(true);
    try {
      const result = await getLandmarks(regionLabel);
      setData(result);
    } catch (err) { 
      console.error(err); 
      setData(null);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchLandmarks(REGIONS[0].label); 
  }, []);

  const t = UI_TEXT[lang];
  const isRTL = lang === 'ku' || lang === 'ar';

  return (
    <div className={`space-y-20 animate-in fade-in duration-1000 pb-24 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Info */}
      <div className="text-center space-y-6">
        <div className="flex justify-center gap-3">
           {(['ku', 'ar', 'en'] as Language[]).map(l => (
             <button 
              key={l}
              onClick={() => setLang(l)}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${lang === l ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
             >
               {l === 'ku' ? 'کوردی' : l === 'ar' ? 'العربية' : 'English'}
             </button>
           ))}
        </div>
        <div className="space-y-4">
          <h2 className={`text-4xl lg:text-7xl font-black text-white tracking-tighter ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>
            {t.header} <span className="text-yellow-500 italic">{t.span}</span>
          </h2>
          <p className={`text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{t.sub}</p>
        </div>
      </div>

      {/* City Switcher - Scrollable Container */}
      <div className="relative">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-4 overflow-x-auto pb-6 px-4 md:px-0 scrollbar-hide no-scrollbar">
          {REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => fetchLandmarks(region.label)}
              className={`px-8 py-4 rounded-[1.8rem] font-black text-xs transition-all border whitespace-nowrap flex-shrink-0 ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"} ${
                selectedRegion.label === region.label 
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.2)] scale-105' 
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
              } uppercase tracking-widest`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[450px] md:h-[650px] w-full rounded-[4rem] md:rounded-[5rem] overflow-hidden border border-white/10 group shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
        <img src={activeBackground} className="absolute inset-0 w-full h-full object-cover brightness-[0.35] transition-transform duration-[5s] group-hover:scale-110" alt={selectedRegion.label} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 space-y-8">
           <span className={`text-yellow-500 font-black text-[10px] uppercase tracking-[1em] opacity-80 ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{t.cityLabel}</span>
           <h2 className={`text-6xl md:text-[10rem] font-black text-white leading-none tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>
             {selectedRegion.label}
           </h2>
           <p className={`text-white/80 font-bold text-xl md:text-4xl mt-6 max-w-4xl leading-tight ${lang === 'en' ? 'font-sans italic' : "font-['Noto_Sans_Arabic']"}`}>
             {selectedRegion.catchy[lang]}
           </p>
        </div>
      </div>

      {/* Landmarks Grid */}
      <div className="space-y-12 px-4">
        <div className={`flex items-center gap-6 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
           <h3 className={`text-2xl font-black text-white ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{t.sectionTitle}</h3>
           <div className="h-px flex-1 bg-white/10"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? [...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-white/5 rounded-[3.5rem] animate-pulse border border-white/5"></div>
          )) : 
            data?.landmarks.map((landmark, idx) => (
              <div key={idx} className="group relative h-80 rounded-[3.5rem] overflow-hidden border border-white/5 bg-[#0a0a0c] cursor-pointer hover:border-yellow-500/50 transition-all duration-700 flex flex-col justify-end p-12 shadow-2xl">
                 <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.03] to-transparent"></div>
                 <div className="relative space-y-4">
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                      <span className={`px-5 py-2 bg-yellow-500 text-black rounded-full font-black text-[9px] uppercase tracking-widest ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{landmark.category[lang]}</span>
                      <span className="text-2xl group-hover:rotate-12 transition-transform">📍</span>
                    </div>
                    <h3 className={`text-3xl font-black text-white group-hover:text-yellow-500 transition-colors leading-tight ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{landmark.name[lang]}</h3>
                    <p className={`text-slate-500 text-sm line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{landmark.description[lang]}</p>
                 </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Trilingual Note */}
      <div className="max-w-4xl mx-auto p-12 bg-yellow-500/5 border border-yellow-500/10 rounded-[4rem] text-center space-y-6">
         <div className="text-5xl">🏛️</div>
         <h4 className={`text-2xl font-black text-white ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>{t.noteTitle}</h4>
         <p className={`text-slate-400 font-medium leading-[2.1] text-lg ${lang === 'en' ? 'font-sans' : "font-['Noto_Sans_Arabic']"}`}>
           {t.noteBody}
         </p>
      </div>
    </div>
  );
};

export default LandmarkExplorer;
