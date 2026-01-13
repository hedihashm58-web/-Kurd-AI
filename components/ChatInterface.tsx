
import React, { useState, useRef, useEffect, memo } from 'react';
import { Message } from '../types';
import { chatWithKurdAIStream } from '../services/geminiService';

const FormattedResponse = memo(({ text, isUser }: { text: string; isUser?: boolean }) => {
  const processLine = (line: string) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div className="h-1"></div>;
    
    if (cleanLine.startsWith('#')) {
      return (
        <h3 className={`text-lg lg:text-2xl font-black mb-2 ${isUser ? 'text-black' : 'text-yellow-500'} font-['Noto_Sans_Arabic']`}>
          {cleanLine.replace(/#+\s*/g, '')}
        </h3>
      );
    }
    
    return (
      <p className={`${isUser ? 'text-black font-bold text-base lg:text-lg' : 'text-slate-200 font-medium text-base lg:text-lg'} leading-relaxed mb-3 text-right font-['Noto_Sans_Arabic']`}>
        {cleanLine}
      </p>
    );
  };

  const lines = text.split('\n');
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out" dir="rtl">
      {lines.map((line, i) => <React.Fragment key={i}>{processLine(line)}</React.Fragment>)}
    </div>
  );
});

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    const userMsg: Message = { 
      role: 'user', 
      text: input, 
      image: selectedImage || undefined, 
      timestamp: new Date() 
    };
    
    // زیادکردنی نامەی بەکارهێنەر بۆ ڕووکارەکە
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    const currentImage = selectedImage;
    const currentHistory = [...messages]; 
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // ئامادەکردنی مێژوو بە شێوەیەک کە تەنها نامە دەقدارەکان بنێردرێن
      const history = currentHistory
        .filter(m => m.text && m.text.trim() !== "")
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const stream = await chatWithKurdAIStream(currentInput, history as any, currentImage);
      
      // شوێن بۆ وەڵامی AI
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "", 
        timestamp: new Date() 
      }]);

      let fullText = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'model') {
              updated[updated.length - 1] = { ...last, text: fullText };
            }
            return updated;
          });
        }
      }
      
      if (!fullText) throw new Error("سێرڤەر وەڵامی نەبوو");
      
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "ببورە، هەڵەیەک لە سێرڤەردا ڕوویدا. تکایە دڵنیابەرەوە لەوەی کلیلی API چالاکە و ئینتەرنێتەکەت باشە.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-[1200px] mx-auto glass-panel rounded-[3rem] overflow-hidden relative shadow-2xl border border-yellow-500/10" dir="rtl">
      {/* Messenger Header */}
      <div className="px-8 py-4 border-b border-white/5 bg-black/40 flex items-center justify-between backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full royal-sun-emblem flex items-center justify-center text-xl shadow-lg">☀️</div>
          <div className="text-right">
            <h3 className="text-white font-black text-sm font-['Noto_Sans_Arabic']">KurdAI Pro</h3>
            <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> چالاکە
            </span>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])} 
          className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors font-['Noto_Sans_Arabic']"
        >
          سڕینەوە
        </button>
      </div>

      {/* Chat Canvas */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 space-y-6 custom-scrollbar bg-[#020305]/30" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-black text-white font-['Noto_Sans_Arabic']">دەست بکە بە گفتوگۆ لەگەڵ KurdAI</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}>
            <div className={`max-w-[90%] md:max-w-[75%] group relative flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
              
              <div className={`relative px-6 py-4 rounded-[2rem] shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-[#FFD700] to-[#EAB308] text-black rounded-tr-sm' 
                  : 'bg-white/[0.04] border border-white/5 text-white backdrop-blur-3xl rounded-tl-sm'
              }`}>
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden shadow-md border border-black/5">
                    <img src={msg.image} alt="User Attachment" className="w-full max-h-48 object-cover" />
                  </div>
                )}
                <FormattedResponse text={msg.text} isUser={msg.role === 'user'} />
              </div>
              
              <span className="mt-1.5 px-3 text-[8px] font-bold text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (!messages[messages.length-1]?.text) && (
          <div className="flex w-full justify-end animate-in fade-in duration-200">
            <div className="bg-white/[0.04] border border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-sm flex gap-2 items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Console */}
      <div className="p-4 md:p-8 bg-black/60 border-t border-white/5 backdrop-blur-2xl">
        <div className="flex gap-3 items-end max-w-4xl mx-auto bg-white/[0.04] border border-white/5 rounded-[2.5rem] p-2 shadow-xl">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className={`h-12 w-12 rounded-full flex items-center justify-center text-xl transition-all active:scale-90 flex-shrink-0 ${
              selectedImage ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {selectedImage ? '✅' : '📷'}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            rows={1}
            className="flex-1 bg-transparent border-none text-white text-right text-base py-2.5 px-2 focus:outline-none focus:ring-0 resize-none max-h-32 custom-scrollbar font-['Noto_Sans_Arabic']"
            placeholder="لێرە پرسیارەکەت بنووسە..."
          />
          
          <button 
            onClick={handleSend} 
            disabled={isLoading || (!input.trim() && !selectedImage)} 
            className="h-12 px-6 bg-yellow-500 text-black rounded-full font-black text-xs uppercase tracking-widest shadow-md hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-95 flex-shrink-0 font-['Noto_Sans_Arabic']"
          >
            ناردن
          </button>
        </div>
        
        {selectedImage && (
          <div className="mt-3 flex justify-center">
            <div className="relative group">
              <img src={selectedImage} alt="Selected" className="h-16 w-16 object-cover rounded-xl border border-yellow-500 shadow-md" />
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-1.5 -left-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md hover:bg-red-600"
              >✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
