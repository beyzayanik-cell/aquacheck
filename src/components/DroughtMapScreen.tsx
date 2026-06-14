import React, { useState, useMemo, useEffect } from 'react';
import { TURKEY_PROVINCES_DAMS, DamDetail } from '../constants/provincesDams';
import { 
  Map, 
  MapPin, 
  Search, 
  Droplets, 
  Sparkles, 
  TrendingUp, 
  CloudRain, 
  Info,
  CornerDownRight,
  ArrowRight,
  Sun,
  Thermometer,
  Wind,
  Compass,
  Sprout,
  AlertTriangle,
  Check,
  Edit2
} from 'lucide-react';
import { 
  PLATE_TO_REGION_MAP, 
  REGS_LIST, 
  generateWeatherForCity, 
  WeatherDetail 
} from '../utils/weatherHelper';

interface DroughtMapScreenProps {
  language: 'tr' | 'en' | any;
  theme: string;
  colors: any;
  onNavigate?: (view: any) => void;
}

export default function DroughtMapScreen({ language, colors, onNavigate }: DroughtMapScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegion, setActiveRegion] = useState('all');
  const [selectedProvinceId, setSelectedProvinceId] = useState('34'); // Default to Istanbul
  const [activeTab, setActiveTab] = useState<'weather' | 'drought'>('weather');
  
  // Custom user-editable drought levels dictionary, load from localStorage
  const [customDroughts, setCustomDroughts] = useState<Record<string, 'safe' | 'risky' | 'watch' | 'critical'>>(() => {
    const saved = localStorage.getItem('aquacheck_custom_droughts_v4');
    return saved ? JSON.parse(saved) : {};
  });

  // Current active species name and icon grown by the user, load from localStorage or fallback
  const [activePlantInfo, setActivePlantInfo] = useState<{ id: string; name: string; icon: string }>({
    id: 'elma',
    name: 'Elma Ağacı',
    icon: '🍎'
  });

  useEffect(() => {
    // Read the user progress plant choice if synced
    const savedGrowthDict = localStorage.getItem('aquacheck_plant_growths_v3');
    const savedActivePlantId = localStorage.getItem('aquacheck_selected_plant_id');
    
    // Quick map mapping IDs to human Turkey names & icons
    const plantNamesMap: Record<string, { name: string; icon: string }> = {
      'gul': { name: 'Gül', icon: '🌹' },
      'papatya': { name: 'Papatya', icon: '🌼' },
      'aycicegi': { name: 'Ayçiçeği', icon: '🌻' },
      'lale': { name: 'Lale', icon: '🌷' },
      'orkide': { name: 'Orkide', icon: '🌸' },
      'lavanta': { name: 'Lavanta', icon: '🌿' },
      'elma': { name: 'Elma Ağacı', icon: '🍎' },
      'cam': { name: 'Çam Ağacı', icon: '🌲' },
      'zeytin': { name: 'Zeytin Ağacı', icon: '🫒' },
      'adacayi': { name: 'Adaçayı', icon: '🌿' }
    };

    if (savedActivePlantId && plantNamesMap[savedActivePlantId]) {
      setActivePlantInfo({
        id: savedActivePlantId,
        ...plantNamesMap[savedActivePlantId]
      });
    }
  }, []);

  // Update active city selection inside localStorage to share with AquaBot
  useEffect(() => {
    localStorage.setItem('aquacheck_active_weather_city_id', selectedProvinceId);
    const matched = TURKEY_PROVINCES_DAMS.find(p => p.id === selectedProvinceId);
    if (matched) {
      localStorage.setItem('aquacheck_active_weather_city_name', matched.cityName);
    }
  }, [selectedProvinceId]);

  const handleUpdateDroughtRisk = (riskLevel: 'safe' | 'risky' | 'watch' | 'critical') => {
    const updated = {
      ...customDroughts,
      [selectedProvinceId]: riskLevel
    };
    setCustomDroughts(updated);
    localStorage.setItem('aquacheck_custom_droughts_v4', JSON.stringify(updated));
  };

  // Compile full 81 provinces data list with live weather computations
  const normalizedProvinces = useMemo(() => {
    return TURKEY_PROVINCES_DAMS.map(prov => {
      const region = PLATE_TO_REGION_MAP[prov.id] || 'Marmara';
      const customLevel = customDroughts[prov.id];
      const weather = generateWeatherForCity(prov.id, prov.fullness, customLevel);

      return {
        ...prov,
        region,
        weather,
        plateCode: prov.id
      };
    }).sort((a, b) => parseInt(a.plateCode) - parseInt(b.plateCode));
  }, [customDroughts]);

  // Read currently selected province details
  const activeProv = useMemo(() => {
    return normalizedProvinces.find(p => p.plateCode === selectedProvinceId) || normalizedProvinces[33]; // Fallback to Istanbul
  }, [normalizedProvinces, selectedProvinceId]);

  // Aggregate stats per regions
  const regionalAverages = useMemo(() => {
    const stats: Record<string, { sum: number; count: number; criticals: number }> = {};
    normalizedProvinces.forEach(p => {
      if (!stats[p.region]) {
        stats[p.region] = { sum: 0, count: 0, criticals: 0 };
      }
      stats[p.region].sum += p.fullness;
      stats[p.region].count += 1;
      if (p.weather.dLevel === 'critical' || p.weather.dLevel === 'watch') {
        stats[p.region].criticals += 1;
      }
    });

    return Object.keys(stats).map(key => ({
      region: key,
      avgFullness: Math.round(stats[key].sum / stats[key].count),
      criticalCount: stats[key].criticals
    }));
  }, [normalizedProvinces]);

  // Dynamic search list filtering
  const filteredProvinces = useMemo(() => {
    return normalizedProvinces.filter(p => {
      const matchSearch = p.cityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.cityNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.plateCode.includes(searchTerm);
      const matchRegion = activeRegion === 'all' || p.region === activeRegion;
      return matchSearch && matchRegion;
    });
  }, [normalizedProvinces, searchTerm, activeRegion]);

  // Smart Weather-linked Water Conservation Advisor rules list
  const waterSavingSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    const w = activeProv.weather;
    
    if (w.temp >= 35) {
      suggestions.push(
        language === 'tr' 
          ? '⚠️ Sıcaklık 35°C üzerindedir. Bugün bahçe sulamasını saat 19:00 sonrasında (buharlaşmanın minimize olduğu vakit) yapmanız şiddetle önerilir.' 
          : '⚠️ Temperature is above 35°C. Watering gardens strictly after 19:00 is heavily recommended to curb intense evaporation.'
      );
    }
    if (w.humidity < 35) {
      suggestions.push(
        language === 'tr' 
          ? '💧 Havada nem miktarı çok düşüktür. Toprağın hızlı kurumasını önlemek için bitki sulama sıklığını artırmanız önerilir.' 
          : '💧 Air humidity registering very low levels. High dryness expected; elevate soil hydration frequency!'
      );
    }
    if (w.rainProb >= 50) {
      suggestions.push(
        language === 'tr' 
          ? '🌧️ Bölgenizde yüksek yağış ihtimali (%50+) bulunmaktadır. Bugün bahçe sulamanıza gerek olmayabilir, doğa sulamayı üstlenecektir.' 
          : '🌧️ Higher probability of natural rainfall registered. Irrigation may not be required today; save municipal water.'
      );
    } else {
      suggestions.push(
        language === 'tr'
          ? '☀️ Hava açık/bulutsuz. Bahçenizdeki nem dengesini korumak için sabah erken saatlerde hafif sulama rutinine sadık kalın.'
          : '☀️ Dry sunny skies registered. Maintain conservative early-morning watering routines to guard capillary soil moisture.'
      );
    }
    if (w.dLevel === 'critical' || w.dLevel === 'watch') {
      suggestions.push(
        language === 'tr' 
          ? '🚨 Kuraklık riski bu şehirde kritik düzeydedir! Evsel tüketim limitini %30 düşürün ve gereksiz araç/balkon yıkamalarını tamamen askıya alın.' 
          : '🚨 Severe drought risk registered! Please drop residential consumption rates by 30% immediately.'
      );
    }
    return suggestions;
  }, [activeProv, language]);

  // Smart Plant Integration advice messages linked with meteorology 100%
  const plantCareSuggestion = useMemo(() => {
    const w = activeProv.weather;
    const name = activePlantInfo.name;
    const icon = activePlantInfo.icon;

    if (w.temp >= 32) {
      return language === 'tr'
        ? `🔥 Hava çok sıcak (${w.temp}°C) seyretmektedir. Aktif büyüttüğünüz ${icon} ${name} bitkiniz bugün ekstra can suyuna ihtiyaç duyacaktır.`
        : `🔥 The air temperature is very high (${w.temp}°C). Your active species ${icon} ${name} will likely demand emergency irrigation.`;
    } else if (w.rainProb >= 50) {
      return language === 'tr'
        ? `🌧️ Bugün gökyüzü yağmurlu. ${icon} ${name} bitkiniz doğal olarak yağmur suyu alabilir; manuel can suyu vermeyi erteleyebilirsiniz.`
        : `🌧️ High precipitation registered today. Your plant species ${icon} ${name} receives direct natural rain; reserve your water taps.`;
    } else if (w.temp <= 5) {
      return language === 'tr'
        ? `❄️ Don riski (${w.temp}°C) bulunmaktadır! ${icon} ${name} bitkinizi dış alandaysa soğuk akımlardan korumaya almanız önerilir.`
        : `❄️ High frost danger detected (${w.temp}°C). Guard your active garden plant ${icon} ${name} from cold drafts immediately!`;
    } else {
      return language === 'tr'
        ? `🌤️ Ilıman hava şartları aktif. ${icon} ${name} bitkinize her zamanki periyotlarla can suyu vererek yeşertmeye devam edin!`
        : `🌤️ Mild spring weather conditions. Keep hydrating your active micro-system ${icon} ${name} at usual frequencies!`;
    }
  }, [activeProv, activePlantInfo, language]);

  return (
    <div className="space-y-6 text-white animate-fade-in pb-12">
      
      {/* Upper Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-cyan-300 uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Map size={11} />
            {language === 'tr' ? 'AQUACHECK METEOROLOJİ VE KURAKLIK KONTROL MERKEZİ' : 'WEATHER & HYDROMETRIC HUB'}
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight flex items-center gap-2">
            🌦️ {language === 'tr' ? 'YENİ NESİL 81 İL HAVA DURUMU SİSTEMİ' : '81 PROV WEATHER MATRIX'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-semibold leading-relaxed">
            {language === 'tr' 
              ? 'Türkiyeʼnin 81 iline ait canlı meteorolojik parametreler, baraj doluluk oranları, akıllı su tasarrufu algoritmaları, interaktif harita ve esnek kuraklık seviye yönetim paneli.'
              : 'Interactive microclimatic forecasts, real reservoir volumes, smart local advice widgets, and customizable danger indexes for Turkey.'}
          </p>
        </div>

        {/* View toggles tabs */}
        <div className="flex items-center bg-slate-900/50 p-1 border border-white/5 rounded-xl self-start shrink-0">
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'weather' 
                ? 'bg-cyan-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌦️ {language === 'tr' ? 'Hava Durumu' : 'Weather'}
          </button>
          <button
            onClick={() => setActiveTab('drought')}
            className={`px-4.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'drought' 
                ? 'bg-teal-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🗺️ {language === 'tr' ? 'Kuraklık & Harita' : 'Drought Map'}
          </button>
        </div>
      </div>

      {/* Region selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {REGS_LIST.map(reg => (
          <button
            key={reg.id}
            onClick={() => setActiveRegion(reg.id)}
            className={`px-4 text-center py-2 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border cursor-pointer transition-all ${
              activeRegion === reg.id 
                ? 'bg-cyan-500 border-cyan-405 text-white shadow-lg shadow-cyan-500/15'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {language === 'tr' ? reg.tr : reg.en}
          </button>
        ))}
      </div>

      {/* Main Grid content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Turkey Interactive Geo Map and Search Listing stacked as a beautiful wide dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-4 items-stretch">
          
          {/* Section: Turkey Interactive Map */}
          <div className="p-5.5 rounded-3xl border border-white/5 bg-slate-955/50 backdrop-blur-md relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-cyan-300 block tracking-wider uppercase flex items-center gap-1.5">
                🗺️ {language === 'tr' ? 'İNTERAKTİF BÖLGESEL COĞRAFİ HARİTA' : 'INTERACTIVE GEOGRAPHIC REGIONS'}
              </span>
              <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 scale-95 uppercase">
                <Info size={11} />
                {language === 'tr' ? 'Bölge seçerek şehirleri filtreleyin' : 'Select region to filter province arrays'}
              </span>
            </div>

            {/* Turkey regional SVG */}
            <div className="flex items-center justify-center p-2 bg-black/10 rounded-2xl border border-white/5 relative overflow-hidden">
              <svg viewBox="0 0 800 320" className="w-full max-w-2xl h-auto select-none overflow-visible">
                {/* 1. Marmara */}
                <path 
                  d="M20,60 L180,50 L190,110 L150,150 L80,140 L30,100 Z" 
                  onClick={() => setActiveRegion('Marmara')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'Marmara' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />
                
                {/* 2. Ege */}
                <path 
                  d="M20,110 L110,150 L120,240 L40,280 L20,180 Z" 
                  onClick={() => setActiveRegion('Ege')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'Ege' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />

                {/* 3. İç Anadolu */}
                <path 
                  d="M185,115 L380,110 L440,210 L300,240 L195,200 Z" 
                  onClick={() => setActiveRegion('İç Anadolu')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'İç Anadolu' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />

                {/* 4. Karadeniz */}
                <path 
                  d="M190,55 L580,55 L590,135 L400,120 L200,110 Z" 
                  onClick={() => setActiveRegion('Karadeniz')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'Karadeniz' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />

                {/* 5. Akdeniz */}
                <path 
                  d="M125,245 L320,245 L410,290 L260,295 L140,285 Z" 
                  onClick={() => setActiveRegion('Akdeniz')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'Akdeniz' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />

                {/* 6. Doğu Anadolu */}
                <path 
                  d="M445,135 L585,140 L700,110 L750,220 L580,240 Z" 
                  onClick={() => setActiveRegion('Doğu Anadolu')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'Doğu Anadolu' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />

                {/* 7. Güneydoğu */}
                <path 
                  d="M445,215 L575,245 L690,225 L650,285 L440,280 Z" 
                  onClick={() => setActiveRegion('Güneydoğu Anadolu')}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeRegion === 'Güneydoğu Anadolu' ? 'fill-cyan-500/50 stroke-cyan-400 stroke-2' : 'fill-slate-800/25 hover:fill-slate-800/65 stroke-white/10'
                  }`}
                />

                {/* Text Labels inside SVG */}
                <text x="80" y="90" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Marmara</text>
                <text x="50" y="190" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Ege</text>
                <text x="210" y="275" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Akdeniz</text>
                <text x="250" y="170" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Iç Anadolu</text>
                <text x="350" y="85" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Karadeniz</text>
                <text x="570" y="180" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Doğu An.</text>
                <text x="500" y="255" className="fill-white/80 font-sans text-[10px] font-black uppercase pointer-events-none">Güneydoğu</text>
              </svg>

              {/* Floating micro selected information overlay */}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-left space-y-0.5 pointer-events-none">
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{language === 'tr' ? 'HARİTA SEÇİLİ' : 'MAP CURRENT'}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black">{language === 'tr' ? activeProv.cityName : activeProv.cityNameEn}</span>
                  <span className="text-[10px] font-bold font-mono text-cyan-400">%{activeProv.fullness} L</span>
                </div>
              </div>
            </div>

            {/* Map Legends */}
            <div className="flex flex-wrap gap-4 items-center justify-center pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[8.5px] font-black tracking-wide text-slate-400">
                <span className="w-2 rounded-full bg-emerald-500 h-2 block shrink-0" />
                <span>🟢 {language === 'tr' ? 'DÜŞÜK RİSK' : 'LOW RISK'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8.5px] font-black tracking-wide text-slate-400">
                <span className="w-2 rounded-full bg-yellow-550 h-2 block shrink-0" />
                <span>🟡 ORTA RİSK</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8.5px] font-black tracking-wide text-slate-400">
                <span className="w-2 rounded-full bg-orange-500 h-2 block shrink-0" />
                <span>🟠 YÜKSEK RİSK</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8.5px] font-black tracking-wide text-slate-400">
                <span className="w-2 rounded-full bg-red-600 h-2 block shrink-0 animate-pulse" />
                <span>🔴 KRİTİK RİSK</span>
              </div>
            </div>
          </div>

          {/* Interactive grid container with scrolling selection */}
          <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/10 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black tracking-widest text-teal-450 uppercase block">
                  🏷️ {language === 'tr' ? 'TÜRKİYE 81 İL SEÇİM MATRİSİ' : 'TURKEY PROVINCES SEARCH TABLE'}
                </span>
                <span className="text-[9.5px] font-semibold text-slate-500 block leading-none">
                  {language === 'tr' ? 'Şehirler plaka koduna göre sıralanmıştır.' : 'Provinces ordered by plate/id number.'}
                </span>
              </div>
              
              {/* Searching Bar */}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'tr' ? 'İl adı veya Plaka no yazın...' : 'Search province...'}
                  className="w-full h-9 rounded-full bg-black/25 focus:bg-black/40 border border-white/10 focus:border-cyan-405 focus:outline-none pl-10 pr-4 text-xs font-semibold text-white tracking-wide transition-all"
                />
              </div>
            </div>

            {/* 81 Capsules Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-[260px] overflow-y-auto pr-1.5 scrollbar-thin">
              {filteredProvinces.map(prov => {
                const isActive = selectedProvinceId === prov.plateCode;
                const weatherState = prov.weather;
                let statusColor = 'border-slate-500/15 bg-slate-500/5 text-slate-400 hover:border-slate-350/20';
                
                if (weatherState.dLevel === 'critical') statusColor = 'border-red-500/25 bg-red-400/5 text-red-400 hover:border-red-500/40';
                else if (weatherState.dLevel === 'watch') statusColor = 'border-orange-500/25 bg-orange-400/5 text-orange-400 hover:border-orange-500/40';
                else if (weatherState.dLevel === 'risky') statusColor = 'border-yellow-500/25 bg-yellow-400/5 text-yellow-400 hover:border-yellow-500/40';
                else statusColor = 'border-emerald-500/25 bg-emerald-400/5 text-emerald-300 hover:border-emerald-500/40';

                return (
                  <button
                    key={prov.plateCode}
                    onClick={() => setSelectedProvinceId(prov.plateCode)}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-1 transition-all cursor-pointer ${statusColor} ${
                      isActive ? 'ring-2 ring-cyan-400 border-transparent shadow-md scale-95' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate text-left">
                      <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-black/35 text-slate-300 block font-mono shrink-0">
                        {prov.plateCode}
                      </span>
                      <span className="text-[11px] font-extrabold truncate block">
                        {language === 'tr' ? prov.cityName : prov.cityNameEn}
                      </span>
                    </div>
                    
                    <span className="text-[11px] block shrink-0">
                      {weatherState.forecast[0].icon}
                    </span>
                  </button>
                );
              })}

              {filteredProvinces.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-semibold text-xs border border-dashed border-white/5 rounded-2xl">
                  {language === 'tr' ? 'Aradığınız kriterde şehir bulunamadı.' : 'No matching provinces found.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tabular Meteorological & Drought risk metrics view */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active selected city panel drawer dashboard */}
          <div className="p-5.5 rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-md relative overflow-hidden space-y-5.5 shadow-xl">
            
            {/* Upper Province description card */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] font-mono font-black text-white px-1.5 py-0.5 bg-black/45 rounded-md">
                    {activeProv.plateCode}
                  </span>
                  <span className="text-[9px] font-black text-cyan-305 font-mono uppercase tracking-widest leading-none">
                    {activeProv.region} REGİON
                  </span>
                </div>
                <h3 className="text-xl font-black mt-2 leading-tight">
                  {language === 'tr' ? activeProv.cityName : activeProv.cityNameEn}
                </h3>
              </div>

              {/* Drought risk badges */}
              <div className="shrink-0 text-right">
                {activeProv.weather.dLevel === 'critical' ? (
                  <span className="px-2.5 py-1 text-[8.5px] font-black bg-red-650/15 text-red-500 border border-red-500/25 rounded-full animate-pulse tracking-wider block">
                    🔴 KATALOG: KRİTİK RİSK
                  </span>
                ) : activeProv.weather.dLevel === 'watch' ? (
                  <span className="px-2.5 py-1 text-[8.5px] font-black bg-orange-650/15 text-orange-400 border border-orange-400/25 rounded-full tracking-wider block">
                    🟠 KATALOG: YÜKSEK RİSK
                  </span>
                ) : activeProv.weather.dLevel === 'risky' ? (
                  <span className="px-2.5 py-1 text-[8.5px] font-black bg-yellow-650/15 text-yellow-450 border border-yellow-500/25 rounded-full tracking-wider block">
                    🟡 KATALOG: ORTA RİSK
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[8.5px] font-black bg-emerald-655/15 text-emerald-400 border border-emerald-500/25 rounded-full tracking-wider block">
                    🟢 KATALOG: DÜŞÜK RİSK
                  </span>
                )}
                <span className="text-[8px] text-slate-500 font-bold block mt-1 uppercase font-mono">TASARRUF PUANI: {activeProv.weather.savingScore}</span>
              </div>
            </div>

            {/* TAB CONTENT: 🌦️ WEATHER VIEW CARD */}
            {activeTab === 'weather' && (
              <div className="space-y-4.5">
                
                {/* Main Temperature Displays */}
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="space-y-0.5 text-left">
                    <span className="text-3xl font-black font-mono tracking-tight text-glow inline-block">{activeProv.weather.temp}°C</span>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      HİSSEDİLEN: <strong className="text-white font-mono">{activeProv.weather.felt}°C</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl block mb-0.5">{activeProv.weather.forecast[0].icon}</span>
                    <span className="text-[9.5px] font-black uppercase text-[#00fbfb] tracking-wider font-mono">
                      {activeProv.weather.forecast[0].condition === 'Sunny' ? '☀️ GÜNEŞLİ' : 
                       activeProv.weather.forecast[0].condition === 'Raining' ? '🌧️ YAĞMURLU' : '🌤️ PA. BULUTLU'}
                    </span>
                  </div>
                </div>

                {/* Grid 11 metrics required parameter fields */}
                <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest block font-mono pr-2">
                  📊 METEOROLOJİK DETAY PARALEL DEĞERLERİ
                </span>

                <div className="grid grid-cols-2 gap-2 text-left">
                  {/* Humidity */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-black block">NEM ORANI</span>
                    <span className="text-xs font-black font-mono block mt-0.5">%{activeProv.weather.humidity}</span>
                  </div>
                  {/* Wind speed */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-black block">RÜZGAR HIZI</span>
                    <span className="text-xs font-black font-mono block mt-0.5">{activeProv.weather.wind} km/h</span>
                  </div>
                  {/* Rain probability */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-black block">YAĞIŞ İHTİMALİ</span>
                    <span className="text-xs font-black font-mono block mt-0.5">%{activeProv.weather.rainProb}</span>
                  </div>
                  {/* UV index */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-black block">UV İNDEKSİ</span>
                    <span className="text-xs font-black font-mono block mt-0.5">{activeProv.weather.uv} / 10</span>
                  </div>
                  {/* Sunrise */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-black block">GÜN DOĞUMU</span>
                    <span className="text-xs font-black font-mono block mt-0.5">☀️ {activeProv.weather.sunrise}</span>
                  </div>
                  {/* Sunset */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-black block">GÜN BATIMI</span>
                    <span className="text-xs font-black font-mono block mt-0.5">🌙 {activeProv.weather.sunset}</span>
                  </div>
                  {/* Air Quality */}
                  <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl col-span-2">
                    <span className="text-[8px] text-slate-500 font-black block">HAVA KALİTESİ (AQI)</span>
                    <span className="text-xs font-black block mt-0.5 text-glow-hover text-emerald-400">
                      {activeProv.weather.aqi} AQI • {activeProv.weather.aqiText}
                    </span>
                  </div>
                </div>

                {/* 📅 7-DAY FORECAST PREDICTIVE (7 GÜNLÜK TAHMİN) */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-black text-cyan-300 uppercase block tracking-wider font-mono">
                    📅 COĞRAFİ 7 GÜNLÜK METEOROLOJİ TAHMİNİ
                  </span>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {activeProv.weather.forecast.map((fc, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 rounded-xl bg-black/15 border border-white/5 text-[10px] font-bold text-slate-300"
                      >
                        <span className="w-18 block text-left font-semibold">{fc.day}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs block leading-none">{fc.icon}</span>
                          <span className="text-[9px] font-extrabold text-slate-500 font-mono">%{fc.rainProb}</span>
                        </div>
                        <span className="font-mono font-semibold text-right text-slate-200">
                          {fc.minTemp}° / <span className="text-white font-extrabold">{fc.maxTemp}°C</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 💧 SMART WATER SAVINGS SUGGESTION COMPARTMENT */}
                <div className="space-y-2 border-t border-white/5 pt-3 text-left">
                  <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest block font-sans">
                    🌱 AKILLI SU TASARRUFU TAVSİYELERİ
                  </span>
                  <div className="space-y-1.5">
                    {waterSavingSuggestions.map((sug, sidx) => (
                      <div 
                        key={sidx} 
                        className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/15 text-[10px] leading-relaxed font-semibold text-slate-300"
                      >
                        {sug}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🌱 SMART PLANT INTEGRATOR CARE CARD */}
                <div className="p-3 bg-gradient-to-br from-indigo-950/20 to-teal-950/20 rounded-2xl border border-teal-500/15 text-left space-y-1.5 self-stretch">
                  <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-widest block font-mono">
                    🪴 AKILLI BOTANİK INTEGRASYON ADVISOR
                  </span>
                  <p className="text-[10px] font-bold leading-relaxed text-slate-300">
                    {plantCareSuggestion}
                  </p>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 🗺️ RESERVOIR DOLULUK & EDIT RISK VIEW CARD */}
            {activeTab === 'drought' && (
              <div className="space-y-5">
                
                {/* Fullness parameters displays */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-xs font-black text-slate-300 font-mono uppercase">
                    <span>BARAJ GÖZLEM ORANI</span>
                    <span className="font-mono text-cyan-404">%{activeProv.fullness} DOLU</span>
                  </div>
                  
                  {/* Visual Bar progress */}
                  <div className="h-4.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 relative flex items-center">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 relative ${
                        activeProv.weather.dLevel === 'critical' ? 'bg-gradient-to-r from-red-600 to-rose-450' : 
                        activeProv.weather.dLevel === 'watch' ? 'bg-gradient-to-r from-orange-500 to-amber-450' : 
                        activeProv.weather.dLevel === 'risky' ? 'bg-gradient-to-r from-yellow-450 to-amber-300' : 
                        'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.max(5, activeProv.fullness)}%` }}
                    >
                      <span className="absolute inset-0 bg-white/10 select-none animate-shimmer" />
                    </div>
                  </div>
                  <span className="text-[8.5px] text-slate-500 font-bold block uppercase mt-1">
                    Güncel Sör sızıntıları ve buharlaşma indeksi fiyata dahildir.
                  </span>
                </div>

                {/* Numerical detail widgets */}
                <div className="grid grid-cols-2 gap-3.5 pt-1 text-left">
                  <div className="p-3 bg-black/20 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider leading-none">SU REZERVLERİ</span>
                    <span className="text-sm font-black text-teal-300 block mt-1.5 font-mono leading-none">{activeProv.usableWater}</span>
                    <span className="text-[8.5px] font-semibold text-slate-500 block mt-1 leading-none">Milyon m³</span>
                  </div>
                  <div className="p-3 bg-black/20 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider leading-none">ANA REZERVUAR</span>
                    <span className="text-xs font-black text-white block mt-1.5 truncate leading-none">{activeProv.damName}</span>
                    <span className="text-[8.5px] font-bold text-slate-500 block mt-1 leading-none">{language === 'tr' ? 'Bölge Barajı' : 'Anchor Dam'}</span>
                  </div>
                </div>

                {/* Region Averages list block */}
                <div className="space-y-2 border-t border-white/5 pt-3.5 text-left">
                  <span className="text-[9px] font-black text-cyan-300 uppercase block tracking-wider font-mono">
                    📈 BÖLGESEL DOLULUK ORTALAMALARI
                  </span>

                  <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1">
                    {regionalAverages.map((reg, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-2 rounded-xl bg-white/[0.01] border border-white/5 text-[10.5px] font-bold text-slate-350"
                      >
                        <span className="font-semibold text-white">{reg.region}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[8px] font-black bg-slate-900 border border-slate-700 text-slate-400 px-1 py-0.5 rounded">
                            {reg.criticalCount} KRİTİK İL
                          </span>
                          <span className="text-white font-extrabold">%{reg.avgFullness}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🛠️ EDITABLE DROUGHT LEVEL MANAGER (KURAKLIK SEVİYELERİNİN DEĞİŞTİRİLEBİLMESİ) */}
                <div className="space-y-2 border-t border-white/10 pt-3.5 text-left">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block font-sans flex items-center gap-1">
                    <Edit2 size={11} className="text-amber-500 animate-pulse" />
                    COĞRAFİ KURAKLIK SEVİYESİ DÜZENLEYİCİ
                  </span>
                  
                  <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                    Seçili şehrin kuraklık risk düzeyini manuel olarak anlık simülasyon ve alarm testleri için güncelleyebilirsiniz:
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                    {/* Safe button */}
                    <button
                      onClick={() => handleUpdateDroughtRisk('safe')}
                      className={`p-1.5 text-[10.5px] font-black rounded-lg border text-center transition-all cursor-pointer ${
                        activeProv.weather.dLevel === 'safe'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-95'
                          : 'bg-black/35 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      DÜŞÜK
                    </button>
                    {/* Risky button */}
                    <button
                      onClick={() => handleUpdateDroughtRisk('risky')}
                      className={`p-1.5 text-[10.5px] font-black rounded-lg border text-center transition-all cursor-pointer ${
                        activeProv.weather.dLevel === 'risky'
                          ? 'bg-yellow-500 text-slate-950 border-yellow-405 shadow-md scale-95'
                          : 'bg-black/35 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      ORTA
                    </button>
                    {/* Watch button */}
                    <button
                      onClick={() => handleUpdateDroughtRisk('watch')}
                      className={`p-1.5 text-[10.5px] font-black rounded-lg border text-center transition-all cursor-pointer ${
                        activeProv.weather.dLevel === 'watch'
                          ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md scale-95'
                          : 'bg-black/35 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      YÜKSEK
                    </button>
                    {/* Critical button */}
                    <button
                      onClick={() => handleUpdateDroughtRisk('critical')}
                      className={`p-1.5 text-[10.5px] font-black rounded-lg border text-center transition-all cursor-pointer ${
                        activeProv.weather.dLevel === 'critical'
                          ? 'bg-red-650 text-white border-red-500 shadow-md scale-95'
                          : 'bg-black/35 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      KRİTİK
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Quick action footer navigation buttons to water logs logging screen */}
            <button
              onClick={() => onNavigate && onNavigate('add')}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-405/35 hover:bg-cyan-400/20 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'tr' ? 'SU TASARRUFU KAYDET' : 'LOG WATER SAVINGS'}</span>
              <ArrowRight size={13} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
