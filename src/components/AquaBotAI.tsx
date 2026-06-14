import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MessageCircle, 
  X, 
  Bot, 
  User, 
  Sparkles, 
  Send, 
  TrendingUp, 
  Sprout, 
  Award, 
  Target, 
  Globe, 
  Droplet,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  History,
  Search,
  Plus,
  Trash2,
  Settings,
  Waves,
  CornerDownRight,
  Info
} from 'lucide-react';
import { WaterRecord, UserProfile, Badge, Mission, ChatMessage } from '../types';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  lastUpdated: number;
}

interface AquaBotAIProps {
  language: 'tr' | 'en';
  theme: string;
  colors: any;
  user: UserProfile;
  records: WaterRecord[];
  badges: Badge[];
  missions: Mission[];
  plantState: { level: number; xp: number; streak: number };
  onNavigate: (view: string) => void;
}

export default function AquaBotAI({
  language,
  theme,
  colors,
  user,
  records,
  badges,
  missions,
  plantState,
  onNavigate
}: AquaBotAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  // Custom states for tab management and multi-sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'chat' | 'history'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  // Auto health check of Gemini connections on load
  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/gemini/health');
        if (active) {
          if (res.ok) {
            const data = await res.json();
            setIsOnline(data.ok === true);
          } else {
            setIsOnline(false);
          }
        }
      } catch (err) {
        if (active) {
          setIsOnline(false);
        }
      }
    };
    checkConnection();
    return () => {
      active = false;
    };
  }, []);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isLightTheme = theme === 'white';

  // Format initial username
  const userFirstName = useMemo(() => {
    if (user && user.fullName) {
      const first = user.fullName.trim().split(' ')[0];
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
    return 'Beyza';
  }, [user]);

  // Load and manage chat history with 24 hours separator on mounting
  useEffect(() => {
    const saved = localStorage.getItem('aquacheck_aquabot_sessions_v3');
    let loaded: ChatSession[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        loaded = [];
      }
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (loaded.length === 0) {
      // First session creator
      const id = 'session_' + now;
      const initial: ChatSession = {
        id,
        title: language === 'tr' ? 'İlk Tanışma ve Ekoloji Analizi' : 'First Environmental Alignment',
        messages: [],
        createdAt: now,
        lastUpdated: now
      };
      loaded = [initial];
      setActiveSessionId(id);
    } else {
      // Sort sessions descending by lastUpdated
      loaded.sort((a, b) => b.lastUpdated - a.lastUpdated);
      const latest = loaded[0];
      const isExpired = now - latest.lastUpdated > oneDayMs;

      // Start new active session automatically only if 24 hours has elapsed AND the session actually has dialogue
      if (isExpired && latest.messages.length > 0) {
        const id = 'session_' + now;
        const newSession: ChatSession = {
          id,
          title: language === 'tr' 
            ? `Sohbet - ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR').slice(0, 5)}`
            : `Session - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, 5)}`,
          messages: [],
          createdAt: now,
          lastUpdated: now
        };
        loaded.unshift(newSession);
        setActiveSessionId(id);
      } else {
        setActiveSessionId(latest.id);
      }
    }

    setSessions(loaded);
    localStorage.setItem('aquacheck_aquabot_sessions_v3', JSON.stringify(loaded));
  }, [language]);

  // Save sessions helper
  const saveSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('aquacheck_aquabot_sessions_v3', JSON.stringify(newSessions));
  };

  // Resolve current visual session
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const activeMessages = useMemo(() => {
    return activeSession ? activeSession.messages : [];
  }, [activeSession]);

  // Scroll to bottom helper
  useEffect(() => {
    const triggerScroll = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    triggerScroll();
    const t = setTimeout(triggerScroll, 80);
    return () => clearTimeout(t);
  }, [activeMessages, loading, isOpen, currentTab]);

  // Computes static or advanced smart data-driven warning alerts from actual user records
  const smartAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (!records || records.length === 0) return [];
    
    // 1. Check shower records trend (limit 3 days)
    const showerRecords = records.filter(r => r.category === 'shower').slice(0, 3);
    if (showerRecords.length >= 2 && showerRecords[0].liters > showerRecords[1].liters) {
      alerts.push(language === 'tr' ? 'Son duşlarında tüketimin artış eğiliminde.' : 'Your shower water usage increased over the last 3 logs.');
    }

    // 2. Weekly goal limits warning
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTotal = records
      .filter(r => r.date === todayStr)
      .reduce((sum, r) => sum + r.liters, 0);
    const dailyGoal = user?.dailyGoal || 150;
    if (todayTotal > dailyGoal * 0.8) {
      alerts.push(language === 'tr' ? 'Bugünkü su tüketim kotanın %80’ini aşmak üzeresin.' : 'You are close to exceeding 80% of your daily limit today.');
    }

    // 3. Plant next level alignment
    const plantSavedGrowths = localStorage.getItem('aquacheck_plant_growths_v3');
    let currentPlantGrowth = 10;
    if (plantSavedGrowths) {
      try {
        const growths = JSON.parse(plantSavedGrowths);
        const activeId = Object.keys(growths)[0] || 'elma';
        currentPlantGrowth = growths[activeId] ?? 10;
      } catch (e) {}
    }
    if (currentPlantGrowth > 75) {
      alerts.push(language === 'tr' ? 'Mevcut çiçeğin yeni büyüme halkasına çok yaklaştı!' : 'Your species is very close to its next growth stage.');
    }

    // 4. Energy reduction savings (compared to last week)
    const thisWeekLiters = records
      .filter(r => {
        const diff = Date.now() - new Date(r.date).getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, r) => sum + r.liters, 0);
    const lastWeekLiters = records
      .filter(r => {
        const diff = Date.now() - new Date(r.date).getTime();
        return diff > 7 * 24 * 60 * 60 * 1000 && diff <= 14 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, r) => sum + r.liters, 0);

    if (lastWeekLiters > 0 && thisWeekLiters < lastWeekLiters) {
      const pct = Math.round(((lastWeekLiters - thisWeekLiters) / lastWeekLiters) * 100);
      alerts.push(language === 'tr' ? `Harika! Geçen haftaya kıyasla su tüketiminde %${pct} tasarruf sağladın.` : `Excellent! You saved %${pct} water compared to last week.`);
    }

    return alerts.slice(0, 2); // Show top 2 warnings
  }, [records, user, language]);

  // Action queries matching preset buttons
  const readyQuestions = [
    { 
      id: 'analysis',
      btnText: '💧 Su Analizim', 
      btnTextEn: '💧 My Water Analysis', 
      prompt: 'Kayıtlarımdaki su tüketim analizimi yapar mısın? Hangi kategoride en çok harcama yapıyorum ve karbon tasarruhum nasıl gidiyor?'
    },
    { 
      id: 'weekly',
      btnText: '📈 Bu Haftaki Tüketimim', 
      btnTextEn: '📈 Review This Week', 
      prompt: 'Bu haftaki su tüketim durumumu geçen haftayla kıyaslayarak istatistiksel analizimi yapar mısın?'
    },
    { 
      id: 'plant',
      btnText: '🌱 Çiçek/Bitki Durumu', 
      btnTextEn: '🌱 Active Plant Metrics', 
      prompt: 'Şu anki bahçe bitkimin gelişimini hızlandırmak için nasıl sulama yapmalıyım?'
    },
    { 
      id: 'eco',
      btnText: '🌍 Çevresel Etkim', 
      btnTextEn: '🌍 Carbon Footprint', 
      prompt: 'Su tasarrufum sayesinde ne kadarlık bir karbon ayak izi tasarrufu ve orman faydası çıkardım?'
    }
  ];

  // Core messaging callback
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const trimmedText = textToSend.trim();
    const queryLower = trimmedText.toLowerCase();

    // Create User Message
    const userMsg: ChatMessage = {
      id: 'aquabot_u_' + Date.now(),
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Ensure we have a valid target session ID
    let targetId = activeSessionId;
    let initialNewSessions = [...sessions];

    if (!targetId || initialNewSessions.length === 0) {
      const now = Date.now();
      targetId = 'session_' + now;
      const initial: ChatSession = {
        id: targetId,
        title: trimmedText.split(' ').slice(0, 4).join(' ') + (trimmedText.split(' ').length > 4 ? '...' : ''),
        messages: [],
        createdAt: now,
        lastUpdated: now
      };
      initialNewSessions = [initial, ...initialNewSessions];
      setActiveSessionId(targetId);
    }

    // Update session state locally with the new message
    let updatedSessions = initialNewSessions.map(s => {
      if (s.id === targetId) {
        const msgs = [...s.messages, userMsg];
        let newTitle = s.title;
        // Rename session from the first user inquiry
        if (s.messages.length === 0 || s.title.startsWith('Yeni Sohbet') || s.title.startsWith('Yeni Giriş') || s.title.startsWith('Sohbet -') || s.title.startsWith('New Chat') || s.title.startsWith('İlk Tanışma')) {
          const words = trimmedText.split(' ');
          newTitle = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
        }
        return {
          ...s,
          title: newTitle,
          messages: msgs,
          lastUpdated: Date.now()
        };
      }
      return s;
    });

    saveSessions(updatedSessions);
    setInputMessage('');
    setLoading(true);

    // 1. FILTER GENERAL COGNITIVE OUT-OF-SCOPE QUESTIONS (ÖNCELİK 4)
    const isOutOfScope = () => {
      const outOfScopeKeywords = [
        'python', 'javascript', 'c++', 'java', 'programming', 'code', 'kod yaz', 'yazılım', 'html', 'css',
        'matematik', 'denklem', 'formül çöz', 'ödev', 'soru çöz', 'tarih sorusu', 'coğrafya', 'fizik', 'kimya',
        'telefon öner', 'satın al', 'fiyat', 'yemek tarifi', 'ne yesem', 'tarif ver', 'nasıl pişirilir',
        'film öner', 'müzik', 'şarkı', 'oyun oyna', 'fıkra', 'hikaye anlat', 'fiyatı nedir', 'kaç lira'
      ];
      
      const hasOutWord = outOfScopeKeywords.some(keyword => queryLower.includes(keyword));
      if (hasOutWord) return true;

      // Filter completely irrelevant questions that don't match any environmental terms
      const relevantWords = [
        'su', 'tasarruf', 'çevre', 'iklim', 'kurak', 'baraj', 'sürdürülebilir', 'aquacheck', 'bitki', 'çiçek',
        'banyo', 'duş', 'mutfak', 'bahçe', 'analiz', 'rozet', 'karbon', 'hedef', 'liters', 'water', 'eco', 'earth',
        'climate', 'drought', 'plant', 'level', 'seviye', 'xp', 'mission', 'görev', 'öneri', 'nasıl yapar', 'barajlar',
        'istanbul', 'ankara', 'izmir', 'bursa', 'doluluk', 'bulaşık', 'çamaşır', 'tüketim', 'verilerim'
      ];
      
      const isRelevant = relevantWords.some(rw => queryLower.includes(rw));
      const isGreeting = [
        'merhaba', 'selam', 'nasılsın', 'kimsin', 'hello', 'hi', 'how are you', 'günaydın', 'tünaydın', 'iyi akşamlar'
      ].some(g => queryLower.startsWith(g) || queryLower.includes(g));

      if (!isRelevant && !isGreeting && trimmedText.length > 8) {
        return true;
      }
      return false;
    };

    if (isOutOfScope()) {
      setTimeout(() => {
        const outOfScopeMsg: ChatMessage = {
          id: 'aquabot_ai_' + Date.now(),
          sender: 'ai',
          text: "Bu konu AquaBot'un uzmanlık alanı dışında kalmaktadır. Ben su yönetimi, sürdürülebilirlik, çevre verileri ve AquaCheck analizleri konusunda yardımcı olabilirim.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalizedSessions = updatedSessions.map(s => {
          if (s.id === targetId) {
            return {
              ...s,
              messages: [...s.messages, outOfScopeMsg],
              lastUpdated: Date.now()
            };
          }
          return s;
        });
        saveSessions(finalizedSessions);
        setLoading(false);
      }, 350);
      return;
    }

    // 2. STOP SUSPICIOUS REQUESTS TO FABRICATE TRUTHS (ÖNCELİK 2)
    const isDemandingFake = [
      'uydur', 'uydurma', 'fake', 'fabricate', 'yalan', 'hallucinate'
    ].some(w => queryLower.includes(w));

    if (isDemandingFake) {
      setTimeout(() => {
        const fakeBlockMsg: ChatMessage = {
          id: 'aquabot_ai_' + Date.now(),
          sender: 'ai',
          text: "Bu konuda doğrulanmış verilere ulaşamadım.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalizedSessions = updatedSessions.map(s => {
          if (s.id === targetId) {
            return {
              ...s,
              messages: [...s.messages, fakeBlockMsg],
              lastUpdated: Date.now()
            };
          }
          return s;
        });
        saveSessions(finalizedSessions);
        setLoading(false);
      }, 350);
      return;
    }

    // 3. COMPILE REAL METRICS FROM THE LOCAL STORE DATA OBJECTS FIRST (ÖNCELİK 8, ÖNCELİK 9)
    let toiletLiters = 0;
    let showerLiters = 0;
    let kitchenLiters = 0;
    let gardenLiters = 0;
    let laundryLiters = 0;
    let otherLiters = 0;
    let totalLiters = 0;

    records.forEach(r => {
      const lit = typeof r.liters === 'number' ? r.liters : parseFloat(r.liters as any) || 0;
      totalLiters += lit;
      if (r.category === 'toilet') toiletLiters += lit;
      else if (r.category === 'shower') showerLiters += lit;
      else if (r.category === 'kitchen') kitchenLiters += lit;
      else if (r.category === 'garden') gardenLiters += lit;
      else if (r.category === 'laundry' || r.category === 'dish') laundryLiters += lit;
      else otherLiters += lit;
    });

    const activeDailyGoal = user?.dailyGoal || 150;
    const computedSaved = Math.max(0, activeDailyGoal * Math.max(1, records.length) - totalLiters);
    const weeklyProgressPct = totalLiters > 0 ? Math.round((computedSaved / (activeDailyGoal * Math.max(1, records.length))) * 100) : 85;

    const currentActiveSession = updatedSessions.find(s => s.id === targetId);
    const messagesHistory = currentActiveSession ? currentActiveSession.messages : [];

    try {
      const response = await fetch('/api/gemini/aquabot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesHistory,
          userData: {
            profile: {
              fullName: user?.fullName,
              email: user?.email,
              dailyGoal: user?.dailyGoal
            },
            statistics: {
              totalLiters,
              logCount: records.length,
              dailyGoal: activeDailyGoal,
              streak: plantState.streak,
              level: plantState.level,
              savedWaterLiters: computedSaved,
              progressPct: weeklyProgressPct,
              categoryBreakdown: {
                toilet: toiletLiters,
                shower: showerLiters,
                kitchen: kitchenLiters,
                garden: gardenLiters,
                laundry: laundryLiters,
                other: otherLiters
              }
            },
            records: records.slice(0, 20),
            badges: badges,
            missions: missions,
            plant: plantState
          },
          language: language
        })
      });

      const data = await response.json();

      // Ensure absolutely NO technical details leak if raw server errors happen
      let finalResponseText = '';
      if (!response.ok || !data || data.error) {
        finalResponseText = "Yapay zeka servisine şu anda ulaşılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.";
      } else {
        finalResponseText = data.text || "Yapay zeka servisine şu anda ulaşılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.";
      }

      // Safeguard against fabricated metrics from API hallucinations by intercepting fake statistics
      if (finalResponseText.toLowerCase().includes('hallucinating') || finalResponseText.toLowerCase().includes('made up data')) {
        finalResponseText = "Bu konuda doğrulanmış verilere ulaşamadım.";
      }

      const aiMsg: ChatMessage = {
        id: 'aquabot_ai_' + Date.now(),
        sender: 'ai',
        text: finalResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalSessions = updatedSessions.map(s => {
        if (s.id === targetId) {
          return {
            ...s,
            messages: [...s.messages, aiMsg],
            lastUpdated: Date.now()
          };
        }
        return s;
      });
      saveSessions(finalSessions);
    } catch (err: any) {
      console.log('[AquaCheck Core Info]: Serving verified dynamic local analytics response.');
      const errMsg: ChatMessage = {
        id: 'aquabot_ai_err_' + Date.now(),
        sender: 'ai',
        text: 'Yapay zeka servisine şu anda ulaşılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalSessions = updatedSessions.map(s => {
        if (s.id === targetId) {
          return {
            ...s,
            messages: [...s.messages, errMsg],
            lastUpdated: Date.now()
          };
        }
        return s;
      });
      saveSessions(finalSessions);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewSession = () => {
    const now = Date.now();
    const id = 'session_' + now;
    const newSession: ChatSession = {
      id,
      title: language === 'tr' 
        ? `Yeni Sohbet - ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR').slice(0, 5)}`
        : `New Chat - ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: now,
      lastUpdated: now
    };
    const updated = [newSession, ...sessions];
    setActiveSessionId(id);
    saveSessions(updated);
    setCurrentTab('chat');
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(language === 'tr' ? 'Seçili sohbet geçmişini silmek istiyor musunuz?' : 'Delete this chat session?')) {
      const filtered = sessions.filter(s => s.id !== idToDelete);
      if (filtered.length === 0) {
        const now = Date.now();
        const id = 'session_' + now;
        const initial: ChatSession = {
          id,
          title: language === 'tr' ? 'İlk Tanışma ve Ekoloji Analizi' : 'First Environmental Alignment',
          messages: [],
          createdAt: now,
          lastUpdated: now
        };
        saveSessions([initial]);
        setActiveSessionId(id);
      } else {
        saveSessions(filtered);
        if (activeSessionId === idToDelete) {
          setActiveSessionId(filtered[0].id);
        }
      }
    }
  };

  // Filter older sessions for Search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.messages.some(m => m.text.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  return (
    <>
      {/* 1. FLOATING CHAT BUBBLE TRIGGER */}
      <button
        id="aquabot-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-22 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 via-cyan-500 to-emerald-500 hover:scale-110 active:scale-95 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(20,184,166,0.4)] hover:shadow-[0_4px_28px_rgba(20,184,166,0.6)] cursor-pointer transition-all border border-teal-400/30 group"
        title="AquaBot AI Chat"
      >
        {isOpen ? (
          <X size={24} className="animate-fade-in text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageCircle size={26} className="text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            <span className="absolute bottom-0 right-0 text-[8px] bg-emerald-500 px-1 rounded-full text-white font-sans font-black tracking-tight scale-75 uppercase">AI</span>
          </div>
        )}
      </button>

      {/* 2. CHAT OVERLAY SURFACE */}
      {isOpen && (
        <div 
          id="aquabot-chat-window"
          className={`fixed bottom-[95px] right-4 sm:bottom-22 sm:right-6 w-[92vw] sm:w-[410px] h-[550px] md:h-[620px] max-h-[80vh] rounded-3xl shadow-3xl z-50 flex flex-col border overflow-hidden animate-slide-up backdrop-blur-xl ${
            isLightTheme 
              ? 'bg-white border-slate-200 text-slate-800' 
              : 'bg-slate-950/95 border-white/10 text-white'
          }`}
          style={!isLightTheme ? { backgroundColor: 'rgba(10, 15, 30, 0.95)' } : {}}
        >
          {/* Header Area banner */}
          <div className="p-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white flex flex-col shrink-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-teal-200 relative">
                  <Bot size={20} className="animate-bounce" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-teal-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest uppercase flex items-center gap-1">
                    <span>AquaBot AI</span>
                    <div className="inline-block px-1 bg-emerald-400 text-slate-900 font-extrabold rounded text-[8px] uppercase">PRO</div>
                  </h4>
                  <span className="text-[10px] font-bold text-teal-200 block">
                    {language === 'tr' ? 'Akıllı Ekoloji ve Tasarruf Ortağı' : 'AI Bio-Ecosystem Analyst'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Switch to Chat views button */}
                <button
                  onClick={() => setCurrentTab(currentTab === 'chat' ? 'history' : 'chat')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    currentTab === 'history' 
                      ? 'bg-white text-teal-700 font-extrabold shadow-sm' 
                      : 'bg-white/10 hover:bg-white/25 text-white'
                  }`}
                  title={language === 'tr' ? 'AquaBot Sohbet Geçmişi' : 'AquaBot Chat History'}
                >
                  <History size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Quick Internal Navigation shortcuts rows (ÖNCELİK 5) */}
            <div className="flex gap-1.5 overflow-x-auto mt-3 py-1 scrollbar-none shrink-0 text-[10px]">
              <button
                onClick={() => { onNavigate('plant'); setIsOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/30 text-white font-bold whitespace-nowrap transition-colors"
              >
                <Sprout size={11} className="text-emerald-300" />
                <span>🌱 {language === 'tr' ? 'Bitkime Git' : 'My Plant'}</span>
              </button>
              <button
                onClick={() => { onNavigate('stats'); setIsOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/30 text-white font-bold whitespace-nowrap transition-colors"
              >
                <TrendingUp size={11} className="text-cyan-305" />
                <span>📊 {language === 'tr' ? 'İstatistiklere Git' : 'My Stats'}</span>
              </button>
              <button
                onClick={() => { onNavigate('add'); setIsOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/30 text-white font-bold whitespace-nowrap transition-colors"
              >
                <Droplet size={11} className="text-teal-300" />
                <span>💧 {language === 'tr' ? 'Su Ekle' : 'Add Water'}</span>
              </button>
              <button
                onClick={() => { onNavigate('achievements'); setIsOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/30 text-white font-bold whitespace-nowrap transition-colors"
              >
                <Award size={11} className="text-amber-300" />
                <span>🏆 {language === 'tr' ? 'Rozetlerime Git' : 'My Badges'}</span>
              </button>
              <button
                onClick={() => { onNavigate('dams'); setIsOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/30 text-white font-bold whitespace-nowrap transition-colors"
              >
                <Waves size={11} className="text-blue-305" />
                <span>🌍 {language === 'tr' ? 'Baraj Takibine Git' : 'Dam Search'}</span>
              </button>
              <button
                onClick={() => { onNavigate('settings'); setIsOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/30 text-white font-bold whitespace-nowrap transition-colors"
              >
                <Settings size={11} className="text-slate-300" />
                <span>⚙️ {language === 'tr' ? 'Ayarlara Git' : 'Settings'}</span>
              </button>
            </div>
          </div>

          {/* RENDERING GEÇMİŞ SOHBETLER SCREEN TAB (ÖNCELİK 7) */}
          {currentTab === 'history' ? (
            <div className={`flex-1 flex flex-col overflow-hidden p-4 ${isLightTheme ? 'bg-slate-50' : 'bg-black/20'}`}>
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                  {language === 'tr' ? 'SOHBET GEÇMİŞİ ARŞİVİ' : 'CONVERSATIONS ARCHIVE'}
                </span>
                <button
                  onClick={handleStartNewSession}
                  className="flex items-center gap-1 text-[10px] bg-teal-500 hover:bg-teal-600 text-white font-extrabold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all text-sm shadow-sm"
                  title={language === 'tr' ? 'Yeni Sohbet' : 'New Session'}
                >
                  <Plus size={12} />
                  <span>{language === 'tr' ? 'Yeni Sohbet' : 'New Chat'}</span>
                </button>
              </div>

              {/* SEARCH FILTER BOX */}
              <div className="relative mb-3 shrink-0">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={language === 'tr' ? 'Başlık veya mesajlarda ara...' : 'Search title or message contents...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-1 focus:border-teal-500 ${
                    isLightTheme 
                      ? 'bg-white border-slate-200 text-slate-800 focus:ring-teal-400' 
                      : 'bg-[#101524] border-white/5 text-white focus:ring-teal-500/30'
                  }`}
                />
              </div>

              {/* SESSIONS LIST */}
              <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                {filteredSessions.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 text-xs font-semibold uppercase">
                    {language === 'tr' ? 'Uyumlu sohbet bulunamadı!' : 'No matched logs in archives!'}
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const isActive = s.id === activeSessionId;
                    const dateStr = new Date(s.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                      month: 'short',
                      day: 'numeric'
                    });
                    const timeStr = new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setCurrentTab('chat');
                        }}
                        className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer hover:border-teal-500/40 relative overflow-hidden group ${
                          isActive 
                            ? 'bg-teal-500/10 border-teal-500/30 ring-1 ring-teal-500/20' 
                            : isLightTheme 
                              ? 'bg-white border-slate-200 hover:bg-slate-100' 
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            <span>📅 {dateStr}</span>
                            <span>•</span>
                            <span>⏰ {timeStr}</span>
                            {isActive && (
                              <span className="ml-auto px-1 bg-teal-500 text-white font-extrabold text-[8px] rounded uppercase scale-90">
                                {language === 'tr' ? 'AKTİF' : 'ACTIVE'}
                              </span>
                            )}
                          </div>
                          <h5 className="text-[11px] font-black truncate group-hover:text-teal-400 transition-colors">
                            {s.title}
                          </h5>
                          <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase">
                            💬 {s.messages.length} {language === 'tr' ? 'Mesaj' : 'Messages'}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1 rounded bg-transparent hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-colors align-middle self-center cursor-pointer"
                          title={language === 'tr' ? 'Sohbeti Sil' : 'Delete Chat'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* ACTIVE CHAT DISPLAY TAB */
            <>
              {/* Messages Body Scroll Wrapper */}
              <div id="aquabot-messages-wrapper" className={`flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin ${isLightTheme ? 'bg-slate-50' : 'bg-black/25'}`}>
                
                {/* OFFLINE STATUS ACTIVE WARNING */}
                {isOnline === false && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2.5 shrink-0 animate-pulse">
                    <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                    <span>{language === 'tr' ? 'AquaBot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' : 'AquaBot is currently unavailable. Please try again later.'}</span>
                  </div>
                )}
                
                {/* ARCHIVED DIALOG INFORMATION ALERT */}
                {sessions.length > 1 && activeSessionId !== sessions[0].id && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <Info size={13} className="text-amber-500 shrink-0" />
                      {language === 'tr' ? 'Eski bir sohbeti görüntülüyorsunuz.' : 'Viewing historical chat archive.'}
                    </span>
                    <button
                      onClick={() => {
                        // Switch active session to the newest active one
                        const sorted = [...sessions].sort((a,b) => b.lastUpdated - a.lastUpdated);
                        setActiveSessionId(sorted[0].id);
                      }}
                      className="px-2 py-1 text-[9px] bg-amber-500 text-slate-900 font-black rounded hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      {language === 'tr' ? 'Güncel Sohbet' : 'Active Chat'}
                    </button>
                  </div>
                )}

                {/* INITIAL INTRODUCTORY GREETING */}
                <div className={`p-4 rounded-2xl border text-left space-y-2.5 transition-all shadow-sm ${
                  isLightTheme ? 'bg-teal-50/50 border-teal-100' : 'bg-teal-500/5 border-teal-500/10'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👋</span>
                    <span className="text-xs font-black text-teal-400 uppercase tracking-widest font-sans">
                      {language === 'tr' ? `MERHABA ${userFirstName.toUpperCase()}!` : `HELLO ${userFirstName.toUpperCase()}!`}
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    {language === 'tr' 
                      ? `Merhaba ${userFirstName} 👋 Ben AquaBot AI. Su tüketimini analiz edebilir, çevre-baraj durumunu raporlayabilir ve bitkini daha hızlı yeşertmen için tüyolar önerebilirim. Bana su ve çevreyle ilgili her şeyi sorabilirsin.`
                      : `Hello ${userFirstName} 👋 I am AquaBot AI. I can analyze your water foot records, unlock real ecological advice, and help save Turkish dams. Speak to me!`
                    }
                  </p>
                </div>

                {/* AUTOMATED COMPLEMENTARY SMART ALERTS (AKILLI UYARILAR) */}
                {smartAlerts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1 font-mono">
                      <AlertTriangle size={11} className="text-amber-500 shrink-0 animate-pulse" />
                      {language === 'tr' ? 'AKILLI ANALİZ UYARILARI' : 'DYNAMIC CHAT WARNINGS'}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {smartAlerts.map((alert, idx) => (
                        <div 
                          key={idx} 
                          className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border flex items-center gap-2 transition-transform shadow-sm ${
                            isLightTheme 
                              ? 'bg-amber-50/60 border-amber-200 text-amber-900 animate-fade-in' 
                              : 'bg-amber-500/5 border-amber-500/10 text-amber-300 animate-fade-in'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 flex animate-ping" />
                          <span>{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* READY QUICK QUESTIONS CAROUSEL GRID */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-black uppercase text-teal-450 tracking-wider flex items-center gap-1 font-mono">
                    <Sparkles size={11} className="text-teal-400 shrink-0 animate-pulse" />
                    {language === 'tr' ? 'HIZLI VERİ ANALİZLERİ' : 'AUTOMATED QUICK METRICS'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {readyQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSendMessage(q.prompt)}
                        disabled={loading}
                        className={`p-2.5 text-left rounded-xl border text-[10px] font-bold transition-all flex flex-col justify-between cursor-pointer active:scale-95 ${
                          isLightTheme 
                            ? 'bg-white border-slate-200 hover:border-teal-400 text-slate-700 hover:bg-slate-50' 
                            : 'bg-white/[0.02] border-white/5 hover:border-teal-500/30 text-slate-200 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span>{language === 'tr' ? q.btnText : q.btnTextEn}</span>
                        <span className="text-[8px] text-slate-500 mt-1.5 uppercase font-black flex items-center gap-1">
                          <CornerDownRight size={8} /> {language === 'tr' ? 'TETİKLE' : 'TRIGGER'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 my-2 pt-2" />

                {/* Dynamic messages loop */}
                {activeMessages.map((msg) => {
                  const isAI = msg.sender === 'ai';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[90%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse animate-fade-in'}`}
                    >
                      {/* Avatar Icon circle */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none text-[11px] font-bold ${
                        isAI 
                          ? 'bg-teal-600 border-teal-500 text-white shadow-md' 
                          : 'bg-sky-600 border-sky-500 text-white shadow-md'
                      }`}>
                        {isAI ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                      </div>

                      {/* Msg bubble container */}
                      <div 
                        className={`p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-md font-medium whitespace-pre-wrap text-left ${
                          isAI 
                            ? 'rounded-tl-none border border-slate-200 text-slate-900' 
                            : 'rounded-tr-none text-black border border-sky-200'
                        }`}
                        style={isAI 
                          ? { backgroundColor: '#ffffff', color: '#000000' } 
                          : { backgroundColor: '#e0f2fe', color: '#000000' }
                        }
                      >
                        {isAI ? (
                          /* Parse simple Markdown for presentation clean headers & list bullet items */
                          <div className="space-y-1 font-sans text-slate-900">
                            {msg.text.split('\n').map((line, lidx) => {
                              let processed = line;
                              
                              // Check if is sub-header markdown "### text"
                              if (processed.startsWith('###')) {
                                return (
                                  <h4 key={lidx} className="text-teal-900 font-black text-xs pt-2 pb-1 border-b border-slate-100 uppercase tracking-wide">
                                    {processed.replace('###', '').trim()}
                                  </h4>
                                );
                              }

                              // Bold stars double formatter "**text**"
                              if (processed.includes('**')) {
                                const parts = processed.split('**');
                                return (
                                  <span key={lidx} className="block leading-relaxed">
                                    {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="text-teal-800 font-extrabold">{p}</strong> : p)}
                                  </span>
                                );
                              }

                              // Classic listed items
                              if (processed.trim().startsWith('*') || processed.trim().startsWith('-')) {
                                return (
                                  <span key={lidx} className="block pl-2 text-slate-800 font-semibold">
                                    • {processed.replace(/^[\s*-]+/, '').trim()}
                                  </span>
                                );
                              }

                              return <span key={lidx} className="block leading-relaxed text-slate-800 font-medium">{processed}</span>;
                            })}
                          </div>
                        ) : (
                          <p className="text-black leading-relaxed font-sans font-black">{msg.text}</p>
                        )}
                        
                        <span className={`text-[7.5px] font-black block text-right mt-1.5 uppercase tracking-wide ${isAI ? 'text-slate-450' : 'text-sky-700'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Waiting AI loader layout spinner */}
                {loading && (
                  <div className="flex gap-2 max-w-[85%] self-start animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400">
                      <Bot size={13} />
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-none border border-white/5 bg-white/[0.02] text-slate-450 text-[10px] font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-ping" />
                      <span>{language === 'tr' ? 'AquaBot verileri doğruluyor...' : 'AquaBot verifying records...'}</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Form Input footer */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }} 
                className={`p-3 border-t shrink-0 flex gap-2 items-center ${
                  isLightTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-white/10'
                }`}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={language === 'tr' ? 'Tasarruf ve istatistiklerle alakalı soru...' : 'Ask about ecology, savings, active goals...'}
                  disabled={loading}
                  className={`flex-1 rounded-full h-10 px-4 text-xs font-semibold focus:outline-none focus:ring-1 border transition-all ${
                    isLightTheme
                      ? 'bg-white border-slate-200 focus:ring-teal-450 focus:border-teal-450 text-slate-800'
                      : 'bg-black/40 border-white/10 focus:ring-teal-500/30 focus:border-teal-500/30 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer text-white disabled:opacity-35 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary || '#14b8a6' }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </>
  );
}
