import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, WaterRecord } from '../types';
import { Save, Calendar, Clock, Plus, GlassWater, Sparkles, FolderPlus, Tag, Edit3, Trash2, RotateCcw } from 'lucide-react';

interface AddWaterProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  onAddRecord: (record: Omit<WaterRecord, 'id'>) => void;
  onNavigate: (view: any) => void;
}

const DEFAULT_CATEGORIES = [
  { id: 'shower', icon: '🚿', key: 'categoryShower', defaultLiters: 45 },
  { id: 'dish', icon: '🍽️', key: 'categoryDish', defaultLiters: 12 },
  { id: 'laundry', icon: '🧺', key: 'categoryLaundry', defaultLiters: 50 },
  { id: 'garden', icon: '🏡', key: 'categoryGarden', defaultLiters: 80 },
  { id: 'toilet', icon: '🚽', key: 'categoryToilet', defaultLiters: 6 },
  { id: 'kitchen', icon: '🍳', key: 'categoryKitchen', defaultLiters: 8 },
  { id: 'cleaning', icon: '🧹', key: 'categoryCleaning', defaultLiters: 20 },
  { id: 'carwash', icon: '🚗', key: 'categoryCarWash', defaultLiters: 90 },
  { id: 'pool', icon: '🏊', key: 'categoryPool', defaultLiters: 250 },
  { id: 'pet', icon: '🐾', key: 'categoryPet', defaultLiters: 4 },
  { id: 'drinking', icon: '🥛', key: 'categoryDrinking', defaultLiters: 2 },
  { id: 'other', icon: '❔', key: 'categoryOther', defaultLiters: 10 }
];

export default function AddWaterScreen({ language, colors, onAddRecord, onNavigate }: AddWaterProps) {
  const t = TRANSLATIONS[language];

  // Load either fully customized database or defaults
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('aquacheck_all_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CATEGORIES;
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [selectedCat, setSelectedCat] = useState('shower');
  const [liters, setLiters] = useState('45');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [note, setNote] = useState('');
  
  // Custom Category Creational forms 
  const [showAddCatForm, setShowAddCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('💧');
  const [newCatLiters, setNewCatLiters] = useState('15');

  // Category Edit and CRUD management flows
  const [isManageMode, setIsManageMode] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('💧');
  const [editCatLiters, setEditCatLiters] = useState('15');
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Helper method to set selected category and pull default liters
  const handleCategorySelect = (catId: string, defLiters: number) => {
    if (isManageMode) {
      // Open editor directly
      handleStartEditCategory(catId);
    } else {
      setSelectedCat(catId);
      setLiters(defLiters.toString());
    }
  };

  // Trigger creation of custom category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = 'custom_' + Date.now();
    const newCat = {
      id: newId,
      icon: newCatIcon,
      key: `custom_${newCatName}`,
      defaultLiters: parseFloat(newCatLiters) || 15,
      labelCustom: newCatName
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('aquacheck_all_categories', JSON.stringify(updated));

    // Select created category
    setSelectedCat(newId);
    setLiters(newCatLiters);

    // Reset controls
    setNewCatName('');
    setShowAddCatForm(false);
  };

  // Trigger loading values into edit category locks
  const handleStartEditCategory = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    setEditingCatId(catId);
    setEditCatName(cat.labelCustom || t[cat.key] || cat.id);
    setEditCatIcon(cat.icon);
    setEditCatLiters(cat.defaultLiters.toString());
    setShowDeleteConfirmId(null);
  };

  // Save the custom category edits
  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatName.trim()) return;

    const updated = categories.map(c => {
      if (c.id === editingCatId) {
        return {
          ...c,
          icon: editCatIcon,
          defaultLiters: parseFloat(editCatLiters) || 10,
          labelCustom: editCatName
        };
      }
      return c;
    });

    setCategories(updated);
    localStorage.setItem('aquacheck_all_categories', JSON.stringify(updated));
    setEditingCatId(null);

    // If current selected was updated, update default value loaded
    if (selectedCat === editingCatId) {
      setLiters(editCatLiters);
    }
  };

  // Perform deleting and state cleanses
  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    localStorage.setItem('aquacheck_all_categories', JSON.stringify(updated));
    setEditingCatId(null);
    setShowDeleteConfirmId(null);

    // Fallback selection to first match
    if (selectedCat === catId && updated.length > 0) {
      setSelectedCat(updated[0].id);
      setLiters(updated[0].defaultLiters.toString());
    }
  };

  // Reset categories to defaults
  const handleResetCategories = () => {
    if (window.confirm(language === 'tr' ? 'Kategorileri fabrika ayarlarına sıfırlamak istediğinize emin misiniz? Tüm düzenlemeler ve yeni oluşturulan kategoriler silinecektir.' : 'Are you sure you want to reset all categories to default factory parameters? This will restore initial set.')) {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('aquacheck_all_categories', JSON.stringify(DEFAULT_CATEGORIES));
      setSelectedCat('shower');
      setLiters('45');
      setEditingCatId(null);
      setIsManageMode(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(liters);
    if (isNaN(qty) || qty <= 0) return;

    onAddRecord({
      category: selectedCat,
      liters: qty,
      date,
      time,
      note
    });

    setNote('');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onNavigate('home');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-white">
      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-400/25 animate-bounce flex items-center gap-2 text-xs">
          <Sparkles size={16} />
          {t.saveSuccess || 'Kayıt başarıyla eklendi!'}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <GlassWater className="text-[#00fbfb]" size={20} />
            {t.addWaterRecord}
          </h2>
          <p className="text-xs mt-1 text-slate-400 font-semibold">
            {language === 'tr' 
              ? 'Tüketim kaynağını, miktarını ve zamanını tahmin ederek verinizi kaydedin.' 
              : 'Add water log with details, timeline parameters, and personalized notes.'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dynamic Category List Grid Selection */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] flex items-center gap-1.5">
              <Tag size={12} />
              {isManageMode 
                ? (language === 'tr' ? '🛠️ DÜZENLENECEK KATEGORİYİ SEÇİN' : '🛠️ SELECT CATEGORY TO EDIT') 
                : t.categoryLabel}
            </label>
            
            <div className="flex gap-2">
              {/* Reset Defaults button */}
              <button
                type="button"
                onClick={handleResetCategories}
                title={language === 'tr' ? 'Varsayılana Sıfırla' : 'Reset to Defaults'}
                className="p-1 px-2.5 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-all"
              >
                <RotateCcw size={10} />
                {language === 'tr' ? 'Sıfırla' : 'Reset'}
              </button>

              {/* Manage/Edit toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsManageMode(!isManageMode);
                  setEditingCatId(null);
                  setShowAddCatForm(false);
                }}
                className={`text-[10px] font-black uppercase tracking-widest border rounded-full px-3 py-1 flex items-center gap-1 cursor-pointer transition-all ${
                  isManageMode 
                    ? 'bg-amber-400 text-slate-950 border-amber-400 animate-pulse'
                    : 'text-slate-300 border-white/10 hover:bg-white/5'
                }`}
              >
                <Edit3 size={11} />
                {isManageMode 
                  ? (language === 'tr' ? 'DÜZENLEMEYİ KAPAT' : 'DONE EDITING') 
                  : (language === 'tr' ? 'YÖNET / DÜZENLE' : 'EDIT / MANAGE')}
              </button>

              {/* Add category button toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowAddCatForm(!showAddCatForm);
                  setIsManageMode(false);
                  setEditingCatId(null);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-400/20 rounded-full px-3 py-1 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus size={11} />
                {language === 'tr' ? 'Yeni Kategori' : '+ Add Category'}
              </button>
            </div>
          </div>

          {/* Editor Form for Selected Category */}
          {editingCatId && (
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Edit3 size={12} />
                  {language === 'tr' ? 'KATEGORİYİ DÜZENLE / GÜNCELLE' : 'EDIT CATEGORY SPECIFICATIONS'}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingCatId(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Kategori İsmi</label>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-full h-10 px-4 text-xs font-bold focus:border-amber-400 focus:outline-none text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Kategori İkonu</label>
                    <select
                      value={editCatIcon}
                      onChange={(e) => setEditCatIcon(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-full h-10 px-2 text-xs font-bold focus:border-amber-400 focus:outline-none text-white"
                    >
                      {['💧', '🚿', '🍽️', '🧺', '🏡', '🚽', '🍳', '🧹', '🚗', '🏊', '🐾', '🥛', '🐳', '🌿', '🛁', '🪣', '⚓'].map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Varsayılan LT</label>
                    <input
                      type="number"
                      value={editCatLiters}
                      onChange={(e) => setEditCatLiters(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-full h-10 px-3 text-xs font-bold focus:border-amber-400 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'Kaydet' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmId(editingCatId)}
                    className="h-10 w-10 shrink-0 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition-all cursor-pointer"
                    title={language === 'tr' ? 'Bu Kategoriyi Sil' : 'Delete Category'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  {language === 'tr' ? '* Değişiklikler tüm sisteme anında yansır.' : '* Values synchronize into calculations instantly.'}
                </div>
              </form>

              {/* Custom Inline deletion verification box */}
              {showDeleteConfirmId === editingCatId && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 mt-2 space-y-3">
                  <p className="font-semibold">
                    {language === 'tr' 
                      ? 'Bu kategoriyi silmek istediğinize emin misiniz? Bu kategoriye ait olan eski su verilerinizin istatistiksel hesapları silinmez ancak kategori türü filtrelenirken "Bilinmeyen" olarak görünebilir.' 
                      : 'Are you sure you want to delete this category? Past logs matching this tag will fall back into generalized statistics without losing data.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(editingCatId)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-black uppercase text-[10px] tracking-wider cursor-pointer"
                    >
                      {language === 'tr' ? 'Evet, Kategoriyi Sil' : 'Yes, Delete Tag'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmId(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                    >
                      {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Custom Category Form */}
          {showAddCatForm && (
            <div className="p-4 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-500/5 space-y-4 animate-slide-up">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {language === 'tr' ? 'YENİ ÖZEL KATEGORİ TANIMLA' : 'DEFINE CUSTOM CATEGORY'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Kategori Adı</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Örn: Akvaryum Temizliği"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-full px-4 h-9 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Simge (Emoji)</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-full px-2 h-9 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {['💧', '🚿', '🐳', '🌊', '🏡', '🐾', '🥛', '🧺', '🧼', '🌱', '🛁', '🪣', '🦎', '⚓', '🚗', '🏊', '🍳'].map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Varsayılan (LT)</label>
                    <input
                      type="number"
                      value={newCatLiters}
                      onChange={(e) => setNewCatLiters(e.target.value)}
                      placeholder="Örn: 15"
                      className="w-full bg-slate-900/60 border border-white/10 rounded-full px-3 h-9 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="w-full h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-all cursor-pointer"
                  >
                    {language === 'tr' ? 'Kategoriyi Ekle' : 'Insert Category'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rendering the active category list */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCat === cat.id;
              // Handle category translation name lookup:
              let dName = cat.labelCustom;
              if (!dName) {
                dName = t[cat.key] || cat.id;
              }
              
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id, cat.defaultLiters)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group cursor-pointer ${
                    isSelected 
                      ? 'scale-[1.03] border-[#00fbfb] bg-[#00fbfb]/10 shadow-[0_0_15px_rgba(0,251,251,0.1)]' 
                      : isManageMode
                      ? 'border-amber-400/30 bg-amber-400/5 hover:border-amber-400'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                  }`}
                >
                  {/* Mini Pen icons if in manager state */}
                  {isManageMode && (
                    <span className="absolute top-1 right-1 text-[8px] bg-amber-400 text-slate-950 p-0.5 rounded-full flex items-center justify-center scale-90">
                      <Edit3 size={8} />
                    </span>
                  )}
                  <span className="text-xl select-none">{cat.icon}</span>
                  <span 
                    className="text-[10px] font-black text-center truncate w-full uppercase tracking-tight"
                    style={{ color: isSelected ? '#00fbfb' : isManageMode ? '#fbbf24' : '#94a3b8' }}
                  >
                    {dName}
                  </span>
                  <span className="text-[8px] font-mono opacity-50 block text-slate-400">
                    {cat.defaultLiters} L
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Liters quantity, date, and timeline pickers */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="rounded-xl border border-white/5 p-4 bg-white/[0.01] space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] block">
                {t.literLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <GlassWater size={16} className="text-[#00fbfb]" />
                </span>
                <input 
                  type="number"
                  step="any"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 focus:border-[#00fbfb] focus:outline-none rounded-full h-11 pl-10 pr-12 font-black text-sm text-white"
                  placeholder="45"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-500">
                  LT
                </span>
              </div>

              {/* Quick selectors */}
              <div className="flex gap-1.5 mt-2">
                {[5, 20, 50, 100].map((addVal) => (
                  <button
                    key={addVal}
                    type="button"
                    onClick={() => setLiters(addVal.toString())}
                    className="flex-1 py-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    +{addVal}L
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/5 p-4 bg-gradient-to-r from-cyan-450/10 to-indigo-500/10 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] block flex items-center gap-1.5">
                <span>📅</span>
                <span>{language === 'tr' ? 'KAYIT TARİHİ' : 'RECORD DATE'}</span>
              </label>
              <div className="relative">
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white text-slate-950 border border-transparent focus:outline-none rounded-xl h-11 px-4 text-sm font-black transition-colors focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/5 p-4 bg-white/[0.01] space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                {language === 'tr' ? 'KAYIT SAATİ' : 'RECORD TIME'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Clock size={16} />
                </span>
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 focus:border-[#00fbfb] focus:outline-none rounded-full h-11 pl-10 pr-4 text-xs font-bold text-white transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes (Not) component in exact Turkish translation */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              {t.noteLabel}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-black/20 border border-white/5 focus:border-[#00fbfb] focus:outline-none rounded-xl p-3 text-xs text-white transition-colors resize-none placeholder-slate-600 font-semibold"
              placeholder={language === 'tr' ? 'Bir not yazarak kaydedin...' : 'Attach a descriptive statement with this usage...'}
            />
          </div>

          {/* Register Water usage */}
          <button
            type="submit"
            className="w-full h-12 rounded-full font-black text-xs uppercase tracking-widest text-slate-950 bg-[#00fbfb] hover:bg-cyan-400 shadow-md shadow-cyan-400/20 flex items-center justify-center gap-2 duration-300 cursor-pointer animate-fade-in"
          >
            <Save size={14} />
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
}
