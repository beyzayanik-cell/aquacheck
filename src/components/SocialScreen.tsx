/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, Friend } from '../types';
import { Trophy, UserPlus, Share2, Plus, Users, Search, Sparkles, Sliders, Calendar, CalendarDays, Compass, HelpCircle } from 'lucide-react';

interface SocialScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  friends: Friend[];
  onAddFriend: (name: string) => void;
}

// Initial leaderboard contestants with realistic stats
const BASE_CONTESTANTS = [
  { id: '1', name: 'Beyza Yanık', isMe: true, weeklySavings: 1420, monthlySavings: 4500, yearlySavings: 54000, completedMissions: 24, gardenPlants: 12, xp: 8550 },
  { id: '2', name: 'Ahmet Şahin', isMe: false, weeklySavings: 1350, monthlySavings: 3900, yearlySavings: 48000, completedMissions: 18, gardenPlants: 8, xp: 6200 },
  { id: '3', name: 'Zeynep Kaya', isMe: false, weeklySavings: 1520, monthlySavings: 4905, yearlySavings: 62000, completedMissions: 31, gardenPlants: 15, xp: 12400 },
  { id: '4', name: 'Mehmet Demir', isMe: false, weeklySavings: 980, monthlySavings: 3100, yearlySavings: 37000, completedMissions: 14, gardenPlants: 5, xp: 3950 },
  { id: '5', name: 'Elif Yılmaz', isMe: false, weeklySavings: 1200, monthlySavings: 4100, yearlySavings: 49500, completedMissions: 22, gardenPlants: 10, xp: 7800 },
  { id: '6', name: 'Can Özkan', isMe: false, weeklySavings: 1650, monthlySavings: 5200, yearlySavings: 69000, completedMissions: 35, gardenPlants: 19, xp: 16100 },
  { id: '7', name: 'Deniz Arslan', isMe: false, weeklySavings: 1100, monthlySavings: 3600, yearlySavings: 42000, completedMissions: 15, gardenPlants: 7, xp: 4800 },
  { id: '8', name: 'Selin Öztürk', isMe: false, weeklySavings: 1470, monthlySavings: 4600, yearlySavings: 56000, completedMissions: 27, gardenPlants: 13, xp: 9500 }
];

export default function SocialScreen({ 
  language, 
  colors, 
  friends, 
  onAddFriend 
}: SocialScreenProps) {
  
  const t = TRANSLATIONS[language];
  const [newFriendName, setNewFriendName] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  
  // Selection Tabs state
  const [activeDuration, setActiveDuration] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [activeCategory, setActiveCategory] = useState<'savings' | 'missions' | 'garden' | 'xp'>('savings');

  // Unified leaderboard list backed by React state
  const [contestants, setContestants] = useState(BASE_CONTESTANTS);

  // Confirmation and edit modals state
  const [activeModal, setActiveModal] = useState<{
    type: 'delete' | 'edit' | 'reset' | 'bulkDelete' | null;
    contestantId?: string;
  }>({ type: null });

  const [editName, setEditName] = useState('');
  const [editWeekly, setEditWeekly] = useState(0);

  const handleDeleteContestant = (id: string) => {
    setContestants(prev => prev.filter(c => c.id !== id));
    setActiveModal({ type: null });
  };

  const handleEditContestant = (id: string, name: string, weekly: number) => {
    setContestants(prev => prev.map(c => {
      if (c.id === id) {
        // adjust proportional factors too for other dimensions
        return {
          ...c,
          name,
          weeklySavings: weekly,
          monthlySavings: Math.round(weekly * 3.1),
          yearlySavings: Math.round(weekly * 37.5)
        };
      }
      return c;
    }));
    setActiveModal({ type: null });
  };

  const handleResetUsage = (id: string) => {
    setContestants(prev => prev.map(c => c.id === id ? { ...c, weeklySavings: 0, monthlySavings: 0, yearlySavings: 0, completedMissions: 0, xp: 100 } : c));
    setActiveModal({ type: null });
  };

  const handleBulkDelete = () => {
    // Keep only contestants marked as isMe
    setContestants(prev => prev.filter(c => c.isMe));
    setActiveModal({ type: null });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    // Generate random realistic stats for the added friend
    const newContestant = {
      id: Math.random().toString(),
      name: newFriendName.trim(),
      isMe: false,
      weeklySavings: Math.floor(Math.random() * 800) + 800,
      monthlySavings: Math.floor(Math.random() * 2000) + 3000,
      yearlySavings: Math.floor(Math.random() * 20000) + 35000,
      completedMissions: Math.floor(Math.random() * 20) + 10,
      gardenPlants: Math.floor(Math.random() * 10) + 4,
      xp: Math.floor(Math.random() * 9000) + 4000
    };

    setContestants(prev => [...prev, newContestant]);
    onAddFriend(newFriendName.trim());
    setNewFriendName('');
  };

  const triggerSocialShare = () => {
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
    }, 1500);
  };

  // Sort and filter contestants based on selection metrics
  const processedLeaderboard = useMemo(() => {
    const list = [...contestants];

    // 1. Sort based on activeCategory
    list.sort((a, b) => {
      if (activeCategory === 'savings') {
        if (activeDuration === 'weekly') return b.weeklySavings - a.weeklySavings;
        if (activeDuration === 'monthly') return b.monthlySavings - a.monthlySavings;
        return b.yearlySavings - a.yearlySavings;
      }
      if (activeCategory === 'missions') return b.completedMissions - a.completedMissions;
      if (activeCategory === 'garden') return b.gardenPlants - a.gardenPlants;
      return b.xp - a.xp;
    });

    // 2. Filter based on Search Query
    return list.filter(c => c.name.toLowerCase().includes(leaderboardSearch.toLowerCase()));
  }, [contestants, activeDuration, activeCategory, leaderboardSearch]);

  const getMetricLabelAndValue = (user: typeof BASE_CONTESTANTS[0]) => {
    if (activeCategory === 'savings') {
      if (activeDuration === 'weekly') return `${user.weeklySavings} Litre`;
      if (activeDuration === 'monthly') return `${user.monthlySavings} Litre`;
      return `${user.yearlySavings} Litre`;
    }
    if (activeCategory === 'missions') {
      return language === 'tr' ? `${user.completedMissions} Görev` : `${user.completedMissions} Missions`;
    }
    if (activeCategory === 'garden') {
      return language === 'tr' ? `${user.gardenPlants} Bitki` : `${user.gardenPlants} Plants`;
    }
    return `${user.xp} XP`;
  };

  return (
    <div className="space-y-6 text-white animate-fade-in relative pb-12">
      
      {/* Share feedback toast notification */}
      {shareSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full bg-cyan-500 text-[#030712] font-black shadow-lg animate-bounce flex items-center gap-2 text-[10.5px] uppercase tracking-wider">
          <Sparkles size={14} />
          {language === 'tr' ? 'BAŞARI GRAFİĞİNİZ KOPYALANDI!' : 'SUCCESS STATS COPIED TO CLIPBOARD!'}
        </div>
      )}

      {/* Title */}
      <div>
        <span className="text-[10px] font-black tracking-widest text-[#00fbfb] uppercase bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
          🏅 {language === 'tr' ? 'SÜRDÜRÜLEBİLİRLİK SAKİNLERİ' : 'LEADERBOARD SOCIAL PLATFORM'}
        </span>
        <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight">
          {language === 'tr' ? 'LİDERLİK TABLOSU VE SOSYAL DOSTLUK' : 'RESOURCES LEADERBOARD & SOCIAL COHORT'}
        </h2>
        <p className="text-xs text-slate-450 mt-1 font-semibold leading-relaxed">
          {language === 'tr' 
            ? 'Aileniz, arkadaşlarınız ve tüm Türkiye genelindeki su koruyucuları ile yarışarak tasarrufu sosyal ve eğlenceli hale getirin.'
            : 'Explore, research, and monitor custom metrics representing regional eco-conservation leagues.'}
        </p>
      </div>

      {/* Share stats ribbon */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-900/10 to-indigo-950/10 border border-cyan-550/15 flex items-center justify-between gap-6">
        <div>
          <span className="text-xs font-black text-white block uppercase tracking-wide">{language === 'tr' ? 'Sürdürülebilirlik Puanını Paylaş' : 'Post Eco Achievements'}</span>
          <p className="text-[10.5px] text-slate-400 mt-1 font-medium leading-relaxed">
            {language === 'tr' ? 'Bu haftaki su tasarrufunuzu ve Eco Score puanınızı panoya kopyalayarak iletin.' : 'Reroute structural metrics and level statistics directly into social sharing frameworks.'}
          </p>
        </div>
        <button
          onClick={triggerSocialShare}
          className="h-10 px-4.5 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-400/10 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Share2 size={13} className="text-cyan-400 animate-pulse" />
          <span>{t.socialShare}</span>
        </button>
      </div>

      {/* Sorting Tabs controller toolbar layout */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between border-b border-white/5 pb-4">
        
        {/* Metric Categories button group */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('savings')}
            className={`px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border cursor-pointer transition-all ${
              activeCategory === 'savings' ? 'bg-cyan-500 border-cyan-405 text-white shadow-md' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🐳 {language === 'tr' ? 'En Çok Tasarruf' : 'Top Savers'}
          </button>
          <button
            onClick={() => setActiveCategory('missions')}
            className={`px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border cursor-pointer transition-all ${
              activeCategory === 'missions' ? 'bg-cyan-500 border-cyan-405 text-white shadow-md' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🎯 {language === 'tr' ? 'Görev Tamamlama' : 'Missions'}
          </button>
          <button
            onClick={() => setActiveCategory('garden')}
            className={`px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border cursor-pointer transition-all ${
              activeCategory === 'garden' ? 'bg-cyan-500 border-cyan-405 text-white shadow-md' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🌹 {language === 'tr' ? 'Zengin Bahçeler' : 'Advanced Gardens'}
          </button>
          <button
            onClick={() => setActiveCategory('xp')}
            className={`px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border cursor-pointer transition-all ${
              activeCategory === 'xp' ? 'bg-cyan-500 border-cyan-405 text-white shadow-md' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            ⭐ {language === 'tr' ? 'Lider XP' : 'XP Leaders'}
          </button>
        </div>

        {/* Durations toggle pills */}
        {activeCategory === 'savings' && (
          <div className="flex bg-black/35 p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto select-none">
            {(['weekly', 'monthly', 'yearly'] as const).map(dur => (
              <button
                key={dur}
                onClick={() => setActiveDuration(dur)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeDuration === dur ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'tr' ? (dur === 'weekly' ? 'Haftalık' : dur === 'monthly' ? 'Aylık' : 'Yıllık') : dur}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main double column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Dynamic Rankings Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md space-y-4">
          
          {/* Header & Local search bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black tracking-widest text-cyan-300 uppercase block">
                👑 {language === 'tr' ? 'SÜRDÜRÜLEBİLİRLİK SIRALAMA LİSTESİ' : 'HYDRO-COMMUNITY STANDINGS'}
              </span>
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'bulkDelete' })}
                className="text-[9px] font-black uppercase text-red-400 hover:text-red-300 flex items-center gap-1 border border-red-500/10 hover:border-red-500/20 px-2 py-0.5 rounded-lg bg-red-500/5 transition-all cursor-pointer"
              >
                🗑️ {language === 'tr' ? 'Listeyi Temizle (Toplu Sil)' : 'Bulk Clear Standings'}
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                placeholder={language === 'tr' ? 'Katılımcı ara...' : 'Find competitor...'}
                className="w-full h-8.5 rounded-full bg-black/25 focus:bg-black/40 border border-white/10 focus:border-cyan-404 focus:outline-none pl-9 pr-4 text-xs font-semibold text-white transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Map display entries */}
          <div className="space-y-2">
            {processedLeaderboard.map((item, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    item.isMe 
                      ? 'border-cyan-500/35 bg-cyan-500/10 shadow-lg shadow-cyan-500/5' 
                      : 'border-white/5 bg-black/15 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Position emblem */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 font-mono text-xs font-bold bg-white/5 text-slate-300 font-sans">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>

                    <div>
                      <span className={`text-xs font-black block leading-none ${item.isMe ? 'text-[#00fbfb]' : 'text-slate-200'}`}>
                        {item.name} {item.isMe ? `(${language === 'tr' ? 'Siz' : 'You'})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black text-teal-305 font-mono tracking-wider">
                      {getMetricLabelAndValue(item)}
                    </span>
                    
                    {/* Action controllers */}
                    <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
                      {/* Edit click */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditName(item.name);
                          setEditWeekly(item.weeklySavings);
                          setActiveModal({ type: 'edit', contestantId: item.id });
                        }}
                        className="px-1.5 py-1 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title={language === 'tr' ? 'Düzenle' : 'Edit'}
                      >
                        <span className="text-[10px] block leading-none">✏️</span>
                      </button>

                      {/* Reset click */}
                      <button
                        type="button"
                        onClick={() => setActiveModal({ type: 'reset', contestantId: item.id })}
                        className="px-1.5 py-1 rounded hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-300 transition-colors cursor-pointer"
                        title={language === 'tr' ? 'Tüketimi Sıfırla' : 'Reset Resource usage'}
                      >
                        <span className="text-[10px] block leading-none">🔄</span>
                      </button>

                      {/* Delete click */}
                      {!item.isMe && (
                        <button
                          type="button"
                          onClick={() => setActiveModal({ type: 'delete', contestantId: item.id })}
                          className="px-1.5 py-1 rounded hover:bg-red-500/25 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                          title={language === 'tr' ? 'Üyeyi Çıkar' : 'Delete Member'}
                        >
                          <span className="text-[11px] block leading-none">❌</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {processedLeaderboard.length === 0 && (
              <div className="py-12 text-center text-slate-550 border border-dashed border-white/5 rounded-2xl text-xs font-semibold">
                {language === 'tr' ? 'Aradığınız kriterde kimse bulunamadı.' : 'No contestants found matching criteria.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add Friend Column Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-md space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <UserPlus size={15} className="text-slate-400" />
              {t.addFriend}
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{language === 'tr' ? 'ARKADAŞININ ADI' : "FRIEND'S LEGAL NAME"}</label>
                <input
                  type="text"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="w-full bg-black/25 focus:bg-black/40 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-xl h-10 px-3.5 text-xs font-semibold text-white tracking-wide transition-all"
                  placeholder="Ahmet, Can, Leyla vb..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-10.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20"
                style={{ color: '#030712' }}
              >
                <Plus size={14} />
                <span>{language === 'tr' ? 'Topluluğa Ekle' : 'Add Competitor'}</span>
              </button>
            </form>
          </div>

          {/* Informational Rules Box */}
          <div className="p-5.5 rounded-3xl border border-white/5 bg-slate-900/20 text-[10px] font-semibold leading-relaxed text-slate-400 space-y-2 text-left">
            <span className="text-[9.5px] font-black text-cyan-300 block mb-1">💡 RANGLAR NASIL BELİRLENİR?</span>
            <p>• Su tüketim bütçenizi aşmadığınız her başarılı gün: <strong>+100 Puan</strong>.</p>
            <p>• Sanal bahçenizden olgun bitki hasat etmek: <strong>+300 XP</strong>.</p>
            <p>• Coğrafi su tasarrufu görevlerinden birisini tamamlamak: <strong>+250 Puan</strong>.</p>
          </div>
        </div>
      </div>

      {/* ---------------- ACTION CONFIRMATION OVERLAYS ---------------- */}
      {activeModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            {/* 1. EDIT MODAL */}
            {activeModal.type === 'edit' && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
                  ✏️ {language === 'tr' ? 'ÜYE DETAYLARINI DÜZENLE' : 'EDIT MEMBER DETAILS'}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 block uppercase">
                      {language === 'tr' ? 'ÜYE ADI' : 'MEMBER NAME'}
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl h-10 px-3 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-[#00fbfb]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 block uppercase">
                      {language === 'tr' ? 'HAFTALIK TASARRUF (L)' : 'WEEKLY SAVINGS (L)'}
                    </label>
                    <input
                      type="number"
                      value={editWeekly}
                      onChange={(e) => setEditWeekly(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl h-10 px-3 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-[#00fbfb]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal({ type: null })}
                    className="flex-1 h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'İptal' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => activeModal.contestantId && handleEditContestant(activeModal.contestantId, editName, editWeekly)}
                    className="flex-1 h-9 rounded-xl text-xs font-black text-slate-900 bg-cyan-400 hover:bg-cyan-350 transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'Kaydet' : 'Save'}
                  </button>
                </div>
              </div>
            )}

             {/* 2. RESET MODAL */}
            {activeModal.type === 'reset' && (() => {
              const targetUser = contestants.find(c => c.id === activeModal.contestantId);
              return (
                <div className="space-y-3 text-center animate-fade-in">
                  <div className="text-3xl text-yellow-500 animate-bounce">🔄</div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    {language === 'tr' ? 'KULLANIMI SIFIRLA' : 'RESET CONSERVATION STATS'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    {language === 'tr' 
                      ? `${targetUser?.name || 'Seçili'} isimli kullanıcının su kullanım verilerini sıfırlamak istiyor musunuz?` 
                      : `Are you sure you want to reset water usage statistics for ${targetUser?.name || 'this member'}?`}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: null })}
                      className="flex-1 h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition-all cursor-pointer"
                    >
                      {language === 'tr' ? 'İptal' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => activeModal.contestantId && handleResetUsage(activeModal.contestantId)}
                      className="flex-1 h-9 rounded-xl text-xs font-black text-slate-950 bg-yellow-400 hover:bg-yellow-350 transition-all cursor-pointer shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                    >
                      {language === 'tr' ? 'Sıfırla' : 'Reset'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 3. DELETE MEMBER CARD CONFIRMATION MODAL */}
            {activeModal.type === 'delete' && (() => {
              const targetUser = contestants.find(c => c.id === activeModal.contestantId);
              return (
                <div className="space-y-3 text-center animate-fade-in">
                  <div className="text-3xl text-red-500">⚠️</div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    {language === 'tr' ? 'ÜYEYİ SİL' : 'DELETE MEMBER'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    {language === 'tr' 
                      ? `${targetUser?.name || 'Seçili'} isimli kullanıcıyı silmek istiyor musunuz?` 
                      : `Are you sure you want to delete ${targetUser?.name || 'this member'}?`}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: null })}
                      className="flex-1 h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition-all cursor-pointer"
                    >
                      {language === 'tr' ? 'İptal' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => activeModal.contestantId && handleDeleteContestant(activeModal.contestantId)}
                      className="flex-1 h-9 rounded-xl text-xs font-black text-white bg-red-500 hover:bg-red-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    >
                      {language === 'tr' ? 'Sil' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 4. BULK DELETE CONFIRMATION MODAL */}
            {activeModal.type === 'bulkDelete' && (
              <div className="space-y-3 text-center">
                <div className="text-3xl text-red-500 animate-pulse">🗑️</div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {language === 'tr' ? 'LİSTEYİ TOPLU TEMİZLE' : 'BULK CLEAR ALL STANDINGS'}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  {language === 'tr' 
                    ? 'Kendi hesabınız hariç tüm liderlik yarışı listesini toplu olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!' 
                    : 'Are you sure you want to remove all contestants except yourself? This action cannot be undone!'}
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal({ type: null })}
                    className="flex-1 h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'İptal' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex-1 h-9 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-500 transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'Toplu Sil' : 'Clear All'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
