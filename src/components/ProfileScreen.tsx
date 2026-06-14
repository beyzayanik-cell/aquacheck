import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { UserProfile, WaterRecord, Badge } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  Shield, 
  Award, 
  TrendingDown, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Save, 
  ArrowLeft,
  Camera,
  Heart
} from 'lucide-react';

interface ProfileScreenProps {
  language: string;
  theme: string;
  colors: any;
  user: UserProfile | null;
  onSaveProfile: (partial: Partial<UserProfile>) => void;
  records: WaterRecord[];
  badges: Badge[];
  onNavigate: (view: any) => void;
}

export default function ProfileScreen({
  language,
  theme,
  colors,
  user,
  onSaveProfile,
  records,
  badges,
  onNavigate
}: ProfileScreenProps) {
  const t = TRANSLATIONS[language as any] || TRANSLATIONS.en;

  // Local form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState(user?.password || '••••••••');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 150);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate stats based on actual data
  const totalLitersUsed = records.reduce((sum, r) => sum + r.liters, 0);
  
  // Calculate savings (baseline of 300L per user per day vs actual in the tracked records)
  // Let's make it a nice dynamic calculation
  const totalDaysTracked = Math.max(1, new Set(records.map(r => r.date)).size);
  const theoreticalBaseline = totalDaysTracked * 280; // 280L national average baseline per day
  const rawSaved = Math.max(0, theoreticalBaseline - totalLitersUsed);
  const co2ContributionOffset = Math.round(rawSaved * 0.18); // 0.18 kg CO2 offset per saved liter of water treatment

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      fullName,
      email,
      phone,
      password,
      dailyGoal: Number(dailyGoal)
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const unlockedBadges = badges.filter(b => b.unlockedAt);

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{t.home}</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb]">
          {t.profileTitle}
        </span>
      </div>

      {/* Main glass card profile banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden">
        {/* Glow decorative decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00fbfb]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Avatar frame */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shadow-xl shadow-cyan-500/10 flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-full bg-[#11161d] rounded-2xl flex flex-col items-center justify-center text-3xl font-black text-cyan-400 select-none">
                {fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AQ'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#0d1216] border border-white/10 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white cursor-pointer hover:bg-white/5 transition-all">
              <Camera size={14} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
              <h1 className="text-xl font-black text-white">{fullName || 'Doğa Dostu Üye'}</h1>
              <span className="w-fit mx-auto md:mx-0 px-2.5 py-0.5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/20 text-[#00fbfb] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} />
                ECO LEADER
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-semibold max-w-md">
              {t.profileSubtitle}
            </p>
            <div className="text-zinc-500 text-[10px] font-mono flex items-center gap-1.5 justify-center md:justify-start">
              <Calendar size={11} />
              <span>Üyelik Tarihi: Mayıs 2026</span>
            </div>
          </div>
        </div>

        {/* Stats segment */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
              <TrendingDown className="text-emerald-400" size={12} />
              {t.savedLiters}
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-400 tracking-tight">{rawSaved}</span>
              <span className="text-[10px] font-extrabold text-slate-500">LT</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
              <Shield className="text-cyan-400" size={12} />
              {t.carbonOffset}
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg font-black text-cyan-400 tracking-tight">{co2ContributionOffset}</span>
              <span className="text-[10px] font-extrabold text-slate-500">KG CO2</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
              <Flame className="text-amber-500 animate-pulse" size={12} />
              {t.streaks}
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg font-black text-amber-500 tracking-tight">5</span>
              <span className="text-[10px] font-extrabold text-slate-500">{t.daily}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
              <Award className="text-[#00fbfb]" size={12} />
              {t.badgesEarned}
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg font-black text-[#00fbfb] tracking-tight">{unlockedBadges.length}</span>
              <span className="text-[10px] font-extrabold text-slate-500">/ 5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left side info editing form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-[#00fbfb]" />
              {t.accountInfo}
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-black text-[#00fbfb] hover:underline"
            >
              {isEditing ? 'Vazgeç' : 'Düzenle'}
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{t.saveSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  {t.fullnameLabel}
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    disabled={!isEditing}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  {t.dailyGoalLiters}
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 transition-colors"
                />
              </div>
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-xs shadow-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                <span>{t.applySave}</span>
              </button>
            )}
          </form>
        </div>

        {/* Right side unlocked Badges panel */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-[#00fbfb]" />
              {t.personalStats}
            </h2>

            <div className="space-y-3">
              {badges.map(badge => {
                const isUnlocked = badge.unlockedAt;
                return (
                  <div 
                    key={badge.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      isUnlocked 
                        ? 'bg-[#00fbfb]/5 border-[#00fbfb]/10' 
                        : 'bg-black/10 border-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">
                        {t[badge.titleKey] || badge.titleKey}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {t[badge.descKey] || badge.descKey}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
              <Heart size={10} className="text-[#00fbfb]" />
              Green Developer 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
