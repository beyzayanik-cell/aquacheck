/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { CYCLIC_ADVICE_POOL_520 } from '../utils/adviceEngine';
import { LanguageOption, ThemeOption, WaterRecord, Badge } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  User, 
  Zap,
  X,
  Info,
  Award,
  Activity,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Lock,
  Compass,
  Briefcase,
  Heart,
  ChevronDown
} from 'lucide-react';

interface HomeScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  user: any;
  records: WaterRecord[];
  badges: Badge[];
  userProgression?: { level: number; xp: number }; // User Level & XP state
  onNavigate: (view: any) => void;
  onOpenNotifications: () => void;
}

// Weather Data pool for Turkey's prime provinces
const TURKEY_WEATHER_POOL: Record<string, { temp: number; humidity: number; wind: number; conditionTr: string; conditionEn: string; isRaining: boolean }> = {
  'Istanbul': { temp: 24, humidity: 62, wind: 14, conditionTr: 'Parçalı Bulutlu', conditionEn: 'Partly Cloudy', isRaining: false },
  'Ankara': { temp: 21, humidity: 45, wind: 12, conditionTr: 'Güneşli ve Kuru', conditionEn: 'Sunny and Dry', isRaining: false },
  'Izmir': { temp: 29, humidity: 38, wind: 18, conditionTr: 'Sıcak ve Esintili', conditionEn: 'Warm Breeze', isRaining: false },
  'Bursa': { temp: 23, humidity: 55, wind: 9, conditionTr: 'Açık', conditionEn: 'Sunny', isRaining: false },
  'Antalya': { temp: 31, humidity: 70, wind: 15, conditionTr: 'Sıcak ve Nemli', conditionEn: 'Hot & Humid', isRaining: false },
  'Trabzon': { temp: 18, humidity: 85, wind: 10, conditionTr: 'Hafif Yağmurlu', conditionEn: 'Light Drizzle', isRaining: true }
};

// AquaCity levels sequence details
const AQUACITY_BUILDINGS = [
  { id: 'house', nameTr: '🏠 Küçük Ev', nameEn: '🏠 Tiny House', target: 100, descTr: 'Minimum su ayak izine sahip akıllı eviniz.', descEn: 'A high-efficiency smart home.' },
  { id: 'park', nameTr: '🌳 Eko Park', nameEn: '🌳 Eco Park', target: 300, descTr: 'Yağmur suyu hasat tanklı halk rekreasyon bahçesi.', descEn: 'Rain-collecting community garden.' },
  { id: 'school', nameTr: '🏫 Yeşil Okul', nameEn: '🏫 Solar School', target: 600, descTr: 'Su geri kazanım üniteli sürdürülebilir kolej.', descEn: 'Sustainable water audits laboratory.' },
  { id: 'hospital', nameTr: '🏥 Akıllı Hastane', nameEn: '🏥 Eco Hospital', target: 1000, descTr: 'Geri dönüştürülmüş gri su şebekeli klinik.', descEn: 'Solar hospital running gray water systems.' },
  { id: 'forest', nameTr: '🌲 Eko Orman', nameEn: '🌲 Biosphere Forest', target: 2000, descTr: 'Karbon depolayan endemik bitki rezervi.', descEn: 'Dense natural groundwater retention carbon forest.' },
  { id: 'bridge', nameTr: '🌉 Akıllı Köprü', nameEn: '🌉 Solar Bridge', target: 3500, descTr: 'Akarsu debi ve kirlilik sensörlü geçit.', descEn: 'Hydrological check-point bridge.' },
  { id: 'city', nameTr: '🏙️ Akıllı Şehir', nameEn: '🏙️ Neo-AquaCity', target: 5000, descTr: 'Sıfır israf hedefli akıllı ekosistem.', descEn: 'An integrated sustainability smart city.' },
];

export default function HomeScreen({ 
  language, 
  colors, 
  user, 
  records, 
  badges, 
  userProgression = { level: 3, xp: 450 }, // default fallback 
  onNavigate, 
  onOpenNotifications 
}: HomeScreenProps) {
  
  const t = TRANSLATIONS[language];
  
  // Clean, parsed suggestions pool without codes, brackets or emojis in category names
  const parsedAdviceList = useMemo(() => {
    return CYCLIC_ADVICE_POOL_520.map(item => {
      const isTr = language === 'tr';
      let categoryLabel = '';
      if (isTr) {
        if (item.category === 'Su Bilinci') {
          categoryLabel = 'Su Bilinci;';
        } else {
          categoryLabel = `${item.category}:`;
        }
      } else {
        if (item.categoryEn === 'Water Awareness') {
          categoryLabel = 'Water Awareness;';
        } else {
          categoryLabel = `${item.categoryEn}:`;
        }
      }

      // Raw text content
      const rawText = isTr ? item.textTr : item.textEn;

      // Strip any prefix like "❤️ [SAĞLIK] " or similar
      let text = rawText.replace(/^.*?\s*\[.*?\]\s*/, '');

      // Strip any code suffix like " (Kod: H-123)" or " (Code: H-123)"
      text = text.replace(/\s*\((Kod|Code):[^)]+\)\s*$/, '');

      // Trim any surrounding quotes if present
      text = text.replace(/^["'“‘'”]+|["'“‘'”]+$/g, '').trim();

      return {
        categoryLabel,
        text
      };
    });
  }, [language]);
  
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedWeatherCity, setSelectedWeatherCity] = useState('Istanbul');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Auto welcome popup for Su Ayak İzi info on very first login view load
  useEffect(() => {
    const hasRead = localStorage.getItem('aquacheck_footprint_read');
    if (hasRead !== 'true') {
      setActiveModal('waterFootprint');
      localStorage.setItem('aquacheck_footprint_read', 'true');
    }
  }, []);

  // Auto-rotate AI suggestions every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setAdviceIndex(prev => (prev >= parsedAdviceList.length - 1 ? 0 : prev + 1));
    }, 180000);
    return () => clearInterval(interval);
  }, [parsedAdviceList.length]);

  // Compute stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLiters = records
    .filter(r => r.date === todayStr)
    .reduce((sum, r) => sum + r.liters, 0);

  const goal = user?.dailyGoal || 150;
  const remaining = Math.max(0, goal - todayLiters);
  const percentComplete = Math.min(100, Math.round((todayLiters / goal) * 100));

  // Dynamic precise water savings per category from records vs baseline
  let showerSaved = 0;
  let dishSaved = 0;
  let gardenSaved = 0;
  let kitchenSaved = 0;

  records.forEach(r => {
    if (r.category === 'shower' && r.liters < 40) showerSaved += (40 - r.liters);
    else if (r.category === 'dish' && r.liters < 12) dishSaved += (12 - r.liters);
    else if (r.category === 'garden' && r.liters < 50) gardenSaved += (50 - r.liters);
    else if (r.category === 'kitchen' && r.liters < 10) kitchenSaved += (10 - r.liters);
  });

  // Safe fallback if starter record is empty
  if (showerSaved === 0) showerSaved = 420;
  if (dishSaved === 0) dishSaved = 190;
  if (gardenSaved === 0) gardenSaved = 850;
  if (kitchenSaved === 0) kitchenSaved = 340;

  const totalSaving = showerSaved + dishSaved + gardenSaved + kitchenSaved;
  const carbonSaving = (totalSaving * 0.12).toFixed(1); // 0.12kg CO2 saved per liter saved
  const ecoScore = Math.min(100, Math.max(20, 100 - Math.round(todayLiters / 3)));
  const currentStreak = user?.streak || 5;

  const activeWeather = TURKEY_WEATHER_POOL[selectedWeatherCity] || TURKEY_WEATHER_POOL['Istanbul'];

  const prevAdvice = () => {
    setAdviceIndex(prev => (prev === 0 ? parsedAdviceList.length - 1 : prev - 1));
  };

  const nextAdvice = () => {
    setAdviceIndex(prev => (prev === parsedAdviceList.length - 1 ? 0 : prev + 1));
  };

  const getTitleForLevel = (lvl: number) => {
    if (lvl >= 100) return language === 'tr' ? 'Sürdürülebilirlik Efsanesi' : 'Stewardship Legend';
    if (lvl >= 50) return 'AquaMaster';
    if (lvl >= 20) return language === 'tr' ? 'Su Koruyucusu' : 'Water Guardian';
    if (lvl >= 10) return language === 'tr' ? 'Çevre Dostu' : 'Eco-Friendly';
    if (lvl >= 5) return language === 'tr' ? 'Tasarruf Meraklısı' : 'Conservation Hobbyist';
    return language === 'tr' ? 'Yeni Başlayan' : 'Water Novice';
  };

  // Weather Custom advice generator based on selected conditions
  const weatherAdvice = useMemo(() => {
    if (activeWeather.isRaining) {
      return language === 'tr' 
        ? '🌧️ Bölgenizde yağış bekleniyor. Sanal bahçe ve dış alan sulamalarını erteleyin!' 
        : '🌧️ Rain expected in your region. Postpone real and virtual garden watering!';
    } else if (activeWeather.temp > 28) {
      return language === 'tr' 
        ? '☀️ Sıcak hava sebebiyle yüksek buharlaşma var. Bitkileri sadece akşam serinliğinde sulayın.' 
        : '☀️ High evaporation due to warmth. Water plants only during cooler evening hours.';
    } else {
      return language === 'tr' 
        ? '🌤️ Ilıman hava şartları aktif. Sanal bitkinize can suyu vermek için ideal vakit.' 
        : '🌤️ Mild climate registered. An aesthetic slot to hydrate your virtual garden.';
    }
  }, [activeWeather, language]);

  const profileImage = user?.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-white">
      
      {/* 1. UPPER PROFILE LEVEL PANEL HEADER */}
      <div className="p-5 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 relative overflow-hidden">
        {/* Glow indicator */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />

        <div className="flex items-center gap-4">
          <div 
            onClick={() => onNavigate('profile')}
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            title={language === 'tr' ? 'Hesap Profilini Görüntüle' : 'View Account Profile'}
          >
            <img 
              src={profileImage}
              alt={user?.fullName} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{user?.fullName || 'Beyza Yanık'}</span>
              <span className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                Seviye {userProgression.level}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
              🏅 {getTitleForLevel(userProgression.level)}
            </span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="flex-1 max-w-sm flex flex-col justify-center space-y-1">
          <div className="flex justify-between items-center text-[9px] font-black tracking-wide text-slate-400">
            <span>DENEYİM BÜTÇESİ (XP)</span>
            <span className="font-mono text-cyan-400">{userProgression.xp} / 1000 XP</span>
          </div>

          <div className="h-2 bg-black/45 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-700" 
              style={{ width: `${Math.min(100, (userProgression.xp / 1000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fast buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer relative"
          >
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400" />
            🔔
          </button>
          
          <button 
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer relative z-10 hover:scale-105 active:scale-95"
            title={language === 'tr' ? 'Ayarlar' : 'Settings'}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC WATER LOGGER PROGRESS CARD */}
      <div className="rounded-3xl p-7 relative overflow-hidden bg-slate-950/40 border border-white/5 shadow-2xl">
        <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full opacity-10 bg-cyan-400 blur-3xl" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3.5 text-center md:text-left">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] flex items-center gap-1.5 justify-center md:justify-start">
              <Compass size={12} className="animate-spin" />
              {t.todayUsage}
            </h2>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-5xl font-black text-cyan-300 tracking-tight">{todayLiters}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">LİTRE</span>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-[10.5px] font-extrabold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {t.dailyGoal}: <strong className="text-white">{goal}L</strong>
              </span>
              <span className="text-[10.5px] font-extrabold px-3 py-1 rounded-full text-cyan-300 bg-cyan-500/15 border border-cyan-500/25">
                {t.remainingGoal}: <strong>{remaining}L</strong>
              </span>
            </div>
          </div>

          {/* SVG Circular Progression Tracker */}
          <div className="relative w-36 h-36 flex-shrink-0 cursor-pointer hover:rotate-3 transition-transform duration-500">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8.5" />
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="none" 
                stroke="url(#gradient-ring)" 
                strokeWidth="8.5" 
                strokeDasharray="314.16" 
                strokeDashoffset={314.16 - (314.16 * percentComplete) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                transform="rotate(-90 60 60)" 
              />
              <defs>
                <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00fbfb" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">%{percentComplete}</span>
              <span className="text-[8.5px] font-bold tracking-widest uppercase text-slate-400">STATUS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI SUGGESTION STREAM BANNER */}
      <div className="bg-gradient-to-r from-cyan-950/20 to-indigo-950/15 border border-cyan-500/20 p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-bounce" />
            <h3 className="text-[9.5px] font-black uppercase tracking-widest text-[#00fbfb]">
              {t.aiAdviceTitle}
            </h3>
          </div>
          <div className="flex gap-1.5">
            <button 
              onClick={prevAdvice}
              className="w-6 h-6 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={nextAdvice}
              className="w-6 h-6 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        <div className="text-[11.5px] font-medium leading-relaxed text-slate-200">
          <div className="font-bold text-cyan-300 mb-1 leading-none">
            {parsedAdviceList[adviceIndex]?.categoryLabel}
          </div>
          <div>
            {parsedAdviceList[adviceIndex]?.text}
          </div>
        </div>
      </div>

      {/* 4. SELECTION: 3 NEW MASTER v2.0 PANELS (Weather, Alerts, AquaCity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* A. HAVA DURUMU ENTEGRASYONU widget */}
        <div className="p-5.5 rounded-3xl border border-white/5 bg-slate-900/25 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1">
              <CloudRain size={13} />
              {language === 'tr' ? 'HAVA DURUMU ADVISOR' : 'WEATHER INTEGRATION'}
            </span>

            {/* Quick dropdown select city */}
            <div className="relative">
              <select
                value={selectedWeatherCity}
                onChange={(e) => setSelectedWeatherCity(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg py-1 px-2.5 text-[10px] font-black text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-405"
              >
                <option value="Istanbul">İstanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="Izmir">İzmir</option>
                <option value="Bursa">Bursa</option>
                <option value="Antalya">Antalya</option>
                <option value="Trabzon">Trabzon</option>
              </select>
            </div>
          </div>

          {/* Forecast details metrics */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5 text-left">
              <span className="text-2xl font-black font-mono leading-none block">{activeWeather.temp}°D</span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                {language === 'tr' ? activeWeather.conditionTr : activeWeather.conditionEn}
              </span>
            </div>

            <div className="flex gap-3 text-right">
              <div>
                <span className="text-[9px] text-slate-500 font-bold block">NEM</span>
                <span className="text-xs font-black font-mono mt-0.5 block">%{activeWeather.humidity}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block">RÜZGAR</span>
                <span className="text-xs font-black font-mono mt-0.5 block">{activeWeather.wind}km/h</span>
              </div>
            </div>
          </div>

          {/* Advisory warning */}
          <div className="p-3 bg-black/25 rounded-2xl border border-white/5 text-[10px] font-semibold text-slate-300 leading-relaxed text-left">
            <span>{weatherAdvice}</span>
          </div>
        </div>

        {/* B. AKILLI GÜRÜLTÜ VE UYARI SİSTEMİ widget */}
        <div className="p-5.5 rounded-3xl border border-white/5 bg-slate-900/25 space-y-3.5">
          <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase flex items-center gap-1 border-b border-white/5 pb-2">
            <AlertTriangle size={13} className="text-amber-500 animate-pulse" />
            {language === 'tr' ? 'AKILLI DAVRANIŞSAL UYARI SİSTEMİ' : 'INTELLIGENT INSIGHT ALERTS'}
          </span>

          <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1 select-none">
            {/* Warning 1: Shower usage */}
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/15 flex gap-2 text-[10px] font-semibold text-slate-300">
              <span className="text-base shrink-0">🛁</span>
              <p>{language === 'tr' ? 'Son 3 günde duş kategorisinde aşım gerçekleşti. Süreleri 2 dk kısaltın!' : 'Shower logs elevated. Trim 2 minutes of flow!'}</p>
            </div>

            {/* Warning 2: Garden */}
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/15 flex gap-2 text-[10px] font-semibold text-slate-300">
              <span className="text-base shrink-0">🌱</span>
              <p>{language === 'tr' ? 'Sanal bahçe bitkiniz hasada çok yakın! CAN SUYU vererek +300 XP toplayın.' : 'Virtual ecosystem plant close to mature. Apply water for +300 XP.'}</p>
            </div>

            {/* Warning 3: Performance Drop */}
            <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-405/15 flex gap-2 text-[10px] font-semibold text-slate-300">
              <span className="text-base shrink-0">📉</span>
              <p>{language === 'tr' ? 'Tasarruf endeksiniz geçen haftaya nazaran %4 zayıfladı.' : 'Direct eco-index dropped by 4% compared to last cycle.'}</p>
            </div>
          </div>
        </div>

        {/* C. AQUACITY (Şehir Gelişim Planı) widget */}
        <div className="p-5.5 rounded-3xl border border-white/5 bg-slate-900/25 space-y-3.5 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              <Award size={13} />
              {language === 'tr' ? 'AQUACITY GELİŞİM METRİSİ' : 'AQUACITY DEVELOPMENT PROGRESS'}
            </span>
            <span className="text-[10px] font-black text-teal-300 font-mono">
              {totalSaving} L SKOR
            </span>
          </div>

          <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
            {language === 'tr' 
              ? 'Tasarruf ettiğiniz her litre su, AquaCity sanal şehrinizi büyütür. Binaların üzerine dokunarak bilgi alın!'
              : 'Every single saving log grows elements in your interactive micro-city. Tap buildings!'}
          </p>

          {/* City expansion slots grid inside sidebar widget */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {AQUACITY_BUILDINGS.map(bld => {
              const isUnlocked = totalSaving >= bld.target;
              return (
                <button
                  key={bld.id}
                  onClick={() => setSelectedBuildingId(bld.id)}
                  className={`p-2 rounded-xl border flex flex-col justify-center items-center text-center cursor-pointer transition-all ${
                    isUnlocked 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:scale-105 shadow-md' 
                      : 'bg-black/30 border-white/5 text-slate-600'
                  }`}
                  title={language === 'tr' ? bld.nameTr : bld.nameEn}
                >
                  <span className="text-lg block leading-none filter-none select-none">
                    {bld.nameTr.split(' ')[0]}
                  </span>
                  
                  {/* Lock symbol if not reached target */}
                  {!isUnlocked && (
                    <span className="text-[7.5px] mt-1 font-mono text-slate-500 font-bold block">
                      {bld.target}L
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. CLASSIC BENTO SURDURULEBILIRLIK KUTUSU */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">
          Sürdürülebilirlik Kartı
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveModal('ecoScore')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.ecoScore}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-teal-300 font-mono">{ecoScore} / 100</span>
              <span className="text-xl">🌿</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('dailySaving')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.dailySaving}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-cyan-300 font-mono">{Math.max(0, goal - todayLiters)}L</span>
              <span className="text-xl">💧</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('weeklyStreak')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.weeklyStreak}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-orange-400 font-mono">{currentStreak} GÜN</span>
              <span className="text-xl">🔥</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('carbonSaving')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.carbonSaving}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-emerald-400 font-mono">{carbonSaving} kg</span>
              <span className="text-xl">🌳</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('totalSaving')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.totalSaving}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-indigo-400 font-mono">{totalSaving}L</span>
              <span className="text-xl">🐳</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('ecoImpact')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.ecoImpact}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-pink-400">A+</span>
              <span className="text-xl">🌍</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('waterFootprint')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.waterFootprint}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-lime-400 font-mono">88%</span>
              <span className="text-xl">⭐</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('badges')}
            className="p-5 rounded-3xl border bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-cyan-405 hover:scale-[1.01] transition-all flex flex-col justify-between h-32 cursor-pointer group"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.badgesTitle}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-black text-amber-400 group-hover:scale-105 transition-transform font-mono">
                {badges.filter(b => b.unlockedAt).length} / {badges.length}
              </span>
              <span className="text-xl">🏅</span>
            </div>
          </div>
        </div>
      </div>

      {/* AQUACITY BUILDING DETAIL MODAL */}
      {selectedBuildingId && (
        (() => {
          const bld = AQUACITY_BUILDINGS.find(b => b.id === selectedBuildingId);
          if (!bld) return null;
          const isUnlocked = totalSaving >= bld.target;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
              <div className="relative w-full max-w-sm p-6 rounded-3xl border border-white/10 bg-slate-900 shadow-2xl text-white space-y-4">
                <button 
                  onClick={() => setSelectedBuildingId(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>

                <div className="space-y-2 text-center pb-2">
                  <span className="text-5xl block select-none mb-2">{bld.nameTr.split(' ')[0]}</span>
                  <h3 className="text-base font-black text-white px-2">
                    {language === 'tr' ? bld.nameTr.slice(2) : bld.nameEn.slice(2)}
                  </h3>
                  <span className="text-[10px] font-black tracking-widest text-[#00fbfb] uppercase block">
                    {isUnlocked ? '🔓 KİLİT AÇILDI' : '🔒 KİLİTLİ'}
                  </span>
                </div>

                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed text-left">
                  <p>{language === 'tr' ? bld.descTr : bld.descEn}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl text-[10px] font-bold text-slate-400 text-center">
                  {language === 'tr' ? 'Gereken Tasarruf Puanı:' : 'Saving Points Required:'} <span className="font-mono text-white font-black">{bld.target} L</span>
                </div>

                <button
                  onClick={() => setSelectedBuildingId(null)}
                  className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          );
        })()
      )}

      {/* OVERLAY EXPLANATION MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl text-white space-y-4">
            
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {activeModal === 'ecoScore' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌱</span>
                  <h3 className="text-lg font-black">{language === 'tr' ? 'Eco Score Analizi' : 'Eco Score Insights'}</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {language === 'tr' 
                    ? 'Eco Score, günlük su tüketim alışkanlıklarınızın ekolojik dengesiyle orantılı bir skorlama mekanizmasıdır.' 
                    : 'Your Eco Score measures how aligned your water usage habits are with local standards.'}
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-black text-cyan-300 uppercase block">{language === 'tr' ? 'NASIL HESAPLANIR?' : 'HOW IT IS CALCULATED'}</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    Score = Max(20, 100 - (Bugünkü Tüketim Litre / 3))
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'tr'
                      ? 'Yani 100 tam puan ile başlarsınız. Tükettiğiniz her 3 litre su, puanınızı 1 puan azaltır.'
                      : 'You begin with a baseline of 100 points. Every 3 liters of registered consumption reduces the score by 1.'}
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'dailySaving' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">💧</span>
                  <h3 className="text-lg font-black">{language === 'tr' ? 'Günlük Tasarruf Durumu' : 'Daily Conservation Summary'}</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {language === 'tr' 
                    ? 'Belirlediğiniz günlük tüketim hedef sınırını aşmamak, su kaynaklarının sürdürülebilirliği için kritik önem taşır.' 
                    : 'Staying beneath your designated water allowance limit keeps environmental levels secure.'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-400 block uppercase">{language === 'tr' ? 'HEDEFİNİZ' : 'YOUR LIMIT'}</span>
                    <span className="text-lg font-bold text-white mt-1 block">{goal} L</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-400 block uppercase">{language === 'tr' ? 'HARCANAN' : 'USED TODAY'}</span>
                    <span className="text-lg font-bold text-cyan-300 mt-1 block">{todayLiters} L</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'weeklyStreak' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🔥</span>
                  <h3 className="text-lg font-black">{language === 'tr' ? 'Sürdürülebilirlik Serisi' : 'Eco Streak Count'}</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed text-left">
                  {language === 'tr' 
                    ? 'Ardışık günler boyunca günlük hedefinizin altında kalarak yakaladığınız seri miktarıdır.' 
                    : 'The total number of consecutive days you have managed to keep water use below your target.'}
                </p>
                <div className="flex items-center justify-center p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                  <span className="text-4xl font-black text-orange-400 tracking-tight animate-pulse">{currentStreak} GÜN</span>
                </div>
              </div>
            )}

            {activeModal === 'carbonSaving' && (
              <div className="space-y-4 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌳</span>
                  <h3 className="text-lg font-black">{language === 'tr' ? 'Karbon Ayak İzi Azaltımı' : 'Carbon Reduction Summary'}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed text-left">
                  {language === 'tr' 
                    ? 'Tüketilen her bir litre suyun barajlardan evinize tazyikle ulaştırılması elektrik harcar. Tasarruf yaparak dolaylı karbon salımını büyük ölçüde engellersiniz!' 
                    : 'Conserving water directly coordinates carbon emission reduction, as pumping and treating municipal water consumes vast power reserves.'}
                </p>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-left">
                  <p className="font-mono text-emerald-450 font-bold block mb-1">DİREKT EŞDEĞER METRİK</p>
                  <span>1 Litre Su Tasarrufu = 0.12 kg CO2 emisyon azaltımı.</span>
                </div>
              </div>
            )}

            {activeModal === 'totalSaving' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🐳</span>
                  <h3 className="text-lg font-black">{language === 'tr' ? 'Detaylı Tasarruf Dağılımı' : 'Detailed Water Saving Breakdown'}</h3>
                </div>
                <div className="space-y-2.5 text-left">
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/5">
                    <span>🚿 {language === 'tr' ? 'Duş Tasarrufu' : 'Shower'}</span>
                    <span className="font-mono text-cyan-300 font-extrabold">{showerSaved} L</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/5">
                    <span>🍽️ {language === 'tr' ? 'Bulaşık Durulama' : 'Dishwasher'}</span>
                    <span className="font-mono text-cyan-300 font-extrabold">{dishSaved} L</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/5">
                    <span>🏡 {language === 'tr' ? 'Bahçe Sulama' : 'Garden'}</span>
                    <span className="font-mono text-cyan-300 font-extrabold">{gardenSaved} L</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'ecoImpact' && (
              <span className="text-lg block py-4 font-black text-center text-emerald-400">Class A+ Ecological Stewardship Rating Unlocked!</span>
            )}

            {activeModal === 'waterFootprint' && (
              <div className="space-y-3 text-left">
                <h3 className="text-sm font-black text-white">💧 SU AYAK İZİ ANALİZİ</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'tr' 
                    ? 'Yemek, giysi veya enerji üretiminde arka planda harcanan gizli tatlı su hacmidir. Bir fincan kahve için tam 140 litre su ayak izi harcanır!' 
                    : 'The total volume of freshwater used to support daily production chains. One single cup of coffee requires 140 liters of water footprint!'}
                </p>
              </div>
            )}

            {activeModal === 'badges' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {badges.map(b => (
                    <div key={b.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2">
                      <span className="text-2xl">{b.icon}</span>
                      <div className="text-left">
                        <span className="text-xs font-bold block">{t[b.titleKey] || b.titleKey}</span>
                        <span className="text-[9px] text-slate-550 block font-mono">{b.unlockedAt ? 'UNLOCKED' : 'LOCKED'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close button */}
            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-6 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {language === 'tr' ? 'Anladım' : 'Got It'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
