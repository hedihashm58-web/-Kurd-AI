
import React, { useState, useRef, useEffect, memo } from 'react';
import { Message } from '../types';
import { chatWithKurdAIStream } from '../services/geminiService';

// بەکارهێنانی memo بۆ خێراکردنی کارایی
const FormattedResponse = memo(({ text, isUser }: { text: string; isUser?: boolean }) => {
  const processLine = (line: string) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div className="h-4"></div>;
    
    const isHeader = cleanLine.startsWith('#');
    cleanLine = cleanLine.replace(/#+\s*/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    
    if (isHeader) {
      return (
        <h3 className={`text-xl lg:text-3xl font-black mt-6 mb-4 border-r-4 ${isUser ? 'border-black text-black' : 'border-yellow-500 text-white'} pr-4 leading-tight`}>
          {cleanLine}
        </h3>
      );
    }
    
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      return (
        <div className="flex items-start gap-3 mb-3 pr-2">
          <div className={`w-2 h-2 rounded-full ${isUser ? 'bg-black/40' : 'bg-yellow-500'} mt-2.5 flex-shrink-0`}></div>
          <p className={`${isUser ? 'text-black/90' : 'text-slate-200'} text-lg lg:text-xl leading-relaxed`}>{cleanLine.substring(1).trim()}</p>
        </div>
      );
    }

    return <p className={`${isUser ? 'text-black font-bold text-xl lg:text-2xl' : 'text-slate-300 font-medium text-lg lg:text-xl'} leading-relaxed mb-4 text-right`}>{cleanLine}</p>;
  };

  const lines = text.split('\n');
  return <div className="space-y-1" dir="rtl">{lines.map((line, i) => <React.Fragment key={i}>{processLine(line)}</React.Fragment>)}</div>;
});

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    const userMsg: Message = { role: 'user', text: input, image: selectedImage || undefined, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = await chatWithKurdAIStream(currentInput, history as any, currentImage);
      
      let fullText = "";
      const assistantMsg: Message = { role: 'model', text: "", timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);

      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullText;
          return updated;
        });
      }
    } catch (error: any) {
      console.error("API Error:", error);
      const errorText = error?.message?.includes('API Key') 
        ? "کلیلێکی API دروست نەدۆزرایەوە. تکایە دڵنیابەرەوە لە ڕێکخستنەکان." 
        : "ببورە، کێشەیەک لە پەیوەندی سێرڤەر ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە یان ئینتەرنێتەکەت بپشکنە.";
        
      setMessages(prev => [...prev, { role: 'model', text: errorText, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] glass-panel rounded-[3rem] shadow-3xl overflow-hidden relative" dir="rtl">
      
      <div className="flex-1 overflow-y-auto px-6 lg:px-16 py-10 space-y-12 custom-scrollbar" ref={scrollRef}>
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-10 opacity-80">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] sun-emblem flex items-center justify-center text-6xl shadow-2xl">☀️</div>
            <div className="space-y-4 max-w-xl">
              <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                بەخێربێیت بۆ <span className="text-yellow-500 underline decoration-yellow-500/30">KurdAI Pro</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium">چۆن دەتوانم هاوکارت بم لە گەڕان بەدوای مێژوو، زانست یان کولتووری کوردستان؟</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative px-8 lg:px-12 py-8 lg:py-10 rounded-[2.5rem] max-w-[95%] lg:max-w-[80%] shadow-2xl transition-all ${
              msg.role === 'user' 
                ? 'bg-white text-black border-2 border-yellow-500 shadow-yellow-500/10' 
                : 'bg-white/[0.04] border border-white/5 text-white backdrop-blur-3xl'
            }`}>
              {msg.image && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-black/5">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-[350px] object-cover" />
                </div>
              )}
              <FormattedResponse text={msg.text} isUser={msg.role === 'user'} />
              <div className={`text-[8px] mt-6 opacity-30 font-black tracking-widest ${msg.role === 'user' ? 'text-black' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-end animate-pulse">
            <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-full flex gap-3 items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KurdAI خەریکی وەڵامدانەوەیە...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 lg:p-10 bg-black/40 border-t border-white/5 backdrop-blur-3xl">
        <div className="max-w-5xl mx-auto flex gap-4 items-center">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => setSelectedImage(event.target?.result as string);
              reader.readAsDataURL(file);
            }
          }} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`h-16 w-16 lg:h-20 lg:w-20 rounded-2xl flex items-center justify-center text-2xl transition-all ${
              selectedImage ? 'bg-yellow-500 text-black' : 'bg-white/5 border border-white/10 text-slate-400'
            }`}
          >
            📷
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full px-8 py-5 lg:py-6 rounded-3xl bg-white/5 border border-white/10 text-white text-right text-lg lg:text-xl focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-slate-700"
              placeholder="پرسیارەکەت لێرە بنووسە..."
            />
          </div>
          
          <button 
            onClick={handleSend} 
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="h-16 lg:h-20 px-8 lg:px-12 bg-yellow-500 text-black rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-95"
          >
            ناردن
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
