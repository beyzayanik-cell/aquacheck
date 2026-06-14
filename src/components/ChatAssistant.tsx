/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

interface ChatAssistantProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

const CHAT_PROMPTS_TR = [
  'Duş alırken su tasarrufu nasıl yapılır?',
  'Evcil hayvan beslerken su ayak izimi nasıl azaltırım?',
  'Su ayak izi skoru tam olarak nedir?',
  'Bahçe sulamada en çevre dostu yöntem hangisidir?'
];

const CHAT_PROMPTS_EN = [
  'How to save water while showering?',
  'How do I reduce my water footprint with pets?',
  'What strictly is a water footprint score?',
  'What is the most echo-friendly way to irrigate garden soil?'
];

export default function ChatAssistant({ 
  language, 
  colors, 
  chatHistory, 
  onSendMessage, 
  isLoading 
}: ChatAssistantProps) {
  
  const t = TRANSLATIONS[language];
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const prompts = language === 'tr' ? CHAT_PROMPTS_TR : CHAT_PROMPTS_EN;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePromptClick = (pText: string) => {
    if (isLoading) return;
    onSendMessage(pText);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  return (
    <div className="flex flex-col h-[74vh] animate-fade-in">
      
      {/* Assistant Info Banner */}
      <div className="p-4 rounded-t-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 relative">
          <Bot size={20} className="animate-bounce" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
        </div>
        <div>
          <span className="text-sm font-bold text-white block">{t.chatTitle}</span>
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Çevrimiçi • AI Sürdürülebilirlik Koçu</span>
        </div>
      </div>

      {/* Message scrolling body area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10 border-x border-white/5 scrollbar-thin">
        {chatHistory.length === 0 ? (
          // Initial greeting empty state
          <div className="p-8 text-center max-w-sm mx-auto my-auto space-y-4">
            <span className="text-5xl block animate-pulse">🤖</span>
            <h3 className="text-base font-bold text-white">Merhaba! Ben AquaCheck AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Su ayak izinizi azaltmanıza yardımcı olmak için buradayım. Su tasarrufu, ekolojik çözümler ve çevre ile ilgili dilediğiniz her şeyi sorabilirsiniz.
            </p>

            {/* Quick click suggestions prompts */}
            <div className="pt-4 flex flex-col gap-2">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(p)}
                  className="p-3 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-xs text-slate-300 font-semibold transition-all cursor-pointer hover:border-cyan-500/40 text-glow-hover active:scale-98"
                >
                  💡 "{p}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat bubbles
          chatHistory.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
              >
                {/* Bubble Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none ${
                  isAI 
                    ? 'bg-cyan-500/10 border-cyan-400/20 text-cyan-400' 
                    : 'bg-white/5 border-white/10 text-white'
                }`}>
                  {isAI ? <Bot size={14} /> : <User size={14} />}
                </div>

                {/* Bubble Text Card Container */}
                <div 
                  className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-lg relative ${
                    isAI 
                      ? 'rounded-tl-none border border-white/5 bg-white/[0.03] text-slate-200' 
                      : 'rounded-tr-none text-left text-slate-900 border border-sky-200'
                  }`}
                  style={!isAI ? { backgroundColor: '#e0f2fe', color: '#0f172a' } : {}}
                >
                  <p className="whitespace-pre-line text-left">{msg.text}</p>
                  <span className="text-[8px] font-bold text-slate-500 block text-right mt-1.5 uppercase">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <Bot size={14} />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none border border-white/5 bg-white/[0.02] text-slate-400 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{t.predicting}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Submit form */}
      <form onSubmit={handleSend} className="p-3 bg-white/[0.02] border border-white/5 rounded-b-xl flex gap-2 relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 px-5 text-sm text-white"
          placeholder={t.chatPlaceholder}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.primary }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
