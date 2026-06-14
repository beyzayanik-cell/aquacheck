/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption } from '../types';
import { Sparkles, Check, Crown, ShieldAlert } from 'lucide-react';

interface PremiumScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
}

export default function PremiumScreen({ language, colors }: PremiumScreenProps) {
  const t = TRANSLATIONS[language];
  const [success, setSuccess] = useState(false);

  const triggerUpgrade = () => {
    setSuccess(true);
  };

  const premiumFeatures = language === 'tr' ? [
    'Sınırsız Yapay Zeka Sohbet Sürdürülebilirlik Koçu',
    'Aylık Çevresel Etki ve Su Ayak İzi PDF Raporları',
    'Okyanus ve Turkuaz gibi 9 Premium Uygulama Teması',
    'Gelişmiş Makine Öğrenimi Su Kullanım Tahmin Motoru',
    'Aile Grubu Liderlik İstatistiği ve Paylaşım'
  ] : [
    'Unlimited AI Sustainability Chat Coaching sessions',
    'Monthly Environmental Impact PDF and Data reports',
    'Full access to all 9 custom Hydro-Elegance themes',
    'Advanced Machine Learning consumption forecasting system',
    'Integrated Family Leaderboards and shared dashboards'
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 max-w-md mx-auto animate-fade-in relative">
      {success ? (
        // Premium success result card
        <div 
          className="text-center p-8 rounded-[2rem] border backdrop-blur-2xl w-full"
          style={{ 
            backgroundColor: colors.cardBg, 
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-6 scale-110 animate-pulse">
            <Crown size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">AquaCheck Premium Aktif!</h2>
          <p className="text-sm mt-3 leading-relaxed text-slate-300 font-semibold">
            {language === 'tr' 
              ? 'Tebrikler! Sınırsız sürdürülebilirlik takibi ve gelişmiş koçluk özelliklerinin kilidi açıldı.' 
              : 'Congratulations! Unlimited sustainability tracking features and advanced parameters unlocked.'}
          </p>
        </div>
      ) : (
        // Upgrade Checkout card
        <div 
          className="w-full p-8 rounded-[2.5rem] border backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between"
          style={{ 
            backgroundColor: colors.cardBg, 
            borderColor: 'rgba(255,255,255,0.06)'
          }}
        >
          {/* Subtle top edge orange/gold lighting */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {/* Heading */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
              <Crown size={24} />
            </div>
            <h2 className="text-2xl font-black text-white">{t.premiumTitle}</h2>
            <p className="text-xs font-semibold text-slate-400">
              {t.premiumDesc}
            </p>
          </div>

          {/* Features check list */}
          <div className="space-y-4 mb-8">
            {premiumFeatures.map((feat, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-normal">
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* Checkout billing details and CTA Button */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abonelik Bedeli</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">₺39</span>
                <span className="text-xs font-bold text-slate-400">/ ay</span>
              </div>
            </div>

            <button
              onClick={triggerUpgrade}
              className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-900 shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer scale-100 active:scale-95"
            >
              <Sparkles size={16} />
              {t.upgradePremium}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
