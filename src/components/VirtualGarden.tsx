import React, { useState, useEffect } from 'react';
import { Sprout, Lock, Droplet, Plus, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GardenPlant {
  slotId: string;
  sectorId: string;
  plantId: string;
  name: string;
  icon: string;
  growth: number; // 0 - 100
  lastWatered: string;
}

interface VirtualGardenProps {
  language: 'tr' | 'en' | any;
  colors: any;
  userLevel: number;
  totalSavings: number;
  onAwardXp: (xp: number, reasonTr: string, reasonEn: string) => void;
  onShowAlert: (msg: string) => void;
}

const SECTORS = [
  { id: 'flowers', nameTr: '🌹 Çiçek Bahçesi', nameEn: '🌹 Rose & Flower Bed', minLvl: 1 },
  { id: 'forest', nameTr: '🌲 Orman Bölgesi', nameEn: '🌲 Forest Woodland', minLvl: 5 },
  { id: 'fruits', nameTr: '🍎 Meyve Bahçesi', nameEn: '🍎 Fruit Orchard', minLvl: 10 },
  { id: 'herbs', nameTr: '🌿 Şifalı Bitkiler', nameEn: '🌿 Medicinal Herbs', minLvl: 20 },
];

const SECTOR_PLANTS: Record<string, { id: string; nameTr: string; nameEn: string; icon: string }[]> = {
  flowers: [
    { id: 'gul', nameTr: 'Kırmızı Gül', nameEn: 'Crimson Rose', icon: '🌹' },
    { id: 'papatya', nameTr: 'Narin Papatya', nameEn: 'Golden Daisy', icon: '🌼' },
    { id: 'lale', nameTr: 'İstanbul Lalesi', nameEn: 'Tulip', icon: '🌷' },
    { id: 'ortanca', nameTr: 'Mavi Ortanca', nameEn: 'Hydrangea', icon: '🌸' },
    { id: 'lavanta', nameTr: 'Tıbbi Lavanta', nameEn: 'Lavender', icon: '🪻' }
  ],
  forest: [
    { id: 'cam', nameTr: 'Kızılçam', nameEn: 'Red Pine', icon: '🌲' },
    { id: 'mese', nameTr: 'Ulu Meşe', nameEn: 'Anatolian Oak', icon: '🌳' },
    { id: 'cinar', nameTr: 'Anıt Çınar', nameEn: 'Plane Tree', icon: '🍀' },
    { id: 'sedir', nameTr: 'Toros Sediri', nameEn: 'Cedar', icon: '🌴' }
  ],
  fruits: [
    { id: 'elma', nameTr: 'Amasya Elması', nameEn: 'Apple Tree', icon: '🍎' },
    { id: 'portakal', nameTr: 'Finike Portakalı', nameEn: 'Orange', icon: '🍊' },
    { id: 'limon', nameTr: 'Yatak Limonu', nameEn: 'Lemon', icon: '🍋' },
    { id: 'kiraz', nameTr: 'Napolyon Kirazı', nameEn: 'Cherry', icon: '🍒' }
  ],
  herbs: [
    { id: 'nane', nameTr: 'Taze Nane', nameEn: 'Peppermint', icon: '🌿' },
    { id: 'kekik', nameTr: 'Dağ Kekiği', nameEn: 'Thyme', icon: '🌿' },
    { id: 'feslegen', nameTr: 'Fesleğen', nameEn: 'Sweet Basil', icon: '🌱' },
    { id: 'aloevera', nameTr: 'Aloe Vera', nameEn: 'Aloe Vera', icon: '🌵' }
  ]
};

export default function VirtualGarden({
  language,
  colors,
  userLevel,
  totalSavings,
  onAwardXp,
  onShowAlert
}: VirtualGardenProps) {
  
  const [activeSectorId, setActiveSectorId] = useState('flowers');
  const [myPlants, setMyPlants] = useState<GardenPlant[]>(() => {
    const saved = localStorage.getItem('aquacheck_garden_plants_v2');
    if (saved) return JSON.parse(saved);
    // Default starter plant in Slot 1
    return [
      { slotId: 'flowers_1', sectorId: 'flowers', plantId: 'gul', name: 'Kırmızı Gül', icon: '🌹', growth: 35, lastWatered: 'Bugün' }
    ];
  });

  const [unlockedSlots, setUnlockedSlots] = useState<string[]>(() => {
    const saved = localStorage.getItem('aquacheck_garden_unlocked_slots');
    return saved ? JSON.parse(saved) : ['flowers_1', 'flowers_2', 'forest_1', 'fruits_1', 'herbs_1'];
  });

  const [plantingSlotId, setPlantingSlotId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('aquacheck_garden_plants_v2', JSON.stringify(myPlants));
  }, [myPlants]);

  useEffect(() => {
    localStorage.setItem('aquacheck_garden_unlocked_slots', JSON.stringify(unlockedSlots));
  }, [unlockedSlots]);

  const activeSector = SECTORS.find(s => s.id === activeSectorId) || SECTORS[0];
  const isSectorLocked = userLevel < activeSector.minLvl;

  // Handles watering a singular garden plant
  const handleWaterPlant = (slotId: string) => {
    setMyPlants(prev => prev.map(p => {
      if (p.slotId === slotId) {
        if (p.growth >= 100) {
          onShowAlert(language === 'tr' ? '✨ Bu bitki zaten tam gelişim seviyesine ulaştı!' : '✨ This plant is already fully grown!');
          return p;
        }

        const newGrowth = Math.min(100, p.growth + 20);
        
        if (newGrowth === 100) {
          // Gained 5 plant levels and finished growing
          onAwardXp(500, `Hasat Edildi: Canlı ${p.name} yetiştirildi!`, `Harvested: ${p.name} fully grown!`);
          onShowAlert(language === 'tr' ? `🏆 Tebrikler! ${p.name} tam olgunluğa ulaştı, +500 XP kazandınız!` : `🏆 Congrats! ${p.name} fully grown, you earned +500 XP!`);
        } else {
          onAwardXp(150, `${p.name} Sulandı (Gelişim: %${newGrowth})`, `Watered ${p.name} (Growth: ${newGrowth}%)`);
        }

        return {
          ...p,
          growth: newGrowth,
          lastWatered: new Date().toLocaleTimeString().slice(0, 5)
        };
      }
      return p;
    }));
  };

  // Handles adding/planting a new vegetable or flower
  const handlePlantSelect = (plant: typeof SECTOR_PLANTS[string][0]) => {
    if (!plantingSlotId) return;

    const newPlant: GardenPlant = {
      slotId: plantingSlotId,
      sectorId: activeSectorId,
      plantId: plant.id,
      name: language === 'tr' ? plant.nameTr : plant.nameEn,
      icon: plant.icon,
      growth: 10, // Starts as seed
      lastWatered: 'Şimdi'
    };

    setMyPlants(prev => [...prev.filter(p => p.slotId !== plantingSlotId), newPlant]);
    setPlantingSlotId(null);
    onAwardXp(200, `Yeni Tohum Ekildi: ${newPlant.name}`, `Planted new seed: ${newPlant.name}`);
    onShowAlert(language === 'tr' ? `🌱 ${newPlant.name} tohumu başarıyla saksıya dikildi!` : `🌱 ${newPlant.name} seed planted successfully!`);
  };

  // Handles unlocking empty slots with user Level or Savings
  const handleUnlockSlot = (slotKey: string, cost: number) => {
    if (totalSavings < cost) {
      onShowAlert(language === 'tr' ? `🚨 Yetersiz tasarruf puanı. ${cost} litre su tasarrufu gerekiyor.` : `🚨 Insufficient saving score. Needs ${cost}L water savings.`);
      return;
    }
    
    setUnlockedSlots(prev => [...prev, slotKey]);
    onShowAlert(language === 'tr' ? '🔓 Yeni bitki dikim alanı başarıyla açıldı!' : '🔓 New planting slot unlocked!');
  };

  return (
    <div className="space-y-6">
      
      {/* Garden sectors tab togglers */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SECTORS.map(sec => {
          const isSecUnl = userLevel >= sec.minLvl;
          const isActSec = activeSectorId === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSectorId(sec.id)}
              className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border cursor-pointer transition-all flex items-center gap-1.5 ${
                isActSec 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span>{language === 'tr' ? sec.nameTr : sec.nameEn}</span>
              {!isSecUnl && <Lock size={10} className="text-amber-500" />}
            </button>
          );
        })}
      </div>

      {/* Main Sandbox Box */}
      <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md relative overflow-hidden">
        
        {isSectorLocked ? (
          /* Locked State visual */
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Lock size={28} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">BU GÖREVLENDİRME BÖLGESİ KİLİTLİ</h4>
              <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto leading-relaxed">
                {language === 'tr' 
                  ? `${activeSector.nameTr} bölgesini açmak için Seviye ${activeSector.minLvl} olmalısınız.` 
                  : `Reach Level ${activeSector.minLvl} to unlock ${activeSector.nameEn} area.`}
              </p>
              <span className="text-[10px] font-black block mt-2 text-amber-500">
                MEVCUT SEVİYENİZ: {userLevel}
              </span>
            </div>
          </div>
        ) : (
          /* Unlocked and active garden slots rendering */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sprout size={12} />
                {language === 'tr' ? `${activeSector.nameTr} Saksı Alanları` : `${activeSector.nameEn} Available Pots`}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {language === 'tr' ? 'Can Suyu Vermek İçin Tıklayın' : 'Click to hydrate your ecosystem'}
              </span>
            </div>

            {/* Render 3 slots per section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(slotNum => {
                const slotKey = `${activeSectorId}_${slotNum}`;
                const isUnlocked = unlockedSlots.includes(slotKey);
                const activePlant = myPlants.find(p => p.slotId === slotKey);

                return (
                  <div 
                    key={slotKey}
                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                      !isUnlocked 
                        ? 'border-dashed border-white/5 bg-white/[0.01] flex flex-col justify-center items-center text-center py-8' 
                        : 'border-white/5 bg-black/20 hover:border-white/10'
                    }`}
                  >
                    {!isUnlocked ? (
                      /* Slot Locked view */
                      <div className="space-y-3">
                        <Lock size={16} className="text-slate-600 block mx-auto" />
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Saksı Kilitli</span>
                          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">500 Litre Tasarrufla Aç</span>
                        </div>
                        <button
                          onClick={() => handleUnlockSlot(slotKey, 500)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black text-white cursor-pointer transition-all"
                        >
                          AÇ (500L)
                        </button>
                      </div>
                    ) : activePlant ? (
                      /* Planted state */
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-4xl block select-none bg-black/30 w-12 h-12 rounded-xl flex items-center justify-center">{activePlant.icon}</span>
                          <div className="text-right">
                            <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase font-mono block">
                              {activePlant.growth >= 100 ? 'OLGUN' : `BÜYÜME: %${activePlant.growth}`}
                            </span>
                            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5 font-mono">
                              {language === 'tr' ? 'Evre: ' : 'Stage: '} 
                              {activePlant.growth <= 20 ? '🌱 Tohum' : activePlant.growth <= 50 ? '🌿 Filiz' : activePlant.growth <= 80 ? '🎋 Fide' : '🌹 Çiçekli'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-white leading-tight">{activePlant.name}</h4>
                          <span className="text-[8.5px] font-semibold text-slate-500 block mt-0.5">Son sulama: {activePlant.lastWatered}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-black/35 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${activePlant.growth}%` }} 
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleWaterPlant(activePlant.slotId)}
                            className="flex-1 h-9 rounded-xl bg-cyan-500/10 border border-cyan-405/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-black text-[9.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Droplet size={11} />
                            <span>{language === 'tr' ? 'CAN SUYU' : 'HYDRATE'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Empty planting slot visual */
                      <div className="py-6 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mx-auto text-slate-500">
                          <Plus size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-300 block uppercase">BOŞ SAKSI</span>
                          <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Yeni sürdürülebilirlik fidesi dikin</span>
                        </div>
                        <button
                          onClick={() => setPlantingSlotId(slotKey)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider cursor-pointer shadow-md transition-all"
                        >
                          Tohum Ek
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal selector to plant seeds */}
      <AnimatePresence>
        {plantingSlotId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 text-white space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Sprout size={12} className="text-emerald-400" />
                  {language === 'tr' ? 'Ekilecek Tohumu Seçin' : 'Select a Seed Variety'}
                </h4>
                <button 
                  onClick={() => setPlantingSlotId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Ok
                </button>
              </div>

              <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                {SECTOR_PLANTS[activeSectorId]?.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePlantSelect(p)}
                    className="w-full p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-[11px] font-black">{language === 'tr' ? p.nameTr : p.nameEn}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
