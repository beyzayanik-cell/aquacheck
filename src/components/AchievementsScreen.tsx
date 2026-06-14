import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, Badge, Mission } from '../types';
import { Trophy, Star, Sparkles, ShieldAlert, Award, Lock, CheckCircle2 } from 'lucide-react';

interface AchievementsProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  badges: Badge[];
  missions: Mission[];
  plantState: any;
  onClaimBadgeXp?: (xpReward: number) => void;
}

export default function AchievementsScreen({ 
  language, 
  colors, 
  badges, 
  missions, 
  plantState,
  onClaimBadgeXp 
}: AchievementsProps) {
  const t = TRANSLATIONS[language];
  const [claimedId, setClaimedId] = useState<Record<string, boolean>>({});

  // Achievements database
  const targetsList = [
    { id: 'save_100', icon: '💎', titleTr: 'Tasarruf Ustası', titleEn: 'Save Specialist', descTr: 'İlk 100 litre su tasarrufunu başarıyla tamamla.', descEn: 'Accomplish your first 100 liters of water savings.', targetVal: 100, currentVal: 100, xp: 300, claimed: false },
    { id: 'streak_7', icon: '🔥', titleTr: 'Yedi Gün Serisi', titleEn: 'Weekly Streak Fanatic', descTr: '7 gün boyunca su giriş kaydı oluştur.', descEn: 'Create consecutive water entry logs for 7 full days.', targetVal: 7, currentVal: 5, xp: 500, claimed: false },
    { id: 'custom_cat_add', icon: '🎨', titleTr: 'Kendi Kategorini Belirle', titleEn: 'Creative Ranger', descTr: 'Uygulamaya kendi özel su kategorini ekle.', descEn: 'Define a custom water logging category under settings.', targetVal: 1, currentVal: 1, xp: 200, claimed: false },
    { id: 'eco_rank_90', icon: '🏆', titleTr: 'Ekoloji Elçisi', titleEn: 'Eco Ambassador', descTr: 'Çevre puanını 90 üzerine ulaştır.', descEn: 'Push your environmental eco ranking index above 90.', targetVal: 90, currentVal: 92, xp: 400, claimed: false }
  ];

  const handleClaim = (achId: string, xpReward: number) => {
    if (claimedId[achId]) return;
    setClaimedId(prev => ({ ...prev, [achId]: true }));
    if (onClaimBadgeXp) {
      onClaimBadgeXp(xpReward);
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Trophy className="text-amber-400 animate-bounce" size={20} />
          {language === 'tr' ? 'Başarımlar ve Rozetler' : 'Achievements & Badges locker'}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          {language === 'tr' 
            ? 'Su tasarrufları ve günlük sürdürülebilirlik görevleri ile topladığınız nişanlar.' 
            : 'Unlocking milestones and claiming grand XP rewards to level up your virtual ancient tree.'}
        </p>
      </div>

      {/* Main Badges Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] px-1 flex items-center gap-1.5">
          <Award size={12} />
          {t.badgesTitle || 'Kazanılan Rozetler'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 relative overflow-hidden ${
                  isUnlocked 
                    ? 'border-amber-400/20 bg-amber-400/5 shadow-[0_4px_12px_rgba(245,158,11,0.05)]' 
                    : 'border-white/5 bg-white/[0.01] opacity-40'
                }`}
              >
                {/* Lock icon overlay */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-slate-500">
                    <Lock size={12} />
                  </div>
                )}
                
                <span className="text-4xl select-none">{badge.icon}</span>
                <span className="text-xs font-black text-white block">
                  {t[badge.titleKey] || badge.titleKey}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block">
                  {isUnlocked ? t.unlocked : t.locked}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Milestones Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-1 flex items-center gap-1.5">
          <Star size={12} />
          {language === 'tr' ? 'KİLİT HEDEFLER & ÖDÜLLER' : 'MILESTONES & LEVEL-UP CHESTS'}
        </h3>

        <div className="space-y-3">
          {targetsList.map((ach) => {
            const isFinished = ach.currentVal >= ach.targetVal;
            const isClaimed = claimedId[ach.id];
            
            return (
              <div 
                key={ach.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isClaimed 
                    ? 'border-white/5 bg-white/[0.01] opacity-60' 
                    : isFinished 
                      ? 'border-emerald-500/20 bg-emerald-500/5 shadow-[0_4px_15px_rgba(16,185,129,0.05)]' 
                      : 'border-white/5 bg-white/[0.01]'
                }`}
              >
                <div className="flex gap-3.5 items-center">
                  <span className="text-3xl p-2 bg-black/25 rounded-xl block shrink-0">{ach.icon}</span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">
                      {language === 'tr' ? ach.titleTr : ach.titleEn}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                      {language === 'tr' ? ach.descTr : ach.descEn}
                    </p>
                    <span className="text-[9px] font-black text-cyan-400 block mt-1">
                      ÖDÜL: +{ach.xp} XP
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-white/5 pt-2.5 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] font-black text-slate-400 block">
                      {ach.currentVal} / {ach.targetVal}
                    </span>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden mt-1 block">
                      <div 
                        className="h-full bg-cyan-400 rounded-full" 
                        style={{ width: `${Math.min(100, (ach.currentVal / ach.targetVal) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  {isClaimed ? (
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-slate-500" />
                      ALINDI
                    </span>
                  ) : isFinished ? (
                    <button
                      onClick={() => handleClaim(ach.id, ach.xp)}
                      className="px-3.5 py-1.5 bg-[#00fbfb] hover:bg-cyan-400 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-cyan-400/25 shrink-0"
                    >
                      ÖDÜLÜ AL
                    </button>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-white/5 border border-white/5 text-slate-500 font-black text-[9px] rounded-full uppercase tracking-widest shrink-0">
                      ÖDÜL KİLİTLİ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
