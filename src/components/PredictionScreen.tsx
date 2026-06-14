/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, WaterRecord } from '../types';
import { Sparkles, Brain, Landmark, AlertCircle, RefreshCw, Sliders, TrendingUp, HelpCircle, ArrowDown } from 'lucide-react';

interface PredictionScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  records: WaterRecord[];
  dailyGoal: number;
}

interface SimulationCategory {
  id: string;
  nameTr: string;
  nameEn: string;
  savingPerMin: number; // liters saved per unit reduced
  frequencyPerMonth: number; // monthly frequency
  reductionValue: number; // current slider value
  icon: string;
}

const DEFAULT_SIM_CATEGORIES: SimulationCategory[] = [
  { id: 'shower', nameTr: 'Duş Süresi', nameEn: 'Shower Time', savingPerMin: 12, frequencyPerMonth: 15, reductionValue: 2, icon: '🚿' },
  { id: 'kitchen', nameTr: 'Mutfak Musluğu', nameEn: 'Kitchen Faucet', savingPerMin: 8, frequencyPerMonth: 30, reductionValue: 3, icon: '🍳' },
  { id: 'dish', nameTr: 'Bulaşık Yıkama', nameEn: 'Dishwashing Duty', savingPerMin: 15, frequencyPerMonth: 20, reductionValue: 1, icon: '🍽️' },
  { id: 'laundry', nameTr: 'Çamaşır Yıkama', nameEn: 'Laundry Cycles', savingPerMin: 45, frequencyPerMonth: 8, reductionValue: 1, icon: '🧺' },
  { id: 'garden', nameTr: 'Bahçe Sulama', nameEn: 'Garden Irrigation', savingPerMin: 25, frequencyPerMonth: 10, reductionValue: 2, icon: '🏡' },
];

export default function PredictionScreen({ 
  language, 
  colors, 
  records, 
  dailyGoal 
}: PredictionScreenProps) {
  
  const t = TRANSLATIONS[language];
  const [isComputing, setIsComputing] = useState(false);

  // Extensible Categories state
  const [categories, setCategories] = useState<SimulationCategory[]>(DEFAULT_SIM_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSaving, setNewCatSaving] = useState(15);
  const [newCatFreq, setNewCatFreq] = useState(10);
  const [newCatIcon, setNewCatIcon] = useState('🧹');
  const [showAddForm, setShowAddForm] = useState(false);

  // Read actual logs and calculate statistics
  const loggedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return records
      .filter(r => r.date === todayStr)
      .reduce((sum, r) => sum + r.liters, 0) || 120; // Fallback
  }, [records]);

  // Forecast month's end volume (e.g. current aggregate rate * 30 days)
  const estimatedMonthlyLiters = useMemo(() => {
    const avgDaily = records.length > 0 
      ? records.reduce((sum, r) => sum + r.liters, 0) / Math.max(1, new Set(records.map(r => r.date)).size)
      : 135;
    return Math.round(avgDaily * 30);
  }, [records]);

  // Target base volume for the month
  const targetMonthlyLiters = useMemo(() => {
    return dailyGoal * 30;
  }, [dailyGoal]);

  // Compute saving projections:
  const potentialSavings = useMemo(() => {
    return categories.reduce((sum, cat) => {
      return sum + (cat.reductionValue * cat.savingPerMin * cat.frequencyPerMonth);
    }, 0);
  }, [categories]);

  const optimizedMonthlyLiters = useMemo(() => {
    return Math.max(1000, estimatedMonthlyLiters - potentialSavings);
  }, [estimatedMonthlyLiters, potentialSavings]);

  const handleRecalculate = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
    }, 805);
  };

  const dynamicAIConclusion = useMemo(() => {
    const isTr = language === 'tr';
    let showerL = 0;
    let kitchenL = 0;
    let gardenL = 0;
    let laundryL = 0;
    let dishL = 0;
    let otherL = 0;
    
    records.forEach(r => {
      const cat = r.category?.toLowerCase() || '';
      if (cat.includes('shower') || cat.includes('duş')) showerL += r.liters;
      else if (cat.includes('kitchen') || cat.includes('mutfak') || cat.includes('musluk')) kitchenL += r.liters;
      else if (cat.includes('garden') || cat.includes('bahçe') || cat.includes('sulama')) gardenL += r.liters;
      else if (cat.includes('laundry') || cat.includes('çamaşır')) laundryL += r.liters;
      else if (cat.includes('dish') || cat.includes('bulaşık')) dishL += r.liters;
      else otherL += r.liters;
    });

    const totalL = showerL + kitchenL + gardenL + laundryL + dishL + otherL;
    const daysCount = Math.max(1, new Set(records.map(r => r.date)).size);
    const avgDailyL = records.length > 0 ? (totalL / daysCount) : 125;

    // Determine primary sector
    let primarySect = 'shower';
    let maxVal = showerL;
    if (kitchenL > maxVal) { maxVal = kitchenL; primarySect = 'kitchen'; }
    if (gardenL > maxVal) { maxVal = gardenL; primarySect = 'garden'; }
    if (laundryL > maxVal) { maxVal = laundryL; primarySect = 'laundry'; }
    if (dishL > maxVal) { maxVal = dishL; primarySect = 'dish'; }
    if (otherL > maxVal) { maxVal = otherL; primarySect = 'other'; }

    let message = '';

    if (isTr) {
      if (avgDailyL < 110) {
        message += `📈 KULLANIM SINIFI: Çevre Dostu Kahraman (Düşük Tüketim - Günlük Ortalama: ${Math.round(avgDailyL)} Litre)\n\nTebrikler! Günlük su ayak iziniz Türkiye ortalamasının oldukça altında seyrediyor. Harika bir doğa koruyucususunuz! `;
      } else if (avgDailyL > 180) {
        message += `📈 KULLANIM SINIFI: Dikkatli Olunmalı (Yüksek Tüketim - Günlük Ortalama: ${Math.round(avgDailyL)} Litre)\n\nGünlük su ayak iziniz kritik seviyede görünüyor. Küresel ısınma çağında bu veriler faturanız ve geleceğimiz için risklidir. `;
      } else {
        message += `📈 KULLANIM SINIFI: Dengeli Tüketici (Günlük Ortalama: ${Math.round(avgDailyL)} Litre)\n\nToplam su kullanımınız kontrol altında. Bu dengeli çizgiyi korumak ve daha da iyileştirmek için mikroyapısal değişiklikler uygulayabilirsiniz. `;
      }

      // Add category targeted intelligence
      if (primarySect === 'garden') {
        message += `\n\n🏡 BAHÇE SULAMA AĞIRLIKLI ANALİZ:\nEn büyük tüketim alanınızın bahçe sulama olduğu tespit edilmiştir. Buharlaşmayı önlemek için sulamayı sadece akşam serinliğinde veya gece yapmanız, toprak altına damlama vanaları döşemeniz faturanızda doğrudan %40 düşüş sağlayabilir. Akvaryum suları veya yıkama sularını bitkilere can suyu olarak verebilirsiniz.`;
      } else if (primarySect === 'kitchen') {
        message += `\n\n🍳 MUTFAK KULLANIMI AĞIRLIKLI ANALİZ:\nMutfak musluğu ve yemek hazırlama aşamalarında su hacminiz yüksek seyrediyor. Bataryalara musluk perlatörleri takarak tazyiki azaltmadan %50 su tasarrufu elde edebilirsiniz. Sebze yıkama sularını saksılara dökerek sıfır-atık çevrimine katılın.`;
      } else if (primarySect === 'shower') {
        message += `\n\n🚿 DUŞ TÜKETİMİ AĞIRLIKLI ANALİZ:\nTüketim payınızın en fazlası banyo seanslarında harcanıyor. Duş sürenizi her gün sadece 1-2 dakika azaltmak, tek başınıza yılda 4.300 litre su kurtarmanızı sağlar. Akış kesici akıllı duş başlığı ve banyoya koyacağınız 5 dakikalık kum saati su faturanızın seyrini değiştirecektir.`;
      } else if (primarySect === 'laundry' || primarySect === 'dish') {
        message += `\n\n🧺 BEYAZ EŞYA ODAKLI TÜKETİM ANALİZİ:\nÇamaşır veya bulaşık makinelerinizin kullanım yoğunluğu göze çarpıyor. Makineleriniz tam dolmadan çalıştırmamaya dikkat edin. "Eco" programı standart programlara göre %35 daha az elektrik ve %40 daha az su harcar. Bulaşıkları akarsuda ön yıkama yapmadan makineye yerleştirmek yılda tonlarca su kurtarır.`;
      } else {
        message += `\n\n⚙️ DİĞER KULLANIMLAR ANALİZİ:\nTüketim alanlarınız arasında diğer özel aktiviteleriniz öne çıkıyor. Özel akvaryum bakımı, havuz filtre temizliği veya araç yıkamada su sirkülasyon hatlarını iyileştirmek ya da kova ile yıkamak gibi pratik önlemlerle su harcamalarınızı kısıtlayabilirsiniz.`;
      }

      if (potentialSavings > 0) {
        message += `\n\n💡 Simülatördeki kısıntı bütçenize göre her ay ${potentialSavings} Litre suyu doğrudan barajlarımızda muhafaza edebilirsiniz. Bu tasarruf, yılda yaklaşık ${Math.round(potentialSavings * 12 / 1.5)} adet plastik pet şişe atığının önüne geçmekle eştir!`;
      }
    } else {
      if (avgDailyL < 110) {
        message += `📈 CONSUMPTION CLASS: Eco-Hero Grade (Low Consumption - Daily Avg: ${Math.round(avgDailyL)} Liters)\n\nCongratulations! Your daily hydration footprint remains significantly lower than typical patterns. You are doing a stellar job! `;
      } else if (avgDailyL > 180) {
        message += `📈 CONSUMPTION CLASS: Critical Watch (High Consumption - Daily Avg: ${Math.round(avgDailyL)} Liters)\n\nYour hydrometric output is elevated. In this era of climatic transitions, cutting back is highly strategic. `;
      } else {
        message += `📈 CONSUMPTION CLASS: Balanced Consumer (Daily Avg: ${Math.round(avgDailyL)} Liters)\n\nYour net volume is within average boundaries. Tuning small micro habits will move you closer to optimal footprints. `;
      }

      if (primarySect === 'garden') {
        message += `\n\n🏡 GARDEN IRRIGATIVE AUDIT:\nYour logs pinpoint garden irrigation as the peak vector. Preventing noon solar evaporation by watering exclusively at cooler evening slots and installing subsurface drip pipes can cut this sector bill by up to 40% instantly.`;
      } else if (primarySect === 'kitchen') {
        message += `\n\n🍳 KITCHEN AND DINING PATTERNS:\nKitchen faucet flow rates exhibit high density. Installing aerators reduces volume by up to 50% without altering tap pressure. Reuse culinary rinse water to hydrate household pots.`;
      } else if (primarySect === 'shower') {
        message += `\n\n🚿 SHOWER AND RECREATIONAL WATER VIEW:\nBathing time holds the highest percent share in your carbon ledger. Trimming just 1 minute of active shower time captures 4,300 liters per year safely. Transitioning to restricted regulator heads yields stellar outputs.`;
      } else if (primarySect === 'laundry' || primarySect === 'dish') {
        message += `\n\n🧺 COMPLIANT APPLIANCES TRACK:\nWhite goods laundry or dishwashing cycles exhibit peak loads. Run appliances only on full volumes. The designated Eco mode uses 35% less power and up to 40% less water than baseline cycles.`;
      } else {
        message += `\n\n⚙️ OPTIONAL SERVICES WATER USE:\nSpecialized other uses stand out. Ensuring recirculating pumps in pools, cleaning filtration lines, and using bucket washes for automobiles can save major volumes in the long run.`;
      }

      if (potentialSavings > 0) {
        message += `\n\n💡 Your virtual simulator adjustments indicate you can conserve ${potentialSavings}L monthly. This offsets up to ${(potentialSavings * 0.12).toFixed(1)}kg of CO2 emissions.`;
      }
    }

    return message;
  }, [records, potentialSavings, language]);

  return (
    <div className="space-y-6 text-white animate-fade-in pb-12">
      
      {/* Head section */}
      <div>
        <span className="text-[10px] font-black tracking-widest text-[#00fbfb] uppercase bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
          ⚡ {language === 'tr' ? 'AKILLI YAPAY ZEKA TAHMİN BÖLGESİ' : 'AI USAGE PREDICTIONS UNIT'}
        </span>
        <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight">
          {language === 'tr' ? 'TÜKETİM TAHMİNLERİ VE SİMÜLASYON ANALİZİ' : 'HYDRO-METRICS & WATER SAVING FORECASTS'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl font-semibold">
          {language === 'tr' 
            ? 'Mevcut su kullanım alışkanlıklarınıza göre aylık tüketim öngörülerinizi inceleyin ve küçük iyileştirmelerin gücünü grafiklerle simüle edin.'
            : 'Forecast monthly depletion benchmarks, evaluate custom slider variables, and review predictive micro-reductions.'}
        </p>
      </div>

      {/* Main Grid: Variable sliders block & predictions graphs and details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Card: Dynamic Custom sliders for simulation parameters */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-white/5 bg-slate-900/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders size={16} className="text-[#00fbfb]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {language === 'tr' ? 'KİŞİSELLEŞTİRİLMİŞ TASARRUF SİMÜLASYONU' : 'PREDICTION SLIDER COHORTS'}
            </h3>
          </div>

          <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">
            {language === 'tr' 
              ? 'Aşağıdaki kaydırıcılarla kısıntı miktarlarını ayarlayarak aylık su faturanızı simüle edin.'
              : 'Tune potential reductions parameter knobs below to recalculate hypothetical saving metrics.'}
          </p>

          {/* Dynamic Sliders list */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-2 p-3 rounded-2xl bg-black/20 border border-white/5">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-205">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="text-sm shrink-0">{cat.icon}</span>
                    <span className="text-slate-200">{language === 'tr' ? cat.nameTr : cat.nameEn}</span>
                  </span>
                  <span className="font-mono font-black text-cyan-400">
                    -{cat.reductionValue} / Ay
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={cat.reductionValue}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, reductionValue: val } : c));
                  }}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[8.5px] font-bold text-slate-500 block leading-tight">
                  * {language === 'tr' 
                    ? `Bu aktiviteyi azaltmak ayda size ${cat.reductionValue * cat.savingPerMin * cat.frequencyPerMonth} L tasarruf ettirir.` 
                    : `Reducing this active slot saves you ${cat.reductionValue * cat.savingPerMin * cat.frequencyPerMonth}L monthly.`}
                </span>
              </div>
            ))}
          </div>

          {/* User Custom Category Insertion Form */}
          <div className="pt-2">
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 hover:border-[#00fbfb]/30 rounded-2xl text-[11px] font-black uppercase text-center text-slate-300 hover:text-cyan-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>➕ {language === 'tr' ? 'Özel Simülasyon Kategorisi Ekle' : 'Add Custom Category'}</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 relative text-left">
                <h4 className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">
                  🛸 {language === 'tr' ? 'YENİ SİMÜLASYON KATEGORİSİ' : 'NEW CUSTOM CATEGORY'}
                </h4>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase">{language === 'tr' ? 'Kategori Adı' : 'Category Name'}</label>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder={language === 'tr' ? 'Örn. Havuz Dolumu...' : 'e.g. Pool filling...'}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl h-8 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase">{language === 'tr' ? 'Simge' : 'Icon'}</label>
                      <select
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl h-8 px-1 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="🚿">🚿 {language === 'tr' ? 'Duş' : 'Shower'}</option>
                        <option value="🍳">🍳 {language === 'tr' ? 'Mutfak' : 'Kitchen'}</option>
                        <option value="🧺">🧺 {language === 'tr' ? 'Çamaşır' : 'Laundry'}</option>
                        <option value="🍽️">🍽️ {language === 'tr' ? 'Bulaşık' : 'Dishwashing'}</option>
                        <option value="🏡">🏡 {language === 'tr' ? 'Bahçe Sulama' : 'Garden Irr.'}</option>
                        <option value="🚗">🚗 {language === 'tr' ? 'Araç Yıkama' : 'Car Wash'}</option>
                        <option value="🏊">🏊 {language === 'tr' ? 'Havuz' : 'Pool'}</option>
                        <option value="🧹">🧹 {language === 'tr' ? 'Ev Temizliği' : 'House Cleaning'}</option>
                        <option value="🐕">🐕 {language === 'tr' ? 'Hayvan Bakımı' : 'Pet Care'}</option>
                        <option value="🚜">🚜 {language === 'tr' ? 'Tarım Sulama' : 'Farm Irr.'}</option>
                        <option value="🏢">🏢 {language === 'tr' ? 'İş Yeri' : 'Workplace'}</option>
                        <option value="🐠">🐠 {language === 'tr' ? 'Akvaryum' : 'Aquarium'}</option>
                        <option value="⚙️">⚙️ {language === 'tr' ? 'Diğer' : 'Other'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase leading-none">{language === 'tr' ? 'Litre / Kullanım' : 'Liters / Use'}</label>
                      <input
                        type="number"
                        value={newCatSaving}
                        onChange={(e) => setNewCatSaving(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl h-8 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase leading-none">{language === 'tr' ? 'Aylık Sıklık' : 'Times / Month'}</label>
                      <input
                        type="number"
                        value={newCatFreq}
                        onChange={(e) => setNewCatFreq(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl h-8 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'İptal' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCatName.trim()) return;
                      const newId = 'custom_' + Math.random().toString();
                      const newCat: SimulationCategory = {
                        id: newId,
                        nameTr: newCatName.trim(),
                        nameEn: newCatName.trim(),
                        savingPerMin: newCatSaving,
                        frequencyPerMonth: newCatFreq,
                        reductionValue: 2,
                        icon: newCatIcon
                      };
                      setCategories(prev => [...prev, newCat]);
                      setNewCatName('');
                      setShowAddForm(false);
                    }}
                    className="flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'Ekle' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRecalculate}
            disabled={isComputing}
            className="w-full h-11 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-cyan-400/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isComputing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                {language === 'tr' ? 'HESAPLANIYOR...' : 'RECALCULATING...'}
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {language === 'tr' ? 'Tahmini Hesapla' : 'Calculate Prediction'}
              </>
            )}
          </button>
        </div>

        {/* Right Card: Predictions summaries and dynamic visual charts */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[10px] font-black tracking-widest text-[#00fbfb] uppercase">
              🛸 {language === 'tr' ? 'AYLIK ÖNGÖRÜ GRAFİK ANALİZİ' : 'MONTHLY CONSUMPTION FORECAST VIEW'}
            </span>
            <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-400">
              {language === 'tr' ? 'Tahmini Gelişim' : 'Predictive Projection'}
            </span>
          </div>

          {/* Core Monthly Projection Card Columns */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-650/10 border border-red-500/15 rounded-2xl">
              <span className="text-[9px] font-black text-red-400 uppercase tracking-wide block">{language === 'tr' ? 'MEVCUT HIZ' : 'CURRENT GAP'}</span>
              <span className="text-xl font-black font-mono mt-1 block tracking-tight text-red-400">{estimatedMonthlyLiters} L</span>
              <span className="text-[8px] font-semibold text-slate-500 block leading-tight">Aylık Tahmini</span>
            </div>
            
            <div className="p-3 bg-[#00fbfb]/10 border border-[#00fbfb]/15 rounded-2xl">
              <span className="text-[9px] font-black text-cyan-300 uppercase tracking-wide block">{language === 'tr' ? 'FARK / SİMÜLASYON' : 'WHAT-IF OPTIM'}</span>
              <span className="text-xl font-black font-mono mt-1 block tracking-tight text-emerald-400">{optimizedMonthlyLiters} L</span>
              <span className="text-[8px] font-semibold text-slate-500 block leading-tight">İyileştirilmiş Değer</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/15 rounded-2xl">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-wide block">{language === 'tr' ? 'HEDEF BÜTÇE' : 'TARGET CAP'}</span>
              <span className="text-xl font-black font-mono mt-1 block tracking-tight text-slate-200">{targetMonthlyLiters} L</span>
              <span className="text-[8px] font-semibold text-slate-500 block leading-tight">Aylık Hedef Limit</span>
            </div>
          </div>

          {/* Custom Styled Responsive Bar-Chart representation in SVG */}
          <div className="space-y-3.5 pt-2">
            <span className="text-[10px] font-black text-[#00fbfb] uppercase tracking-wider block">
              📊 {language === 'tr' ? 'KARŞILAŞTIRMALI TÜKETİM ENVERTERİ' : 'PREDICTION MATRIX ANALYSIS'}
            </span>

            <div className="bg-black/25 border border-white/5 rounded-2xl p-4.5 space-y-4">
              
              {/* Bar 1: Existing flow pattern */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span>{language === 'tr' ? 'Mevcut Kullanım Hızı (Tasarrufsuz)' : 'Baseline Monthly Consumption'}</span>
                  <span className="font-mono text-red-400 font-extrabold">{estimatedMonthlyLiters} Litre</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-red-650 to-rose-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: '105%' }}
                  >
                    <span className="text-[8px] font-black text-white">100%</span>
                  </div>
                </div>
              </div>

              {/* Bar 2: Saved Optimisation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span>{language === 'tr' ? 'Simüle Edilen Yeni Akış (Önerilen)' : 'Optimized Consumption Pathway'}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-[9px] font-black text-emerald-400">-{potentialSavings} Litre Tasarruf</span>
                    <span className="font-mono text-emerald-400 font-extrabold">{optimizedMonthlyLiters} Litre</span>
                  </div>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 flex items-center justify-end pr-3 relative"
                    style={{ width: `${Math.max(25, Math.min(100, (optimizedMonthlyLiters / estimatedMonthlyLiters) * 100))}%` }}
                  >
                    <span className="absolute inset-0 bg-white/10 select-none animate-shimmer" />
                    <span className="text-[8px] font-black text-slate-950 font-mono">
                      {Math.round((optimizedMonthlyLiters / estimatedMonthlyLiters) * 105)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar 3: Locked Target Budget */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span>{language === 'tr' ? 'Aylık Maksimum Hedef Su Hacmi' : 'Eco-Guardian Target Budget'}</span>
                  <span className="font-mono text-amber-500 font-extrabold">{targetMonthlyLiters} Litre</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-450 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(25, Math.min(100, (targetMonthlyLiters / estimatedMonthlyLiters) * 100))}%` }}
                  >
                    <span className="text-[8px] font-black text-slate-950 font-mono">
                      {Math.round((targetMonthlyLiters / estimatedMonthlyLiters) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Advisor conclusion summary block */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-550/20 text-xs text-cyan-200 leading-relaxed font-semibold relative overflow-hidden flex gap-3">
            <Brain className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="text-[10px] font-black text-cyan-300 block mb-1">YAPAY ZEKA ENTEGRE ETKİ YORUMU</span>
              <div>{dynamicAIConclusion}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
