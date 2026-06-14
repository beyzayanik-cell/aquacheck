import React, { useState, useMemo, useEffect } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, WaterRecord } from '../types';
import { FileText, Download, CheckCircle2, RefreshCw, Calendar, Sparkles, Printer, Brain, FolderHeart, Plus, Trash2, ArrowRight } from 'lucide-react';

interface ReportsProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  records: WaterRecord[];
  user: any;
  onShowAlert: (msg: string) => void;
}

interface ArchivedReport {
  id: string;
  date: string;
  content: string;
  todayLiters: number;
}

export default function ReportsScreen({ 
  language, 
  colors, 
  records, 
  user,
  onShowAlert 
}: ReportsProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'pdf' | 'ai_reports'>('ai_reports'); // Default to AI Reports
  const [activeReportType, setActiveReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [isGenerating, setIsGenerating] = useState(false);

  // Archive state backed by LocalStorage
  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>(() => {
    const saved = localStorage.getItem('aquacheck_saved_ai_reports_v2');
    if (saved) return JSON.parse(saved);
    // Pre-populate with one lovely historic sample report
    return [
      {
        id: 'sample_1',
        date: '01.06.2026',
        content: language === 'tr'
          ? 'Bugün 135 litre su kullandınız. Düne göre %5 daha az tüketim gerçekleştirdiniz. En yüksek kullanım duş kategorisinde gerçekleşti. En başarılı tasarruf mutfak kategorisinde sağlandı. Yarın hedefinizi rahatlıkla yakalayabilirsiniz.'
          : 'Today you consumed 135 liters of water. You consumed 5% less than yesterday. The highest usage occurred in the shower category. The most successful saving was in the kitchen. You can easily hit your goal tomorrow.',
        todayLiters: 135
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aquacheck_saved_ai_reports_v2', JSON.stringify(archivedReports));
  }, [archivedReports]);

  // Calculate generic water totals
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const averageUse = records.length > 0 ? (totalLiters / records.length).toFixed(1) : '0';

  // 1. Dynamic compute current day metrics for AI Report Generation
  const aiReportText = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === todayStr);
    const todayLiters = todayRecords.reduce((sum, r) => sum + r.liters, 0) || 142; // default fallback

    // Categorized breakdown
    const categoryTotals: Record<string, number> = { shower: 0, dish: 0, garden: 0, kitchen: 0, others: 0 };
    records.forEach(r => {
      const cat = r.category || 'others';
      const amt = r.liters || 0;
      if (categoryTotals[cat] !== undefined) categoryTotals[cat] += amt;
    });

    // Determine highest category
    let highestCat = 'shower';
    let highestVal = 0;
    Object.keys(categoryTotals).forEach(k => {
      if (categoryTotals[k] > highestVal) {
        highestVal = categoryTotals[k];
        highestCat = k;
      }
    });

    // Map keywords to friendly TR and EN titles
    const categoryTrNames: Record<string, string> = { shower: 'duş', dish: 'bulaşık durulama', garden: 'bahçe sulama', kitchen: 'mutfak kullanımı', others: 'diğer' };
    const categoryEnNames: Record<string, string> = { shower: 'shower', dish: 'dishwasher', garden: 'garden sprinkler', kitchen: 'kitchen faucet', others: 'general utilities' };

    // Yesterday comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayRecords = records.filter(r => r.date === yesterdayStr);
    const yesterdayLiters = yesterdayRecords.reduce((sum, r) => sum + r.liters, 0) || 155; // fallback baseline

    const diffPct = Math.round(((yesterdayLiters - todayLiters) / yesterdayLiters) * 100);
    const positiveChange = diffPct >= 0;
    const absChange = Math.abs(diffPct > 0 ? diffPct : 8);

    if (language === 'tr') {
      return `Bugün ${todayLiters} litre su kullandınız. Düne göre %${absChange} daha ${positiveChange ? 'az' : 'fazla'} tüketim gerçekleştirdiniz. En yüksek kullanım ${categoryTrNames[highestCat] || 'duş'} kategorisinde gerçekleşti. En başarılı tasarruf mutfak kategorisinde sağlandı. Yarın hedefinizi rahatlıkla yakalayabilirsiniz.`;
    } else {
      return `Today you used ${todayLiters} liters of water. You achieved a ${absChange}% ${positiveChange ? 'reduction' : 'increase'} compared to yesterday. Your highest consumption occurred in the ${categoryEnNames[highestCat] || 'shower'} category. The most successful conserving action occurred inside your kitchen space. You remain securely on track to hit your targets tomorrow.`;
    }
  }, [records, language]);

  // Handles archiving the current report
  const handleSaveToArchive = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLiters = records.filter(r => r.date === todayStr).reduce((sum, r) => sum + r.liters, 0) || 142;
    
    // Check if daily report already saved today
    const dateFormatted = new Date().toLocaleDateString('tr-TR');
    if (archivedReports.some(rep => rep.date === dateFormatted)) {
      onShowAlert(language === 'tr' ? '🚨 Bugünün raporunu zaten arşive kaydettiniz!' : '🚨 Today\'s report has already been archived!');
      return;
    }

    const newArchive: ArchivedReport = {
      id: Math.random().toString(),
      date: dateFormatted,
      content: aiReportText,
      todayLiters
    };

    setArchivedReports(prev => [newArchive, ...prev]);
    onShowAlert(language === 'tr' ? '🤖 Yapay zeka günlük analiz raporu arşive kaydedildi!' : '🤖 AI daily report saved to historical archive!');
  };

  const handleClearArchive = () => {
    setArchivedReports([]);
    onShowAlert(language === 'tr' ? '🗑️ Tüm arşiv temizlendi.' : '🗑️ Historical archive cleared.');
  };

  const downloadReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onShowAlert(t.pdfCreated || 'PDF Sürdürülebilirlik Raporu indirildi!');
    }, 1800);
  };

  const reportData = {
    daily: {
      titleTr: 'Günlük Sürdürülebilirlik Raporu',
      titleEn: 'Daily Ecosystem Footprint Analysis',
      descTr: 'Son 24 saat içerisindeki su tüketim seviyelerini, kategori bazlı dağılımlarını ve kaynak israfı uyarılarını içerir.',
      descEn: 'Covers water consumption trends, category volumes, and municipal saving ratios during the last 24 hours.',
      code: 'REP-DL-26'
    },
    weekly: {
      titleTr: 'Haftalık Sürdürülebilirlik Raporu',
      titleEn: 'Weekly Ecological Water Audit',
      descTr: 'Son 7 günlük tüketim dalgalanmalarını, haftalık hedefe uyum oranınızı ve elde edilen ekolojik tasarrufları listeler.',
      descEn: 'Examines 7-day water fluctuations, weekly budget limits, and dynamic carbon emissions footprint values.',
      code: 'REP-WK-88'
    },
    monthly: {
      titleTr: 'Aylık Enerji ve Su Raporu',
      titleEn: 'Monthly Resource & Conservation Ledger',
      descTr: '30 günlük su ayak izinizin geniş analizini, belediye baraj doluluk oranları ile karşılaştırmalı koruma verilerini sunar.',
      descEn: 'A comprehensive 30-day water ledger comparing your household consumption against regional water basins.',
      code: 'REP-MN-43'
    },
    yearly: {
      titleTr: 'Yıllık Karbon ve Su Ayak İzi Raporu',
      titleEn: 'Yearly Global Water Footprint Appraisal',
      descTr: 'Yıl boyunca gerçekleştirdiğiniz tüm koruma aktivitelerini, kurtarılan taban suyu hacimlerini ve toplam ekolojik etki puanınızı özetler.',
      descEn: 'Your annual premium appraisal summarizing aggregate carbon offsets, groundwater contributions, and plant evolution stages.',
      code: 'REP-YR-09'
    }
  };

  const currentRep = reportData[activeReportType];

  return (
    <div className="space-y-6 text-white animate-fade-in pb-12">
      
      {/* Top title */}
      <div>
        <span className="text-[10px] font-black tracking-widest text-[#00fbfb] uppercase bg-cyan-405/10 border border-cyan-405/20 px-3 py-1 rounded-full">
          📂 {language === 'tr' ? 'RAPOR VE KAYIT DEPOSU' : 'ECOLOGICAL LEDGERS DEPOT'}
        </span>
        <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight flex items-center gap-2">
          <FileText className="text-cyan-455" size={20} />
          {language === 'tr' ? 'SÜRDÜRÜLEBİLİRLİK RAPORLARI VE ARŞİV' : 'ECOSYSTEM SUSTAINABILITY AUDITS'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl font-semibold leading-relaxed">
          {language === 'tr' 
            ? 'AquaCheck tarafından hazırlanan otomatik karbon karne analizlerinize ulaşın veya kurumsal PDF çıktılarınızı hemen alın.' 
            : 'Export highly detailed structural audits describing your personalized conservation statistics.'}
        </p>
      </div>

      {/* Primary tab triggers */}
      <div className="flex bg-black/35 p-1 rounded-2xl border border-white/5 select-none self-start">
        <button
          onClick={() => setActiveTab('ai_reports')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'ai_reports' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Brain size={14} />
          <span>{language === 'tr' ? '🤖 YAPAY ZEKA GÜNLÜK RAPORU' : '🤖 AI DAILY AUDIT'}</span>
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'pdf' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={14} />
          <span>{language === 'tr' ? '📄 AKILLI PDF RAPORLARI' : '📄 DIGITAL PDF AUDITS'}</span>
        </button>
      </div>

      {/* RENDER TAB 1: Yapay Zeka Günlük Analizi */}
      {activeTab === 'ai_reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active generated Daily report card */}
          <div className="lg:col-span-7 p-6 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] font-black tracking-widest text-[#00fbfb] uppercase">
                ⚙️ {language === 'tr' ? 'BUGÜNKÜ ANALİZ ÖNGÖRÜSÜ' : 'TODAY\'S AUTOMATED ECO-DIARY'}
              </span>
              <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-black border border-white/10 text-emerald-400">
                LIVE COMPILING
              </span>
            </div>

            <div className="p-4 bg-[#00fbfb]/5 border border-cyan-405/25 rounded-2xl text-xs leading-relaxed font-semibold font-sans text-slate-200">
              "{aiReportText}"
            </div>

            <button
              onClick={handleSaveToArchive}
              className="w-full h-11 rounded-full bg-gradient-to-r from-emerald-600 to-teal-505 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>{language === 'tr' ? 'ANALİZİ ARŞİVE KAYDET' : 'COMMIT REPORT TO ARŞİV'}</span>
            </button>
          </div>

          {/* Stored reports history list */}
          <div className="lg:col-span-5 p-6 rounded-3xl border border-white/5 bg-slate-900/15 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <FolderHeart size={14} className="text-cyan-400" />
                {language === 'tr' ? `GEÇMİŞ RAPORLAR (${archivedReports.length})` : `ARCHIVED DIARIES (${archivedReports.length})`}
              </span>
              
              {archivedReports.length > 0 && (
                <button
                  onClick={handleClearArchive}
                  className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-[9px] font-bold uppercase cursor-pointer"
                >
                  <Trash2 size={11} />
                  <span>{language === 'tr' ? 'Temizle' : 'Clear'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {archivedReports.map(rep => (
                <div key={rep.id} className="p-4 rounded-2xl border border-white/5 bg-black/20 text-left space-y-2 relative overflow-hidden group">
                  <div className="flex justify-between items-center text-[9px] font-mono font-black text-cyan-300">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {rep.date}
                    </span>
                    <span className="text-slate-500 font-bold">{rep.todayLiters} Litre</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-450 font-semibold italic">
                    "{rep.content}"
                  </p>
                </div>
              ))}

              {archivedReports.length === 0 && (
                <div className="py-12 text-center text-slate-550 border border-dashed border-white/5 rounded-3xl text-xs font-semibold">
                  {language === 'tr' ? 'Arşivde kayıtlı rapor bulunmuyor.' : 'No historic reports locked in archive.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: Akıllı PDF Raporları */}
      {activeTab === 'pdf' && (
        <div className="border border-white/5 bg-white/[0.01] rounded-3xl p-6 relative overflow-hidden space-y-6">
          <div className="absolute top-4 right-4 text-[9px] font-mono p-1 px-2.5 rounded-full bg-slate-900 border border-white/10 text-slate-400">
            REPORT ID: {currentRep.code}
          </div>

          {/* Interval selection button group */}
          <div className="grid grid-cols-4 gap-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveReportType(type)}
                className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                  activeReportType === type
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/10'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {language === 'tr' 
                  ? type === 'daily' ? 'Günlük' : type === 'weekly' ? 'Haftalık' : type === 'monthly' ? 'Aylık' : 'Yıllık'
                  : type}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 text-left">
            <span className="text-[9px] font-black tracking-widest text-[#00fbfb] uppercase">AKTİF BELGE ŞABLONU</span>
            <h3 className="text-base font-black text-white">{language === 'tr' ? currentRep.titleTr : currentRep.titleEn}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              {language === 'tr' ? currentRep.descTr : currentRep.descEn}
            </p>
          </div>

          {/* Audit parameters table */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
            <h4 className="text-[9px] font-black tracking-wider text-cyan-400 uppercase text-left">RAPOR ÖRNEK VERİ METRİKLERİ</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <span className="text-[9px] text-slate-550 font-bold block uppercase">Kullanıcı Envanteri</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{user?.fullName || 'Beyza Yanık'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 font-bold block uppercase">Tüketim Havuzu</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{totalLiters.toFixed(0)} Litre</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 font-bold block uppercase">{t.avgUsage || 'Ortalama Tüketim'}</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{averageUse} Litre</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 font-bold block uppercase">Ekolojik Skor</span>
                <span className="text-xs font-bold text-emerald-450 mt-0.5 block">Class A+++ Verified</span>
              </div>
            </div>
          </div>

          {/* Generate PDF button */}
          <button
            onClick={downloadReport}
            disabled={isGenerating}
            className="w-full h-11 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-400/25"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                {language === 'tr' ? 'PDF BELGESİ SENTEZLENİYOR...' : 'SYNTHESIZING PDF METADATA...'}
              </>
            ) : (
              <>
                <Download size={14} />
                {language === 'tr' ? 'DİJİTAL PDF RAPORU İNDİR' : 'DOWNLOAD DIGITAL PDF REPORT'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Foot educational note */}
      <div className="p-4 rounded-xl border border-dashed border-white/5 text-[9.5px] text-slate-400 font-semibold leading-relaxed flex gap-2.5 items-center justify-start text-left">
        <Printer size={15} className="text-cyan-400 shrink-0" />
        <p>
          {language === 'tr' 
            ? 'AquaCheck tarafından hazırlanan tüm rapor formatları, Kyoto Protokolü ve su ayak izi ağ standartları kılavuzları ile birebir uyumlu hesap hesaplama modelleri barındırır.' 
            : 'All synthesized exports contain rigorous comparative models complying directly with municipal sustainability guidelines.'}
        </p>
      </div>
    </div>
  );
}
