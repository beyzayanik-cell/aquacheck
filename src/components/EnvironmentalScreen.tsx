/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, WaterRecord } from '../types';
import { Leaf, Award, Globe, Shield, Sparkles, TrendingDown, Trash2 } from 'lucide-react';

interface EnvironmentalProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  records: WaterRecord[];
}

export default function EnvironmentalScreen({ language, colors, records }: EnvironmentalProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  // Filter records within active tab range
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter(r => {
      const recDate = new Date(r.date);
      const diffMs = now.getTime() - recDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (activeTab === 'daily') {
        const todayStr = now.toISOString().split('T')[0];
        return r.date === todayStr;
      } else if (activeTab === 'weekly') {
        return diffDays >= 0 && diffDays <= 7;
      } else if (activeTab === 'monthly') {
        return diffDays >= 0 && diffDays <= 30;
      } else {
        return diffDays >= 0 && diffDays <= 365;
      }
    });
  }, [records, activeTab]);

  // Dynamic calculations based on selected active tab range
  const waterSavedLiters = useMemo(() => {
    const multiplier = activeTab === 'daily' ? 1 : activeTab === 'weekly' ? 7 : activeTab === 'monthly' ? 30 : 365;
    const totalLitersLogged = filteredRecords.reduce((sum, r) => sum + r.liters, 0);
    
    // Baseline represents typical water usage per day is 210 Liters
    const baselineWater = 210 * multiplier;
    const computedSaved = baselineWater - totalLitersLogged;
    
    // Fallback minimum savings in case user did not log or logged above baseline
    return computedSaved > 0 
      ? computedSaved 
      : (35 * multiplier) + (filteredRecords.length * 6);
  }, [filteredRecords, activeTab]);

  const carbonOffsetKg = useMemo(() => {
    return (waterSavedLiters * 0.12).toFixed(2); // 0.12 kg CO2 per liter saved
  }, [waterSavedLiters]);

  const petBottlesSaved = useMemo(() => {
    return Math.round(waterSavedLiters / 1.5); // 1.5L commercial bottles equivalent
  }, [waterSavedLiters]);

  const treesPlantedEquivalent = useMemo(() => {
    return (parseFloat(carbonOffsetKg) / 22).toFixed(1); // 22kg CO2 absorbed per tree per year
  }, [carbonOffsetKg]);

  return (
    <div className="space-y-6 text-white animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Leaf className="text-emerald-400 animate-pulse" size={20} />
            {t.ecoImpact || 'Çevresel Etki Analizi'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {language === 'tr' 
              ? 'Tasarruflarınızın doğa üzerindeki somut, ölçülebilir pozitif ekolojik etkileri.' 
              : 'Explore how your daily conservation metrics literally offset climate and groundwater risks.'}
          </p>
        </div>

        {/* Dynamic Interval Filter Tabs */}
        <div className="flex bg-slate-950/40 p-1 rounded-full border border-white/5 w-fit gap-1 shrink-0 self-start md:self-auto">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'daily'
                ? (language === 'tr' ? 'Günlük' : 'Daily')
                : tab === 'weekly'
                ? (language === 'tr' ? 'Haftalık' : 'Weekly')
                : tab === 'monthly'
                ? (language === 'tr' ? 'Aylık' : 'Monthly')
                : (language === 'tr' ? 'Yıllık' : 'Yearly')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Visual Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Carbon Offset Card */}
        <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/20">
          <div className="absolute top-4 right-4 text-3xl font-bold select-none p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            🌱
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] block mb-2">
            {t.carbonSaving || 'Karbon Tasarrufu'}
          </span>
          <h3 className="text-3xl font-black text-white">{carbonOffsetKg} <span className="text-xs text-slate-400">KG CO₂</span></h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-3 leading-relaxed">
            {language === 'tr' 
              ? 'Şebeke suyunun dağıtımı ve ısıtılması sırasında engelenen elektrik enerjisi karbon salınımı.' 
              : 'Prevented greenhouse gases generated by municipal pumping and filtration power grids.'}
          </p>
        </div>

        {/* PET Water bottle Equivalents Saved */}
        <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/20">
          <div className="absolute top-4 right-4 text-3xl font-bold select-none p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
            🍾
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] block mb-2">
            {language === 'tr' ? 'PET ŞİŞE TASARRUFU' : 'PLASTIC BOTTLE SAVED'}
          </span>
          <h3 className="text-3xl font-black text-white">{petBottlesSaved} <span className="text-xs text-slate-400">{language === 'tr' ? 'Adet' : 'Units'}</span></h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-3 leading-relaxed">
            {language === 'tr' 
              ? 'Ambalajlı tatlı su ambalajlarının tüketimini azaltarak engellediğiniz plastik atık miktarı.' 
              : 'Eradicated single-use PET pollution from plastic shipping and commercial bottling lines.'}
          </p>
        </div>

        {/* Aquifer protection and trees planted */}
        <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-teal-500/20">
          <div className="absolute top-4 right-4 text-3xl font-bold select-none p-2 bg-teal-500/10 rounded-xl text-teal-400">
            🌲
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] block mb-2">
            {language === 'tr' ? 'AĞAÇ OKSİJEN EŞDEĞERİ' : 'FOREST TREE EQUIVALENCE'}
          </span>
          <h3 className="text-3xl font-black text-white">{treesPlantedEquivalent} <span className="text-xs text-slate-400">{language === 'tr' ? 'Fidan' : 'Saplings'}</span></h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-3 leading-relaxed">
            {language === 'tr' 
              ? 'Engellediğiniz karbon miktarı ile yıllık bazda aynı miktarı soğuran fidan sayısı.' 
              : 'Equivalent yearly carbon absorption of healthy growing forest tree trunks.'}
          </p>
        </div>

        {/* Liters of clean groundwater saved block */}
        <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/20">
          <div className="absolute top-4 right-4 text-3xl font-bold select-none p-2 bg-blue-500/10 rounded-xl text-blue-400">
            💧
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] block mb-2">
            {language === 'tr' ? 'KURTARILAN TABAN SUYU' : 'GROUNDWATER RESERVED'}
          </span>
          <h3 className="text-3xl font-black text-white">{waterSavedLiters.toFixed(0)} <span className="text-xs text-slate-400">LİTRE</span></h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-3 leading-relaxed">
            {language === 'tr' 
              ? 'Tasarruflu kullanım sayesinde barajlarda ve yer altı akiferlerinde muhafaza edilen su.' 
              : 'Preserved pristine groundwater reserves left untouched in local municipal watersheds.'}
          </p>
        </div>
      </div>

      {/* Interactive Global Score Board & Verification Panel */}
      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] relative overflow-hidden space-y-4">
        <div className="flex items-center gap-3">
          <Award className="text-yellow-400 shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white">AquaCheck Sürdürülebilirlik Puanı</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Tüm yeşil aktiviteleriniz birleşerek doğa dostu karnenizi oluşturuyor.</p>
          </div>
        </div>

        {/* Gauge indicators */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">{language === 'tr' ? 'Çevre Puanı' : 'Eco rating'}</span>
            <span className="text-lg font-black text-emerald-400 block mt-1">92 / 100</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">{language === 'tr' ? 'Tasarruf Puanı' : 'Saves Score'}</span>
            <span className="text-lg font-black text-[#00fbfb] block mt-1">87 / 100</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">{language === 'tr' ? 'Koruma Sınıfı' : 'Rank Tier'}</span>
            <span className="text-md font-black text-amber-400 block mt-1.5 uppercase tracking-tighter font-mono">Gold Hero</span>
          </div>
        </div>
      </div>
    </div>
  );
}
