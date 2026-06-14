import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, Badge, Mission, WaterRecord } from '../types';
import { 
  Trophy, 
  Sprout, 
  Sparkles, 
  AlertTriangle, 
  Leaf, 
  Zap, 
  Droplet, 
  RefreshCw, 
  Clock, 
  HelpCircle, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  CheckCircle,
  Flower2
} from 'lucide-react';
import { FIFTY_PLANTS, PlantInfo } from '../constants/plants';
import VirtualGarden from './VirtualGarden';

interface PlantScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  badges: Badge[];
  missions: Mission[];
  plantState: any;
  records: WaterRecord[];
  onWaterPlant: () => void;
  onClaimBadge: (id: string) => void;
  onUpdateMissionStatus?: (id: string, status: 'not_started' | 'in_progress' | 'completed') => void;
  onGenerateNewMissions?: () => void;
  userLevel?: number;
  totalSavings?: number;
  onAwardXp?: (xp: number, reasonTr: string, reasonEn: string) => void;
  onShowAlert?: (msg: string) => void;
}

const MASTER_PLANTS_LIST: PlantInfo[] = FIFTY_PLANTS;

export default function PlantScreen({ 
  language, 
  theme,
  colors, 
  missions, 
  plantState, 
  records,
  onWaterPlant,
  onUpdateMissionStatus,
  onGenerateNewMissions,
  userLevel = 3,
  totalSavings = 1400,
  onAwardXp = () => {},
  onShowAlert = () => {}
}: PlantScreenProps) {
  
  const t = TRANSLATIONS[language];
  const [wateringEffect, setWateringEffect] = useState(false);
  const [growthSparkle, setGrowthSparkle] = useState(false);
  
  // Custom garden toggle slot
  const [activeGardenMode, setActiveGardenMode] = useState<'single' | 'multi'>('single');
  
  // Plant selector states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('elma'); // Set to default 'elma' to ensure initial visualization is active
  const [provisionalSelectedId, setProvisionalSelectedId] = useState<string>('elma');

  // Accordion Section Expand States
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({
    intro: true,
    health: false,
    eco: false,
    lifespan: false,
    fact: false
  });

  const toggleAccordion = (key: string) => {
    setAccordionState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Per-plant growth percentage cache stored in localStorage
  const [plantGrowths, setPlantGrowths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('aquacheck_plant_growths_v3');
    return saved ? JSON.parse(saved) : {};
  });

  const getPlantGrowth = (plantId: string) => {
    return plantGrowths[plantId] !== undefined ? plantGrowths[plantId] : 10; // Start at 10% (Tohum stage)
  };

  const currentPlant = useMemo(() => {
    return MASTER_PLANTS_LIST.find(p => p.id === selectedPlantId) || MASTER_PLANTS_LIST[0];
  }, [selectedPlantId]);

  // Active user selection representation
  const featuredProvisionalPlant = useMemo(() => {
    return MASTER_PLANTS_LIST.find(p => p.id === provisionalSelectedId) || MASTER_PLANTS_LIST[0];
  }, [provisionalSelectedId]);

  // Expanded Categories matching exactly the 47 plants listed in plants.ts
  const flowers = [
    { id: 'gul', name: 'Gül', icon: '🌹' },
    { id: 'papatya', name: 'Papatya', icon: '🌼' },
    { id: 'aycicegi', name: 'Ayçiçeği', icon: '🌻' },
    { id: 'lale', name: 'Lale', icon: '🌷' },
    { id: 'menekse', name: 'Menekşe', icon: '💜' },
    { id: 'lavanta', name: 'Lavanta', icon: '🌿' },
    { id: 'ortanca', name: 'Ortanca', icon: '🌸' },
    { id: 'manolya', name: 'Manolya', icon: '🌸' },
    { id: 'sakayik', name: 'Şakayık', icon: '🌹' },
    { id: 'kasimpati', name: 'Kasımpatı', icon: '🌼' }
  ];

  const forestTrees = [
    { id: 'cam', name: 'Çam', icon: '🌲' },
    { id: 'mese', name: 'Meşe', icon: '🌳' },
    { id: 'sedir', name: 'Sedir', icon: '🌲' },
    { id: 'cinar', name: 'Çınar', icon: '🌳' },
    { id: 'kavak', name: 'Kavak', icon: '🌳' },
    { id: 'kayin', name: 'Kayın', icon: '🌳' },
    { id: 'ihlamur', name: 'Ihlamur', icon: '🌳' }
  ];

  const fruitTrees = [
    { id: 'elma', name: 'Elma', icon: '🍎' },
    { id: 'armut', name: 'Armut', icon: '🍐' },
    { id: 'portakal', name: 'Portakal', icon: '🍊' },
    { id: 'limon', name: 'Limon', icon: '🍋' },
    { id: 'kiraz', name: 'Kiraz', icon: '🍒' },
    { id: 'seftali', name: 'Şeftali', icon: '🍑' },
    { id: 'mango', name: 'Mango', icon: '🥭' },
    { id: 'avokado', name: 'Avokado', icon: '🥑' },
    { id: 'findik', name: 'Fındık', icon: '🌰' },
    { id: 'hindistancevizi', name: 'Hindistan Cevizi', icon: '🥥' },
    { id: 'uzum', name: 'Üzüm', icon: '🍇' }
  ];

  const herbals = [
    { id: 'nane', name: 'Nane', icon: '🌿' },
    { id: 'kekik', name: 'Kekik', icon: '🌿' },
    { id: 'adasayi', name: 'Adaçayı', icon: '🌿' },
    { id: 'biberiye', name: 'Biberiye', icon: '🌿' },
    { id: 'feslegen', name: 'Fesleğen', icon: '🌿' },
    { id: 'aloevera', name: 'Aloe Vera', icon: '🌿' },
    { id: 'isirganotu', name: 'Isırgan Otu', icon: '🌿' }
  ];

  const vegetables = [
    { id: 'patates', name: 'Patates', icon: '🥔' },
    { id: 'sogan', name: 'Soğan', icon: '🧅' },
    { id: 'havuc', name: 'Havuç', icon: '🥕' },
    { id: 'misir', name: 'Mısır', icon: '🌽' },
    { id: 'marul', name: 'Marul', icon: '🥬' },
    { id: 'salatalik', name: 'Salatalık', icon: '🥒' },
    { id: 'domates', name: 'Domates', icon: '🍅' },
    { id: 'biber', name: 'Biber', icon: '🫑' }
  ];

  const specialPlants = [
    { id: 'kaktus', name: 'Kaktüs', icon: '🌵' },
    { id: 'bonsai', name: 'Bonsai', icon: '🌱' },
    { id: 'bambu', name: 'Bambu', icon: '🎋' },
    { id: 'yonca', name: 'Yonca', icon: '🍀' }
  ];

  // Upgraded 8-Stage Growth System:
  // Tohum ↓ Filiz ↓ Fide ↓ Genç Bitki ↓ Olgun Bitki ↓ Çiçeklenme ↓ Meyve Verme ↓ Tam Gelişim
  const getGrowthStage = (pct: number, plantId: string) => {
    const isFruitTree = ['elma', 'armut', 'portakal', 'limon', 'kiraz', 'seftali', 'mango', 'avokado', 'findik', 'hindistancevizi', 'uzum'].includes(plantId);
    
    if (pct <= 12) {
      return { 
        nameTr: 'Tohum', 
        nameEn: 'Seed', 
        icon: '🌱', 
        color: 'text-amber-500', 
        descTr: 'Uykusuz toprak altında şirin bir tohum; can suyu bekliyor.',
        descEn: 'Cozy seed sleeping under fertile soil, craving its first water drops.'
      };
    } else if (pct <= 25) {
      return { 
        nameTr: 'Filiz', 
        nameEn: 'Sprout', 
        icon: '🌱', 
        color: 'text-emerald-400', 
        descTr: 'İlk minik yeşil kıvılcım toprağı deldi ve güneşe gülümsedi!',
        descEn: 'The very first green shoot popped through the crust, smiling at the sun!'
      };
    } else if (pct <= 38) {
      return { 
        nameTr: 'Fide', 
        nameEn: 'Seedling', 
        icon: '🌿', 
        color: 'text-teal-400', 
        descTr: 'Kökleri derinliklere uzanan taze fide, rüzgara esniyor.',
        descEn: 'A healthy young seedling establishing key roots and growing its stem.'
      };
    } else if (pct <= 52) {
      return { 
        nameTr: 'Genç Bitki', 
        nameEn: 'Young Plant', 
        icon: '🎋', 
        color: 'text-green-400', 
        descTr: 'Yan sürgünleri gelişti; fotosentez gücü artıyor.',
        descEn: 'Side branches unfolding quickly, absorbing ambient light.'
      };
    } else if (pct <= 66) {
      return { 
        nameTr: 'Olgun Bitki', 
        nameEn: 'Mature Plant', 
        icon: isFruitTree ? '🌳' : '🪴', 
        color: 'text-green-500', 
        descTr: 'Gelişmiş gövdesi ve gür yapraklarıyla karbon hapsediyor.',
        descEn: 'A fully established sturdy plant, actively capturing carbon.'
      };
    } else if (pct <= 80) {
      return { 
        nameTr: 'Çiçeklenme', 
        nameEn: 'Flowering', 
        icon: '🌸', 
        color: 'text-fuchsia-400', 
        descTr: 'Harika tomurcuklar patladı! Tozlayıcı böceklere nektar sunuyor.',
        descEn: 'Vibrant flower buds are opening, inviting garden pollinators.'
      };
    } else if (pct <= 92) {
      // Stage 7: Meyve Verme
      let fruitingIcon = '🌸🍒';
      if (plantId === 'elma') fruitingIcon = '🌸🍎';
      else if (plantId === 'armut') fruitingIcon = '🌸🍐';
      else if (plantId === 'portakal') fruitingIcon = '🌸🍊';
      else if (plantId === 'limon') fruitingIcon = '🌸🍋';
      else if (plantId === 'seftali') fruitingIcon = '🌸🍑';
      else if (plantId === 'mango') fruitingIcon = '🌸🥭';
      else if (plantId === 'avokado') fruitingIcon = '🌸🥑';
      else if (plantId === 'findik') fruitingIcon = '🌸🌰';
      else if (plantId === 'hindistancevizi') fruitingIcon = '🌴🥥';
      else if (plantId === 'uzum') fruitingIcon = '🌸🍇';
      else if (plantId === 'kaktus') fruitingIcon = '🌵✨';
      else if (plantId === 'cilek') fruitingIcon = '🍓';

      return { 
        nameTr: isFruitTree ? 'Meyve Verme' : 'Yoğun Çiçeklenme', 
        nameEn: isFruitTree ? 'Fruit Bearing' : 'Heavy Blooms', 
        icon: fruitingIcon, 
        color: 'text-rose-500', 
        descTr: isFruitTree 
          ? 'Bitkiniz taze, lezzetli meyvelerini büyütmeye başladı!' 
          : 'Bitkiniz muazzam çiçek kurullarıyla bezendi!',
        descEn: isFruitTree 
          ? 'Branches are actively filling with early fresh organic fruits!' 
          : 'Splendid floral displays completely wrap your mature botanic pot!'
      };
    } else {
      // Stage 8: Tam Gelişim
      let finalIcon = '🌳🍎';
      if (plantId === 'elma') finalIcon = '🌳🍎';
      else if (plantId === 'armut') finalIcon = '🌳🍐';
      else if (plantId === 'portakal') finalIcon = '🌳🍊';
      else if (plantId === 'limon') finalIcon = '🌳🍋';
      else if (plantId === 'kiraz') finalIcon = '🌳🍒';
      else if (plantId === 'seftali') finalIcon = '🌳🍑';
      else if (plantId === 'mango') finalIcon = '🌳🥭';
      else if (plantId === 'avokado') finalIcon = '🌳🥑';
      else if (plantId === 'findik') finalIcon = '🌳🌰';
      else if (plantId === 'hindistancevizi') finalIcon = '🌴🥥';
      else if (plantId === 'uzum') finalIcon = '🍇🍇';
      else if (plantId === 'gul') finalIcon = '🌹🌹';
      else if (plantId === 'papatya') finalIcon = '🌼🌼';
      else if (plantId === 'aycicegi') finalIcon = '🌻🌻';
      else if (plantId === 'lale') finalIcon = '🌷🌷';
      else if (plantId === 'menekse') finalIcon = '💜💜';
      else if (plantId === 'lavanta') finalIcon = '🌿💜';
      else if (plantId === 'ortanca') finalIcon = '🌸🌸';
      else if (plantId === 'manolya') finalIcon = '🌸✨';
      else if (plantId === 'sakayik') finalIcon = '🌹✨';
      else if (plantId === 'kasimpati') finalIcon = '🌼✨';
      else if (plantId === 'kaktus') finalIcon = '🌵⭐';
      else if (plantId === 'bonsai') finalIcon = '🌳✨';
      else if (plantId === 'bambu') finalIcon = '🎋⭐';
      else if (plantId === 'yonca') finalIcon = '🍀✨';
      else finalIcon = '🌿✨';

      return { 
        nameTr: 'Tam Gelişim', 
        nameEn: 'Full Development', 
        icon: finalIcon, 
        color: 'text-indigo-400 font-extrabold',
        descTr: 'Mükemmel! Bitkiniz nihai büyüme sınırına ve büyüleyici ekolojik ihtişamına ulaştı!',
        descEn: 'Outstanding! The plant has reached deep biological peak and maximum eco-rejuvenation value!'
      };
    }
  };

  // Determine drought-health state: limit excessive water logs to protect flora
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLiters = records
    .filter(r => r.date === todayStr)
    .reduce((sum, r) => sum + r.liters, 0);

  const limitThreshold = 140; 
  const isWithered = todayLiters > limitThreshold;

  const triggerWatering = () => {
    if (!selectedPlantId) return;
    setWateringEffect(true);
    setGrowthSparkle(true);
    
    // Increment growth nicely
    const currentGrowth = getPlantGrowth(selectedPlantId);
    const increment = Math.floor(Math.random() * 5) + 12; 
    const newGrowth = Math.min(100, currentGrowth + increment);

    const updatedGrowths = {
      ...plantGrowths,
      [selectedPlantId]: newGrowth
    };
    setPlantGrowths(updatedGrowths);
    localStorage.setItem('aquacheck_plant_growths_v3', JSON.stringify(updatedGrowths));

    // Execute water callback from parent (+150 XP)
    onWaterPlant();

    setTimeout(() => {
      setWateringEffect(false);
    }, 1100);

    setTimeout(() => {
      setGrowthSparkle(false);
    }, 2100);
  };

  const activePlantGrowth = selectedPlantId ? getPlantGrowth(selectedPlantId) : 10;
  const activeStage = getGrowthStage(activePlantGrowth, selectedPlantId);

  // Close the menu and apply the selection
  const handleConfirmSelection = () => {
    if (provisionalSelectedId) {
      setSelectedPlantId(provisionalSelectedId);
      setIsMenuOpen(false);
      // Reset accordion to show intro
      setAccordionState({
        intro: true,
        health: false,
        eco: false,
        lifespan: false,
        fact: false
      });
    }
  };

  // Dynamically generated container classes mapping to AquaCheck's dark theme
  const isLightTheme = theme === 'white';
  
  const containerClass = isLightTheme
    ? 'p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md text-slate-800'
    : 'p-6 rounded-3xl bg-slate-950/60 border border-white/5 backdrop-blur-md shadow-2xl text-slate-100';

  const secondaryCardClass = isLightTheme
    ? 'p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800'
    : 'p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-100';

  const selectItemClass = (isProv: boolean) => {
    if (isLightTheme) {
      return isProv
        ? 'bg-teal-50 border-teal-400 text-teal-800 font-extrabold shadow-sm'
        : 'border-slate-200 text-slate-700 hover:bg-slate-50';
    } else {
      return isProv
        ? 'bg-teal-500/10 border-teal-400 text-teal-300 font-extrabold shadow-[0_0_12px_rgba(20,184,166,0.1)]'
        : 'border-white/5 text-slate-300 hover:bg-white/[0.02]';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Dynamic Eco System Banner */}
      <div 
        className={containerClass}
        style={!isLightTheme ? { backgroundColor: 'rgba(15, 23, 42, 0.6)' } : undefined}
      >
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="space-y-1.5 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-teal-500/15 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              🌿 {language === 'tr' ? 'BİTKİ SİSTEMLERİ' : 'BOTANICAL ECOSYSTEM'}
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
              {language === 'tr' ? 'AKILLI BÜYÜME VE ECO-ARŞİV' : 'FLORA INCUBATOR & ARCHIVE'}
            </h2>
            <p className={`text-xs max-w-xl font-semibold leading-relaxed ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
              {language === 'tr' 
                ? 'Evdeki su tasarrufu verilerini girdikçe seçtiğiniz bitkiyi tohumdan tam gelişime kadar besleyin. Eko-Arşiv ile ekolojik değerleri öğrenin.' 
                : 'Nurture your plant custom specimens from tiny seed to full development stage using savings. Unlock rich ecological database.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4.5 shrink-0 bg-teal-500/10 border border-teal-500/15 p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex flex-col items-center justify-center shadow-md select-none shrink-0 font-sans">
              <span className="text-[9px] font-black leading-none opacity-80">LVL</span>
              <span className="text-xl font-black leading-none">{plantState.level}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-400 block tracking-wider uppercase font-mono">
                {language === 'tr' ? 'BOTANİK SEVİYESİ' : 'BOTANIST RANK'}
              </span>
              <h4 className="text-xs font-black uppercase">
                {language === 'tr' ? `${plantState.level}. Seviye Bahçıvan` : `Level ${plantState.level} Gardener`}
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 font-extrabold mt-0.5">
                🔥 {plantState.streak} {language === 'tr' ? 'Gün Aktif' : 'Day Streak'}
              </span>
            </div>
          </div>
        </div>

        {/* Global XP Slider Bar inside header */}
        <div className="mt-5 pt-4 border-t border-white/5 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className={isLightTheme ? 'text-slate-500' : 'text-slate-400'}>{plantState.xp} / 2000 XP</span>
            <span className="text-teal-400 font-black">% {Math.round((plantState.xp / 2000) * 100)}</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden p-0.5 border ${isLightTheme ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-white/5'}`}>
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (plantState.xp / 2000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modern sliding garden mode toggle tabs */}
      <div className="flex bg-black/35 p-1 rounded-2xl border border-white/10 select-none max-w-md mx-auto">
        <button
          onClick={() => setActiveGardenMode('single')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeGardenMode === 'single' ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sprout size={14} />
          <span>{language === 'tr' ? '🌹 Tekil Bitki Alanı' : '🌹 Single Tree'}</span>
        </button>
        <button
          onClick={() => setActiveGardenMode('multi')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeGardenMode === 'multi' ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flower2 size={14} />
          <span>{language === 'tr' ? '🏡 Çoklu Sanal Bahçe' : '🏡 Sustainable Garden'}</span>
        </button>
      </div>

      {activeGardenMode === 'multi' ? (
        <div className="animate-fade-in">
          <VirtualGarden 
            language={language} 
            colors={colors} 
            userLevel={userLevel}
            totalSavings={totalSavings}
            onAwardXp={onAwardXp}
            onShowAlert={onShowAlert}
          />
        </div>
      ) : (
        <>
          {/* 1) BİTKİ SEÇİM ALANI (Collapsible system initially just showing Select Button) */}
          <div 
            className={containerClass}
            style={!isLightTheme ? { backgroundColor: 'rgba(15, 23, 42, 0.6)' } : undefined}
          >
        <div className="text-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border border-teal-400/40 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <span>🌱 {language === 'tr' ? 'Bitki Türü Seç' : 'Select Plant Type'}</span>
            {isMenuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Categories Grid (Visible on trigger) */}
        {isMenuOpen && (
          <div className="mt-5 p-4 rounded-2xl bg-black/10 border border-white/5 space-y-6 animate-slide-down">
            <div className="text-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest font-mono">
                {language === 'tr' ? 'BİTKİ KATALOGU' : 'FLORA DIRECTORY'}
              </span>
            </div>

            {/* Grid categorized list in Turkish / English with graphics/emojis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Çiçekler & Şifalı Bitkiler */}
              <div className="space-y-6">
                {/* 1. Çiçekler */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-widest text-teal-400 uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <span>🌼</span> {language === 'tr' ? 'ÇİÇEKLER' : 'FLOWERS'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {flowers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProvisionalSelectedId(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${selectItemClass(provisionalSelectedId === item.id)}`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Şifalı Bitkiler */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-widest text-emerald-400 uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <span>🌿</span> {language === 'tr' ? 'ŞİFALI BİTKİLER' : 'HERBAL PLANTS'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {herbals.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProvisionalSelectedId(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${selectItemClass(provisionalSelectedId === item.id)}`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: Orman Ağaçları & Sebzeler */}
              <div className="space-y-6">
                {/* 3. Orman Ağaçları */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-widest text-[#0ea5e9] uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <span>🌲</span> {language === 'tr' ? 'ORMAN AĞAÇLARI' : 'FOREST TREES'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {forestTrees.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProvisionalSelectedId(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${selectItemClass(provisionalSelectedId === item.id)}`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Sebzeler */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-widest text-amber-500 uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <span>🥕</span> {language === 'tr' ? 'SEBZELER' : 'VEGETABLES'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {vegetables.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProvisionalSelectedId(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${selectItemClass(provisionalSelectedId === item.id)}`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Meyve Ağaçları & Özel Bitkiler */}
              <div className="space-y-6">
                {/* 5. Meyve Ağaçları */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-widest text-rose-400 uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <span>🍎</span> {language === 'tr' ? 'MEYVE AĞAÇLARI' : 'FRUIT TREES'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {fruitTrees.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProvisionalSelectedId(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${selectItemClass(provisionalSelectedId === item.id)}`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Özel Bitkiler */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-widest text-purple-400 uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <span>🎋</span> {language === 'tr' ? 'ÖZEL BİTKİLER' : 'SPECIAL FLORA'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {specialPlants.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProvisionalSelectedId(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 ${selectItemClass(provisionalSelectedId === item.id)}`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Concluding Confirm Okay control element */}
            {provisionalSelectedId && (
              <div className="pt-4 flex flex-col items-center border-t border-white/5 space-y-3 animate-fade-in">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-extrabold ${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-white/5 text-slate-200'}`}>
                  <span>🎨 {language === 'tr' ? 'Seçilen Bitki:' : 'Selected Plant:'}</span>
                  <span className="text-teal-400 text-sm font-black">
                    {featuredProvisionalPlant?.icon} {language === 'tr' ? featuredProvisionalPlant?.nameTr : featuredProvisionalPlant?.nameEn}
                  </span>
                </div>
                
                <button
                  id="confirm-plant-selection-btn"
                  onClick={handleConfirmSelection}
                  className="px-8 h-11 bg-teal-500 hover:bg-teal-600 border border-teal-400/30 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={15} />
                  <span>{language === 'tr' ? 'Tamam (Seçimi Onayla)' : 'Confirm Selection'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Single Column Stack: Visible only when selection is confirmed!
          ❌ BİTKİ SEÇİLMEDEN HİÇBİR BİLGİ GÖRÜNMESİN.
      */}
      {!selectedPlantId || !currentPlant ? (
        <div 
          className="p-8 md:p-12 text-center rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl max-w-xl mx-auto flex flex-col items-center space-y-4 animate-pulse"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-4xl">
            🌱
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-black uppercase tracking-wider text-teal-400">
              {language === 'tr' ? 'BİTKİ SEÇİLMEDİ' : 'NO PLANT TYPE SELECTED'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-semibold">
              {language === 'tr' 
                ? 'Lütfen yukarıdaki yeşil "Bitki Türü Seç" butonuna basın, dilediğiniz örneği kilitli listeden işaretleyip "Tamam" butonuna tıklayarak bahçenize can verin.' 
                : 'Please tap "Select Plant Type" button above, mark your choice and tap "Confirm Selection" button.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
          
          {/* 2) [ Bitki ] Card & Pot Visualizer */}
          <div 
            className="w-full p-6 md:p-8 rounded-3xl border border-white/5 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl relative overflow-hidden text-center text-slate-100"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
          >
            {/* Soft Ambient Radial Lights */}
            <div className="absolute top-0 w-80 h-80 pointer-events-none rounded-full opacity-10 blur-[100px] bg-teal-400 -translate-y-1/2" />
            <div className="absolute bottom-0 w-80 h-80 pointer-events-none rounded-full opacity-5 blur-[120px] bg-emerald-400 translate-y-1/2" />

            <div className="space-y-1 z-10">
              <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest font-mono">
                {language === 'tr' ? 'AKTİF BOTANİK POT' : 'ACTIVE LANDING SPECIMEN'}
              </span>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
                <span>{currentPlant.icon}</span> 
                <span>{language === 'tr' ? currentPlant.nameTr : currentPlant.nameEn}</span>
              </h3>
              <p className="text-[11px] text-teal-300 font-black uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 px-3 py-0.5 rounded-full inline-block">
                🌱 {activeStage.nameTr} ({language === 'tr' ? '8 Evreli Sistem' : '8-Stage Loop'})
              </p>
            </div>

            {/* Custom Large Glass Pot Visualizer */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-[3rem] p-1 flex items-center justify-center bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-slate-900 border border-white/10 shadow-3xl overflow-hidden mt-6 group">
              
              {/* Animated hydration fluid inside the glass jar */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500/15 to-emerald-400/5 pointer-events-none transition-all duration-1000"
                style={{ height: `${25 + activePlantGrowth * 0.7}%` }}
              />

              {/* Shimmer sparkle overlay when watering */}
              {growthSparkle && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/40 rounded-[2.9rem] animate-fade-in">
                  <div className="text-teal-400 text-5xl animate-ping flex gap-3">✨ 💦 ✨</div>
                </div>
              )}

              {/* Falling drops animation */}
              {wateringEffect && (
                <div className="absolute inset-x-0 top-6 bottom-16 z-20 flex justify-between px-20 pointer-events-none animate-bounce" style={{ animationDuration: '0.9s' }}>
                  <span className="text-4xl opacity-100">💧</span>
                  <span className="text-5xl opacity-100 delay-150">💧</span>
                  <span className="text-3xl opacity-90 delay-300">💧</span>
                </div>
              )}

              {/* Detailed floating watering result card inside glass */}
              {growthSparkle && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-slate-950/90 rounded-[2.9rem] text-center space-y-1 animate-fade-in pointer-events-none border border-teal-500/25">
                  <span className="text-5xl animate-bounce">💦</span>
                  <span className="text-xs font-black text-teal-300 tracking-widest uppercase">CAN SUYU ELENDİ (+150 XP)</span>
                  <span className="text-xs font-mono text-emerald-400 font-extrabold mt-1">
                    {language === 'tr' 
                      ? `Büyüme Derecesi: %${activePlantGrowth}!` 
                      : `Growth Progress: %${activePlantGrowth}!`}
                  </span>
                </div>
              )}

              {/* Master Plant Visual Render inside pot container */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                
                {/* Excess water indicator */}
                {isWithered && (
                  <div className="absolute -top-14 text-4xl animate-bounce">☀️</div>
                )}

                <div className={`text-9xl select-none transition-all duration-1000 drop-shadow-[0_10px_15px_rgba(20,184,166,0.2)] ${
                  isWithered 
                    ? 'grayscale contrast-50 opacity-40 scale-75 rotate-[12deg] duration-300' 
                    : wateringEffect 
                      ? 'scale-110 -rotate-3 duration-200' 
                      : 'hover:scale-105 duration-700 animate-pulse'
                }`} style={{ animationDuration: '3s' }}>
                  {activeStage.icon}
                </div>
              </div>

              {/* Status footer inside visualizer */}
              <div className="absolute bottom-5 left-0 right-0 text-center select-none z-10">
                {isWithered ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                    <AlertTriangle size={10} />
                    {language === 'tr' ? 'BİTKİ YORULDU (LİMİT AŞILDI)' : 'WITHERED (LIMIT PASSED)'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-teal-300">
                    <Check size={10} />
                    {language === 'tr' ? 'SAĞLIKLI DOĞAL BÜYÜME' : 'NATURAL BIO-GROWTH'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3) [ Can Suyu Ver ] Button */}
          <div className="w-full text-center z-10">
            <button
              id="water-the-plant-button"
              onClick={triggerWatering}
              disabled={isWithered}
              className={`h-14 w-full md:w-3/4 rounded-full font-black text-sm uppercase tracking-widest transition-all gap-2.5 flex items-center justify-center cursor-pointer scale-100 active:scale-95 border shadow-xl ${
                isWithered 
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed mx-auto' 
                  : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 border-teal-400/30 hover:scale-[1.01] text-white mx-auto hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]'
              }`}
            >
              <Droplet size={18} className={wateringEffect ? 'animate-bounce' : ''} />
              <span>{language === 'tr' ? 'CAN SUYU VER (+150 XP)' : 'WATER THE PLANT (+150 XP)'}</span>
            </button>

            {isWithered && (
              <p className="text-[10px] text-red-450 bg-red-500/10 max-w-md mx-auto p-3 rounded-2xl border border-red-500/15 leading-relaxed font-semibold mt-3">
                ⚠️ {language === 'tr' 
                  ? 'Günlük hanehalkı su harcamaları eşiği (140LT) aşıldığı için bitkiye su verilemez. Lütfen yarın tazyiki kısarak tasarruf edin.' 
                  : 'Water limits saturated today (140L crossed). Close the water loops and spare for tomorrow.'}
              </p>
            )}
          </div>

          {/* 4) [ Aktif Büyüme Sistemi ] Info Details Box */}
          <div 
            className="w-full p-5 rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-md space-y-3.5"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          >
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-slate-400 uppercase tracking-widest font-mono text-[10px]">
                {language === 'tr' ? 'AKTİF BÜYÜME SÜRECİ:' : 'ACTIVE GROWTH PROCESS:'}
              </span>
              <span className="text-teal-400 font-mono tracking-wider">
                {language === 'tr' ? `Seviye ${plantState.level}` : `Lvl ${plantState.level}`} • %{activePlantGrowth}
              </span>
            </div>
            
            {/* Fine growth progress bar tool */}
            <div className="h-3 bg-slate-950 rounded-full border border-white/5 p-0.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(20,184,166,0.3)]"
                style={{ width: `${activePlantGrowth}%` }}
              />
            </div>

            <div className="flex items-start gap-2 bg-white/[0.01] border border-white/5 p-3 rounded-xl text-xs font-medium leading-relaxed text-slate-300">
              <span className="text-sm shrink-0">📢</span>
              <span>{language === 'tr' ? activeStage.descTr : activeStage.descEn}</span>
            </div>
          </div>

          {/* 5) [ Gül Eko-Arşiv Bilgileri ] Title Banner */}
          <div className="w-full pt-4 text-center">
            <h4 className="text-sm font-black uppercase text-teal-400 tracking-widest font-mono flex items-center justify-center gap-1.5">
              <span>{currentPlant.icon}</span>
              {language === 'tr' ? `${currentPlant.nameTr} Eko-Arşiv Bilgileri` : `${currentPlant.nameEn} Eco-Archive Info`}
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              {language === 'tr' 
                ? 'Bitkinin tahlil edilen biyolojik verilerini aşağıdan inceleyin.' 
                : 'Examine detailed biological parameters of your chosen active species.'}
            </p>
          </div>

          {/* Accordion Stack Lists (6, 7, 8, 9, 10) */}
          <div className="w-full space-y-2.5 z-10 animate-slide-down">
            
            {/* 6) [ Genel Tanıtım ] */}
            <div 
              className="rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden transition-all shadow-sm"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
              <button
                onClick={() => toggleAccordion('intro')}
                className="w-full px-5 py-4 text-left flex justify-between items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
                <span className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                  <Sprout size={15} className="text-teal-400" />
                  <span>📖 {language === 'tr' ? 'GENEL TANITIM' : 'INTRODUCTION'}</span>
                </span>
                {accordionState.intro ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionState.intro && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-semibold border-t border-white/5 animate-slide-down">
                  {language === 'tr' ? currentPlant.descTr : currentPlant.descEn}
                </div>
              )}
            </div>

            {/* 7) [ İnsan Sağlığına Faydaları ] */}
            <div 
              className="rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden transition-all shadow-sm"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
              <button
                onClick={() => toggleAccordion('health')}
                className="w-full px-5 py-4 text-left flex justify-between items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
                <span className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                  <Heart size={15} className="text-rose-450" />
                  <span>❤️ {language === 'tr' ? 'İNSAN SAĞLIĞINA FAYDALARI' : 'HUMAN HEALTH BENEFITS'}</span>
                </span>
                {accordionState.health ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionState.health && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-semibold border-t border-white/5 animate-slide-down">
                  {language === 'tr' ? currentPlant.healthTr : currentPlant.healthEn}
                </div>
              )}
            </div>

            {/* 8) [ Çevreye Katkıları ] */}
            <div 
              className="rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden transition-all shadow-sm"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
              <button
                onClick={() => toggleAccordion('eco')}
                className="w-full px-5 py-4 text-left flex justify-between items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
                <span className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                  <Leaf size={15} className="text-emerald-400" />
                  <span>🌍 {language === 'tr' ? 'ÇEVREYE KATKILARI' : 'ENVIRONMENTAL CONTRIBUTIONS'}</span>
                </span>
                {accordionState.eco ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionState.eco && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-semibold border-t border-white/5 animate-slide-down">
                  {language === 'tr' ? currentPlant.ecoTr : currentPlant.ecoEn}
                </div>
              )}
            </div>

            {/* 9) [ Ortalama Yaşam Süresi ] */}
            <div 
              className="rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden transition-all shadow-sm"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
              <button
                onClick={() => toggleAccordion('lifespan')}
                className="w-full px-5 py-4 text-left flex justify-between items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
                <span className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                  <Clock size={15} className="text-amber-400 animate-pulse" />
                  <span>🕒 {language === 'tr' ? 'ORTALAMA YAŞAM SÜRESİ' : 'AVERAGE LIFESPAN'}</span>
                </span>
                {accordionState.lifespan ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionState.lifespan && (
                <div className="px-5 pb-5 pt-1 text-xs text-amber-400 font-mono font-black border-t border-white/5 animate-slide-down">
                  {language === 'tr' ? currentPlant.lifespanTr : currentPlant.lifespanEn}
                </div>
              )}
            </div>

            {/* 10) [ Biliyor Muydunuz? ] */}
            <div 
              className="rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden transition-all shadow-sm"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
              <button
                onClick={() => toggleAccordion('fact')}
                className="w-full px-5 py-4 text-left flex justify-between items-center transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
                <span className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                  <HelpCircle size={15} className="text-indigo-400" />
                  <span>💡 {language === 'tr' ? 'BİLİYOR MUYDUNUZ? (İLGİNÇ BİLGİLER)' : 'INTERESTING FACTS'}</span>
                </span>
                {accordionState.fact ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionState.fact && (
                <div className="px-5 pb-5 pt-1 text-xs text-indigo-300 leading-relaxed font-semibold italic border-t border-white/5 animate-slide-down bg-indigo-500/[0.02]">
                  “{language === 'tr' ? currentPlant.factTr : currentPlant.factEn}”
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 11) [ Günlük Görevler ] Daily Quests Card List */}
      <div 
        className={containerClass}
        style={!isLightTheme ? { backgroundColor: 'rgba(15, 23, 42, 0.6)' } : undefined}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-teal-400 flex items-center gap-1.5 font-sans">
            <Zap size={14} className="text-amber-400 animate-pulse" />
            {t.missionsTitle}
          </h3>

          {onGenerateNewMissions && (
            <button 
              onClick={onGenerateNewMissions}
              className="text-[9px] font-black text-teal-300 hover:text-teal-200 transition-all flex items-center gap-1 uppercase bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 rounded-full cursor-pointer border border-teal-500/20 font-sans"
            >
              <RefreshCw size={10} />
              {language === 'tr' ? 'GÜNLÜK GÖREVLERİ YENİLE' : 'REGENERATE MISSIONS'}
            </button>
          )}
        </div>
        
        <div className="space-y-2.5 mt-4">
          {missions.map((m) => (
            <div 
              key={m.id}
              className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all ${
                m.completed 
                  ? 'border-emerald-500/10 bg-emerald-500/5 shadow-inner' 
                  : isLightTheme 
                    ? 'border-slate-200 bg-slate-50' 
                    : 'border-white/5 bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 select-none">
                <span className="text-lg shrink-0">{m.completed ? '🟢' : '⚡'}</span>
                <div>
                  <span className={`text-xs font-bold block leading-snug ${m.completed ? 'line-through text-slate-500' : isLightTheme ? 'text-slate-800' : 'text-slate-200'}`}>
                    {TRANSLATIONS[language]?.[m.titleKey] || TRANSLATIONS['tr']?.[m.titleKey] || TRANSLATIONS['en']?.[m.titleKey] || m.titleKey}
                  </span>
                  <span className="text-[9px] font-black text-teal-400 block mt-0.5 font-sans">
                    {language === 'tr' ? `Milli Ödül: +${m.xpReward} Enerji (XP)` : `System Reward: +${m.xpReward} XP`}
                  </span>
                </div>
              </div>

              {/* Status Selector dropdown */}
              <div className="flex items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 border-white/5 pt-2 md:pt-0 shrink-0">
                <div className="text-left md:text-right font-sans">
                  <span className="text-[8px] font-black block uppercase tracking-wider mb-0.5 font-mono text-slate-500">
                    {language === 'tr' ? 'AKTARIM DURUMU' : 'TRANSFER STATE'}
                  </span>
                  <select
                    value={m.status || (m.completed ? 'completed' : 'not_started')}
                    onChange={(e) => onUpdateMissionStatus && onUpdateMissionStatus(m.id, e.target.value as any)}
                    className="bg-slate-900 border border-white/5 rounded-lg px-2 py-0.5 text-[9px] font-bold text-slate-200 bg-opacity-90 outline-none focus:border-teal-400 cursor-pointer shadow-sm"
                  >
                    <option value="not_started">{language === 'tr' ? 'Bekliyor' : 'Pending'}</option>
                    <option value="in_progress">{language === 'tr' ? 'Devam Ediyor' : 'Progressing'}</option>
                    <option value="completed">{language === 'tr' ? 'Tamamlandı' : 'Completed'}</option>
                  </select>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-black text-slate-400 block mb-1 font-mono">
                    {m.completed ? m.target : m.progress} / {m.target}
                  </span>
                  <div className={`w-16 h-1 rounded-full overflow-hidden ${isLightTheme ? 'bg-slate-200' : 'bg-slate-800'}`}>
                    <div 
                      className="h-full bg-teal-400 transition-all duration-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" 
                      style={{ width: `${m.completed ? 100 : Math.min(100, (m.progress / m.target) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
        </>
      )}

    </div>
  );
}
