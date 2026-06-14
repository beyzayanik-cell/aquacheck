/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, WaterRecord } from '../types';
import { Search, Trash2, Calendar, Clock, Filter, GlassWater } from 'lucide-react';

interface HistoryScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  records: WaterRecord[];
  onDeleteRecord: (id: string) => void;
}

const CATEGORY_MAP: Record<string, { icon: string; key: string }> = {
  shower: { icon: '🚿', key: 'categoryShower' },
  laundry: { icon: '🧺', key: 'categoryLaundry' },
  dish: { icon: '🍽️', key: 'categoryDish' },
  garden: { icon: '🏡', key: 'categoryGarden' },
  kitchen: { icon: '🍳', key: 'categoryKitchen' },
  toilet: { icon: '🚽', key: 'categoryToilet' },
  pet: { icon: '🐾', key: 'categoryPet' },
  carwash: { icon: '🚗', key: 'categoryCarWash' },
  pool: { icon: '🏊', key: 'categoryPool' },
  cleaning: { icon: '🧹', key: 'categoryCleaning' },
  irrigation: { icon: '🌾', key: 'categoryIrrigation' },
  other: { icon: '❔', key: 'categoryOther' }
};

export default function HistoryScreen({ language, colors, records, onDeleteRecord }: HistoryScreenProps) {
  const t = TRANSLATIONS[language];

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter records
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      (r.note && r.note.toLowerCase().includes(search.toLowerCase())) ||
      (t[CATEGORY_MAP[r.category]?.key] || r.category).toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || r.category === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white">{t.history}</h2>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          Geçmiş tüketimlerinizi detaylı inceleyin, arama yapın veya filtreleyin.
        </p>
      </div>

      {/* Control Tools: Search & Filter bar combo */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm text-white transition-all placeholder-slate-500"
            placeholder={t.searchPlaceholder}
          />
        </div>

        {/* Filter Selection */}
        <div className="relative w-full sm:w-auto shrink-0">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Filter size={16} />
          </span>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full sm:w-48 bg-white/[0.03] border border-white/10 text-slate-200 text-xs font-semibold rounded-full h-11 pl-10 pr-4 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">{t.filterAll}</option>
            {Object.keys(CATEGORY_MAP).map(key => (
              <option key={key} value={key} className="bg-slate-900 text-white">
                {CATEGORY_MAP[key].icon} {t[CATEGORY_MAP[key].key] || key}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Consumption Table List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-white/5 bg-white/[0.02]">
            <span className="text-4xl block mb-2 opacity-40">📝</span>
            <p className="text-sm font-semibold text-slate-400">
              {t.noRecords}
            </p>
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const catInfo = CATEGORY_MAP[rec.category] || { icon: '❓', key: 'categoryOther' };
            return (
              <div 
                key={rec.id}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                    <span className="text-xl select-none">{catInfo.icon}</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-white">
                      {t[catInfo.key] || rec.category}
                    </span>
                    <div className="flex gap-2 items-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Calendar size={10} /> {rec.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} /> {rec.time}
                      </span>
                    </div>
                    {rec.note && (
                      <p className="text-xs text-slate-300 font-medium italic mt-1.5 border-l-2 border-cyan-500/30 pl-2">
                        "{rec.note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-cyan-300 tracking-tight">
                    {rec.liters} L
                  </span>
                  
                  {/* Delete button option */}
                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="w-8 h-8 rounded-full bg-red-400/10 hover:bg-red-400/20 text-red-400 flex items-center justify-center border border-red-400/20 hover:border-red-400/40 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
