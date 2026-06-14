import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, FontOption, UserProfile } from '../types';
import { 
  User, 
  Settings2, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  RefreshCw, 
  FileText, 
  Check, 
  BellRing, 
  Trash2, 
  Users,
  Lock,
  Globe,
  Type,
  ToggleLeft,
  ToggleRight,
  Shield,
  HelpCircle,
  Crown,
  LogOut,
  Target
} from 'lucide-react';

interface SettingsScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  font: FontOption;
  colors: any;
  user: UserProfile | null;
  notificationsEnabled: boolean;
  reminderInterval: number; // in seconds
  onSaveProfile: (profile: Partial<UserProfile>) => void;
  onSetLanguage: (lang: LanguageOption) => void;
  onSetTheme: (theme: ThemeOption) => void;
  onSetFont: (font: FontOption) => void;
  onToggleNotifications: () => void;
  onSetReminder: (seconds: number) => void;
  onExportData: () => void;
  onNavigate: (view: any) => void;
  onResetAllData: () => void;
  onLogout?: () => void;
}

const THEME_OPTIONS: { id: ThemeOption; labelTr: string; labelEn: string; color: string }[] = [
  { id: 'ocean', labelTr: 'Ocean Blue', labelEn: 'Ocean Blue', color: 'bg-blue-500' },
  { id: 'forest', labelTr: 'Forest Green', labelEn: 'Forest Green', color: 'bg-emerald-600' },
  { id: 'navy', labelTr: 'Midnight Navy', labelEn: 'Midnight Navy', color: 'bg-indigo-950' },
  { id: 'black', labelTr: 'Dark Black', labelEn: 'Dark Black', color: 'bg-black border border-slate-800' },
  { id: 'purple', labelTr: 'Purple Neon', labelEn: 'Purple Neon', color: 'bg-purple-600' },
  { id: 'pink', labelTr: 'Rose Pink', labelEn: 'Rose Pink', color: 'bg-pink-400' },
  { id: 'sunset', labelTr: 'Sunset Orange', labelEn: 'Sunset Orange', color: 'bg-orange-500' },
  { id: 'white', labelTr: 'Pure White', labelEn: 'Pure White', color: 'bg-slate-100 border border-slate-300' },
  { id: 'gray', labelTr: 'Arctic Gray', labelEn: 'Arctic Gray', color: 'bg-slate-500' },
  { id: 'emerald', labelTr: 'Emerald Deep', labelEn: 'Emerald Deep', color: 'bg-emerald-500' },
  { id: 'crimson', labelTr: 'Crimson Red', labelEn: 'Crimson Red', color: 'bg-red-600' },
  { id: 'gold', labelTr: 'Gold Luxury', labelEn: 'Gold Luxury', color: 'bg-amber-400' },
  { id: 'neon', labelTr: 'Cyber Neon', labelEn: 'Cyber Neon', color: 'bg-cyan-400' },
  { id: 'lavender', labelTr: 'Sweet Lavender', labelEn: 'Sweet Lavender', color: 'bg-violet-400' },
  { id: 'coffee', labelTr: 'Coffee Brown', labelEn: 'Coffee Brown', color: 'bg-yellow-800' },
  { id: 'carbon', labelTr: 'Dark Carbon', labelEn: 'Dark Carbon', color: 'bg-zinc-800' }
];

const FONT_OPTIONS: { id: FontOption; label: string }[] = [
  { id: 'poppins', label: 'Poppins' },
  { id: 'inter', label: 'Inter' },
  { id: 'roboto', label: 'Roboto' },
  { id: 'montserrat', label: 'Montserrat' },
  { id: 'opensans', label: 'Open Sans' },
  { id: 'nunito', label: 'Nunito' },
  { id: 'lato', label: 'Lato' },
  { id: 'merriweather', label: 'Merriweather' },
  { id: 'playfair', label: 'Playfair Display' },
  { id: 'ubuntu', label: 'Ubuntu' }
];

const LANG_OPTIONS: { id: LanguageOption; label: string; flag: string }[] = [
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'pt', label: 'Português', flag: '🇵🇹' },
  { id: 'ja', label: '日本語', flag: '🇯🇵' }
];

const REMINDER_INTERVALS = [
  { label: '10sn', seconds: 10 },
  { label: '30sn', seconds: 30 },
  { label: '1dk', seconds: 60 },
  { label: '5dk', seconds: 300 },
  { label: '30dk', seconds: 1800 },
  { label: '1saat', seconds: 3600 }
];

const SETTINGS_LOCALES: Record<string, Record<LanguageOption, string>> = {
  updateProfile: {
    tr: 'Profili Güncelle', en: 'Update Profile', de: 'Profil aktualisieren',
    es: 'Actualizar Perfil', ru: 'Обновить профиль', ar: 'تحديث الملف الشخصي',
    fr: 'Mettre à jour le profil', it: 'Aggiorna Profilo', pt: 'Atualizar Perfil', ja: 'プロフィール更新'
  },
  currentPassword: {
    tr: 'Mevcut Şifre', en: 'Current Password', de: 'Aktuelles Passwort',
    es: 'Contraseña Actual', ru: 'Текущий пароль', ar: 'كلمة المرور الحالية',
    fr: 'Mot de passe actuel', it: 'Password Corrente', pt: 'Senha Aktual', ja: '現在のパスワード'
  },
  newPassword: {
    tr: 'Yeni Şifre', en: 'New Password', de: 'Neues Passwort',
    es: 'Nueva Contraseña', ru: 'Новый пароль', ar: 'كلمة مرور جديدة',
    fr: 'Nouveau mot de passe', it: 'Nuova Password', pt: 'Nova Senha', ja: '新しいパスワード'
  },
  updatePassword: {
    tr: 'Şifreyi Güncelle', en: 'Update Password', de: 'Passwort aktualisieren',
    es: 'Actualizar Contraseña', ru: 'Обновить пароль', ar: 'تحديث كلمة المرور',
    fr: 'Mettre à jour le mot de passe', it: 'Aggiorna Password', pt: 'Atualizar Senha', ja: 'パスワードを変更'
  },
  inAppNotification: {
    tr: 'Uygulama İçi Bildirimler', en: 'In-App Notifications', de: 'In-App Benachrichtigungen',
    es: 'Notificaciones en la App', ru: 'Внутриигровые уведомления', ar: 'إشعارات داخل التطبيق',
    fr: 'Notifications intégrées à l\'application', it: 'Notifiche in-app', pt: 'Notificações no aplicativo', ja: 'アプリ内通知'
  },
  inAppNotificationDesc: {
    tr: 'Gereksiz su tüketimi uyarılarını anında ekrana yansıt.',
    en: 'Instantly display water consumption warnings on screen.',
    de: 'Wasserverbrauchswarnungen sofort auf dem Bildschirm anzeigen.',
    es: 'Mostrar advertencias de consumo de agua al instante en pantalla.',
    ru: 'Мгновенно выводить предупреждения о расходе воды на экран.',
    ar: 'عرض تحذيرات استهلاك المياه على الشاشة على الفور.',
    fr: 'Affichez instantanément les alertes de consommation d\'eau à l\'écran.',
    it: 'Mostra immediatamente sullo schermo gli avvisi sul consumo d\'acqua.',
    pt: 'Exibir avisos de consumo de água instantaneamente na tela.',
    ja: '水消費の警告を即座に画面に表示します。'
  },
  downloadJson: {
    tr: 'JSON Dosyasını İndir', en: 'Download JSON File', de: 'JSON-Datei herunterladen',
    es: 'Descargar Archivo JSON', ru: 'Скачать файл JSON', ar: 'تحميل ملف JSON',
    fr: 'Télécharger le fichier JSON', it: 'Scarica File JSON', pt: 'Baixar Arquivo JSON', ja: 'JSONファイルをダウンロード'
  },
  clearLocalData: {
    tr: 'Lokal Verileri Temizle', en: 'Clear Local Data', de: 'Lokale Daten löschen',
    es: 'Borrar Datos Locales', ru: 'Очистить локальные данные', ar: 'مسح البيانات المحلية',
    fr: 'Effacer les données locales', it: 'Cancella Dati Locali', pt: 'Limpar Dados Locais', ja: 'ローカルデータを消去する'
  },
  logoutConfirm: {
    tr: 'Mevcut oturumunuzu güvenli olarak sonlandırmak istiyor musunuz?',
    en: 'Are you sure you want to log out of your ecological session safely?',
    de: 'Möchten Sie Ihre ökologische Sitzung wirklich sicher abbrechen?',
    es: '¿Seguro que desea cerrar su sesión ecológica de forma segura?',
    ru: 'Вы уверены, что хотите выйти из своей экологической сессии безопасно?',
    ar: 'هل أنت متأكد من رغبتك في تسجيل الخروج من جلستك البيئية بأمان؟',
    fr: 'Êtes-vous sûr de vouloir vous déconnecter de votre session écologique en toute sécurité ?',
    it: 'Sei sicuro di voler effettuare il logout sicuro dalla sessione ecologica?',
    pt: 'Tem certeza que deseja encerrar sua sessão ecológica com segurança?',
    ja: 'エコロジーセッションから安全にログアウトしますか？'
  },
  logoutBtnText: {
    tr: 'Oturumu Kapat', en: 'Logout', de: 'Abmelden',
    es: 'Cerrar Sesión', ru: 'Выйти', ar: 'تسجيل الخروج',
    fr: 'Se déconnecter', it: 'Disconnettiti', pt: 'Sair da Conta', ja: 'ログアウト'
  }
};

export default function SettingsScreen({
  language,
  theme,
  font,
  colors,
  user,
  notificationsEnabled,
  reminderInterval,
  onSaveProfile,
  onSetLanguage,
  onSetTheme,
  onSetFont,
  onToggleNotifications,
  onSetReminder,
  onExportData,
  onNavigate,
  onResetAllData,
  onLogout
}: SettingsScreenProps) {
  const t = TRANSLATIONS[language];

  const [fullname, setFullname] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dailyGoal, setDailyGoal] = useState((user?.dailyGoal || 150).toString());
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  const [expandedSection, setExpandedSection] = useState<string | null>('profile');

  const toggleSection = (sec: string) => {
    setExpandedSection(prev => (prev === sec ? null : sec));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ fullName: fullname });
    triggerToast(TOASTS.profileUpdated[language] || TOASTS.profileUpdated.en);
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ email: email, phone: phone });
    triggerToast(TOASTS.accountSaved[language] || TOASTS.accountSaved.en);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(dailyGoal);
    onSaveProfile({ dailyGoal: isNaN(val) ? 150 : val });
    triggerToast(TOASTS.goalUpdated[language] || TOASTS.goalUpdated.en);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setOldPassword('');
    setNewPassword('');
    triggerToast(TOASTS.passwordUpdated[language] || TOASTS.passwordUpdated.en);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const menuHeaders: Record<string, Record<LanguageOption, string>> = {
    profile: {
      tr: '1. Profil Ayarları', en: '1. Profile Settings', de: '1. Profileinstellungen',
      es: '1. Configuración del Perfil', ru: '1. Настройки профиля', ar: '1. إعدادات الملف الشخصي',
      fr: '1. Paramètres du profil', it: '1. Impostazioni Profilo', pt: '1. Configurações do Perfil', ja: '1. プロフィール設定'
    },
    account: {
      tr: '2. Hesap Bilgileri', en: '2. Account Info', de: '2. Kontoinformationen',
      es: '2. Información de la Cuenta', ru: '2. Информация об аккаунте', ar: '2. معلومات الحساب',
      fr: '2. Informations du compte', it: '2. Informazioni Account', pt: '2. Informações da Conta', ja: '2. アカウント情報'
    },
    password: {
      tr: '3. Şifre Değiştir', en: '3. Change Password', de: '3. Kennwort ändern',
      es: '3. Cambiar Contraseña', ru: '3. Изменить пароль', ar: '3. تغيير كلمة المرور',
      fr: '3. Changer le mot de passe', it: '3. Cambia Password', pt: '3. Alterar Senha', ja: '3. パスワード変更'
    },
    lang: {
      tr: '4. Dil Seçenekleri (Language)', en: '4. Choose Language', de: '4. Sprache wählen',
      es: '4. Elegir Idioma', ru: '4. Выбор языка', ar: '4. اختيار اللغة',
      fr: '4. Choisir la langue', it: '4. Scegli Lingua', pt: '4. Escolher Idioma', ja: '4. 言語設定'
    },
    theme: {
      tr: '5. Sürdürülebilirlik Temaları', en: '5. Sustainability Themes', de: '5. Nachhaltigkeitsthemen',
      es: '5. Temas de Sostenibilidad', ru: '5. Экологические темы', ar: '5. مواضيع الاستدامة',
      fr: '5. Thèmes de durabilité', it: '5. Temi Sostenibilità', pt: '5. Temas de Sustentabilidade', ja: '5. テーマ設定'
    },
    font: {
      tr: '6. Uygulama Yazı Tipi', en: '6. Application Font', de: '6. Anwendungsschriftart',
      es: '6. Fuente de la Aplicación', ru: '6. Шрифт приложения', ar: '6. خط التطبيق',
      fr: '6. Police de l\'application', it: '6. Carattere Applicazione', pt: '6. Fonte do Aplicativo', ja: '6. フォント設定'
    },
    notif: {
      tr: '7. Bildirim Kontrolleri', en: '7. Notification Controls', de: '7. Benachrichtigungseinstellungen',
      es: '7. Controles de Notificación', ru: '7. Настройки уведомлений', ar: '7. عناصر التحكم في الإشعارات',
      fr: '7. Contrôles des notifications', it: '7. Controlli Notifica', pt: '7. Controles de Notificação', ja: '7. 通知設定'
    },
    reminds: {
      tr: '8. Akıllı Hatırlatıcılar', en: '8. Smart Reminders', de: '8. Intelligente Erinnerungen',
      es: '8. Recordatorios Inteligentes', ru: '8. Умные напоминания', ar: '8. تذكيرات ذكية',
      fr: '8. Rappels intelligents', it: '8. Promemoria Intelligenti', pt: '8. Lembretes Inteligentes', ja: '8. スマートリマインダー'
    },
    goal: {
      tr: '9. Günlük Tüketim Hedefi', en: '9. Daily Consumption Goal', de: '9. Tägliches Verbrauchsziel',
      es: '9. Meta de Consumo Diario', ru: '9. Ежедневная цель потребления', ar: '9. هدف الاستهلاك اليومي',
      fr: '9. Objectif de consommation quotidienne', it: '9. Obiettivo di Consumo Giornaliero', pt: '9. Meta de Consumo Diário', ja: '9. 1日の水目標設定'
    },
    privacy: {
      tr: '10. Gizlilik ve Güvenlik Sözleşmesi', en: '10. Privacy & Security', de: '10. Datenschutz & Sicherheit',
      es: '10. Privacidad y Seguridad', ru: '10. Конфиденциальность и безопасность', ar: '10. الخصوصية والأمان',
      fr: '10. Confidentialité et sécurité', it: '10. Privacy e Sicurezza', pt: '10. Privacidade e Segurança', ja: '10. プライバシーとセキュリティ'
    },
    about: {
      tr: '11. Uygulama Hakkında', en: '11. About Application', de: '11. Über die Anwendung',
      es: '11. Acerca de la Aplicación', ru: '11. О приложении', ar: '11. حول التطبيق',
      fr: '11. À propos de l\'application', it: '11. Informazioni sull\'App', pt: '11. Sobre o Aplicativo', ja: '11. アプリについて'
    },
    premium: {
      tr: '12. Premium Üyelik Avantajları', en: '12. Premium Benefits', de: '12. Premium-Vorteile',
      es: '12. Beneficios Premium', ru: '12. Преимущества Premium', ar: '12. مزايا بريميوم',
      fr: '12. Avantages Premium', it: '12. Vantaggi Premium', pt: '12. Benefícios Premium', ja: '12. プレミアム特典'
    },
    export: {
      tr: '13. Verileri Dışa Aktar / Yedekle', en: '13. Export / Backup Data', de: '13. Daten exportieren / sichern',
      es: '13. Exportar / Respaldar Datos', ru: '13. Exportar / Respaldar Datos', ar: '13. تصدير / نسخ احتياطي للبيانات',
      fr: '13. Exporter / Sauvegarder les données', it: '13. Esporta / Backup Dati', pt: '13. Exportar / Backup de Dados', ja: '13. データの書き出しとバックアップ'
    },
    logout: {
      tr: '14. Güvenli Çıkış (Logout)', en: '14. Safe Logout', de: '14. Sicher abmelden',
      es: '14. Cerrar Sesión Seguro', ru: '14. Безопасный выход', ar: '14. تسجيل خروج آمن',
      fr: '14. Déconnexion sécurisée', it: '14. Disconnessione Sicura', pt: '14. Logout Seguro', ja: '14. 安全なログアウト'
    }
  };

  const TOASTS: Record<string, Record<LanguageOption, string>> = {
    profileUpdated: {
      tr: 'Profil ismi güncellendi!', en: 'Profile name updated!', de: 'Profilname aktualisiert!',
      es: '¡Nombre de perfil actualizado!', ru: 'Имя профиля обновлено!', ar: 'تم تحديث اسم الملف الشخصي!',
      fr: 'Nom de profil mis à jour !', it: 'Nome profilo aggiornato!', pt: 'Nome de perfil atualizado!', ja: 'プロフィール名が更新されました！'
    },
    accountSaved: {
      tr: 'Hesap bilgileri başarıyla kaydedildi!', en: 'Account records stored!', de: 'Kontoinformationen erfolgreich gespeichert!',
      es: '¡Información de la cuenta guardada!', ru: 'Данные аккаунта сохранены!', ar: 'تم حفظ معلومات الحساب بنجاح!',
      fr: 'Informations de compte enregistrées !', it: 'Dati account salvati con successo!', pt: 'Informações da conta salvas com sucesso!', ja: 'アカウント情報が正常に保存されました！'
    },
    goalUpdated: {
      tr: 'Günlük tüketim hedefi güncellendi!', en: 'Daily goal limits set!', de: 'Tägliches Verbrauchsziel aktualisiert!',
      es: '¡Meta de consumo diario actualizada!', ru: 'Ежедневная цель потребления обновлена!', ar: 'تم تحديث هدف الاستهلاك اليومي!',
      fr: 'Objectif de consommation quotidienne mis à jour !', it: 'Obiettivo di consumo giornaliero aggiornato!', pt: 'Meta de consumo diário atualizada!', ja: '1日の目標値が更新されました！'
    },
    passwordUpdated: {
      tr: 'Şifreniz başarıyla gücellendi!', en: 'Password updated successfully!', de: 'Passwort erfolgreich aktualisiert!',
      es: '¡Contraseña actualizada con éxito!', ru: 'Пароль успешно обновлен!', ar: 'تم تحديث كلمة المرور بنجاح!',
      fr: 'Mot de passe mis à jour avec succès !', it: 'Password aggiornata con successo!', pt: 'Senha atualizada com sucesso!', ja: 'パスワードが正常に更新されました！'
    }
  };

  const settingsSubtitle: Record<LanguageOption, string> = {
    tr: 'AquaCheck kimliğinizi, temayı, dilleri ve akıllı bildirim frekanslarını tüm özellikleri ile kontrol edin.',
    en: 'Configure personalized water metrics, active aesthetic designs, security, and triggers.',
    de: 'Verwalten Sie Ihre AquaCheck-Identität, Designs, Sprachen und Benachrichtigungsfrequenzen.',
    es: 'Configure su identidad de AquaCheck, temas, idiomas y frecuencias de notificación.',
    ru: 'Управляйте данными аккаунта AquaCheck, темами, языками и частотой уведомлений.',
    ar: 'قم بتهيئة معرف AquaCheck ومواضيع التصميم واللغات وفترات التنبيه الذكية.',
    fr: 'Configurez votre profil AquaCheck, les thèmes, les langues et la fréquence des rappels.',
    it: 'Gestisci il tuo profilo AquaCheck, temi, lingue e frequenze di notifica.',
    pt: 'Configure sua identidade do AquaCheck, temas, idiomas e frequência de lembretes.',
    ja: 'AquaCheckのアカウント設定、テーマ、言語、リマインダー通知間隔を管理します。'
  };

  return (
    <div className="space-y-6 text-white animate-fade-in pb-16">
      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#00fbfb] text-slate-950 font-black shadow-lg shadow-cyan-400/20 text-xs animate-bounce">
          {toastMessage}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-1.5">
          <Settings2 size={18} className="text-[#00fbfb]" />
          {t.settings}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          {settingsSubtitle[language]}
        </p>
      </div>

      {/* Structured Accordion settings container block */}
      <div className="space-y-3">
        
        {/* 1. Profil panel */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('profile')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-cyan-400" />
              {menuHeaders.profile[language] || menuHeaders.profile.en}
            </span>
            {expandedSection === 'profile' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'profile' && (
            <div className="p-5 border-t border-white/5 bg-black/25 space-y-4 animate-slide-up">
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">{t.fullnameLabel}</span>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-full h-10 px-4 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Eko Kullanıcı"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider transition-all cursor-pointer"
                >
                  {SETTINGS_LOCALES.updateProfile[language]}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 2. Hesap Credentials */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('account')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-cyan-400" />
              {menuHeaders.account[language] || menuHeaders.account.en}
            </span>
            {expandedSection === 'account' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'account' && (
            <div className="p-5 border-t border-white/5 bg-black/25 space-y-4 animate-slide-up">
              <form onSubmit={handleUpdateAccount} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">{t.emailLabel}</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-full h-10 px-4 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">{t.phoneLabel}</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-full h-10 px-4 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t.applySave}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 3. Şifre Değiştir */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('password')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lock size={14} className="text-cyan-400" />
              {menuHeaders.password[language] || menuHeaders.password.en}
            </span>
            {expandedSection === 'password' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'password' && (
            <div className="p-5 border-t border-white/5 bg-black/25 space-y-4 animate-slide-up">
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">
                      {SETTINGS_LOCALES.currentPassword[language]}
                    </span>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-full h-10 px-4 text-xs focus:border-cyan-400 focus:outline-none text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">
                      {SETTINGS_LOCALES.newPassword[language]}
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-full h-10 px-4 text-xs focus:border-cyan-400 focus:outline-none text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider transition-all cursor-pointer"
                >
                  {SETTINGS_LOCALES.updatePassword[language]}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 4. Dil Seçenekleri */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('lang')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.lang.tr : menuHeaders.lang.en}
            </span>
            {expandedSection === 'lang' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'lang' && (
            <div className="p-5 border-t border-white/5 bg-black/25 animate-slide-up">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANG_OPTIONS.map((lOpt) => {
                  const isSelected = language === lOpt.id;
                  return (
                    <button
                      key={lOpt.id}
                      type="button"
                      onClick={() => onSetLanguage(lOpt.id)}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-400 bg-white/5 text-white' 
                          : 'border-white/5 bg-white/[0.01] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{lOpt.flag}</span>
                      <span>{lOpt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Temalar */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('theme')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings2 size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.theme.tr : menuHeaders.theme.en}
            </span>
            {expandedSection === 'theme' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'theme' && (
            <div className="p-5 border-t border-white/5 bg-black/25 animate-slide-up">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEME_OPTIONS.map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => onSetTheme(th.id)}
                      className={`p-2 rounded-lg border text-[10px] font-bold text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-400 bg-white/5 shadow-md' 
                          : 'border-white/15 bg-white/[0.01] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${th.color}`} />
                      <span className="truncate w-full block text-slate-300 font-semibold text-center mt-1">
                        {th.labelTr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6. Yazı Tipi */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('font')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Type size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.font.tr : menuHeaders.font.en}
            </span>
            {expandedSection === 'font' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'font' && (
            <div className="p-5 border-t border-white/5 bg-black/25 animate-slide-up">
              <div className="flex flex-wrap gap-1.5">
                {FONT_OPTIONS.map((fOption) => {
                  const isSelected = font === fOption.id;
                  return (
                    <button
                      key={fOption.id}
                      type="button"
                      onClick={() => onSetFont(fOption.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
                        isSelected 
                          ? 'bg-cyan-400 border-cyan-400 text-slate-950' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {fOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 7. Bildirimler */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('notif')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BellRing size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.notif.tr : menuHeaders.notif.en}
            </span>
            {expandedSection === 'notif' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'notif' && (
            <div className="p-5 border-t border-white/5 bg-black/25 flex items-center justify-between animate-slide-up">
              <div>
                <span className="text-xs font-extrabold block">Uygulama İçi Anlık Bildirim</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Gereksiz su tüketimi uyarılarını anında ekrana yansıt.</span>
              </div>
              <button
                type="button"
                onClick={onToggleNotifications}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          )}
        </div>

        {/* 8. Hatırlatıcılar */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('reminds')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BellRing size={14} className="text-cyan-400 animate-pulse" />
              {language === 'tr' ? menuHeaders.reminds.tr : menuHeaders.reminds.en}
            </span>
            {expandedSection === 'reminds' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'reminds' && (
            <div className="p-5 border-t border-white/5 bg-black/25 space-y-2 animate-slide-up">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.reminderFreq}</span>
              <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
                {REMINDER_INTERVALS.map((item) => {
                  const isSelected = reminderInterval === item.seconds;
                  return (
                    <button
                      key={item.seconds}
                      type="button"
                      onClick={() => onSetReminder(item.seconds)}
                      className={`px-3.5 py-1.5 rounded text-xs font-bold shrink-0 cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 9. Günlük Hedef */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('goal')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Target size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.goal.tr : menuHeaders.goal.en}
            </span>
            {expandedSection === 'goal' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'goal' && (
            <div className="p-5 border-t border-white/5 bg-black/25 space-y-3 animate-slide-up">
              <form onSubmit={handleSaveGoal} className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">{t.dailyGoalLiters}</span>
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-full h-10 px-4 text-xs font-semibold focus:border-cyan-400 focus:outline-none text-white"
                    placeholder="150"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider transition-all cursor-pointer"
                >
                  {language === 'tr' ? 'Hedefi Güncelle' : 'Update Goal Limit'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 10. Gizlilik */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('privacy')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Shield size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.privacy.tr : menuHeaders.privacy.en}
            </span>
            {expandedSection === 'privacy' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'privacy' && (
            <div className="p-5 border-t border-white/5 bg-black/25 text-xs text-slate-400 font-semibold leading-relaxed animate-slide-up space-y-2">
              <p>• {language === 'tr' ? 'Veri Güvencesi: Tüm su tüketim girdi kayıtlarınız yerel cihazınızın localStorage veri haznesinde güvenle saklanır, harici sunucularımıza izniniz dışında asla aktarılmaz.' : 'All water records are saved securely inside your offline local database directory only.'}</p>
              <p>• {language === 'tr' ? 'GDPR ve KVKK Kılavuzu: Haklarınızı her zaman saklı tutup Veri Sıfırlama butonu yardımı ile anında imha edebilirsiniz.' : 'You retain full access coordinates to purge, erase, or export database keys instantly.'}</p>
            </div>
          )}
        </div>

        {/* 11. Hakkında */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('about')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.about.tr : menuHeaders.about.en}
            </span>
            {expandedSection === 'about' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'about' && (
            <div className="p-5 border-t border-white/5 bg-black/25 text-xs text-slate-300 font-semibold leading-relaxed animate-slide-up space-y-1">
              <p><strong>Uygulama:</strong> AquaCheck Smart Water Tracker</p>
              <p><strong>Sürüm:</strong> v4.2.1-Premium Release</p>
              <p><strong>Mühendislik:</strong> Sustainable AI & Antigravity Labs Ltd.</p>
              <p><strong>Lisans:</strong> Apache 2.0 Open Source Ecosystem</p>
            </div>
          )}
        </div>

        {/* 12. Premium Avantajları */}
        <div className="border border-[#00fbfb]/30 bg-cyan-400/5 rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('premium')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-[#00fbfb] hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Crown size={14} className="text-amber-400 shrink-0" />
              {language === 'tr' ? menuHeaders.premium.tr : menuHeaders.premium.en}
            </span>
            {expandedSection === 'premium' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'premium' && (
            <div className="p-5 border-t border-white/5 bg-black/25 text-xs gap-3 flex flex-col sm:flex-row items-center justify-between animate-slide-up">
              <div>
                <span className="font-extrabold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Crown size={14} />
                  AQUACHECK VIP PREMİUM SÜRÜMÜ AKTİF!
                </span>
                <p className="text-slate-400 font-semibold leading-relaxed">Sınırsız yeni özel kategori tanımlama, gelişmiş yapay zeka asistanı ve 12 farklı dil paketi.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('premium')}
                className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
              >
                Yönet
              </button>
            </div>
          )}
        </div>

        {/* 13. Verileri Dışa Aktar */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('export')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Download size={14} className="text-cyan-400" />
              {language === 'tr' ? menuHeaders.export.tr : menuHeaders.export.en}
            </span>
            {expandedSection === 'export' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'export' && (
            <div className="p-5 border-t border-white/5 bg-black/25 flex flex-col sm:flex-row gap-2.5 animate-slide-up">
              <button
                type="button"
                onClick={() => { onExportData(); triggerToast(t.dataExported || 'Dışa aktarıldı!'); }}
                className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-full font-black text-[10px] tracking-wider uppercase transition-colors cursor-pointer"
              >
                JSON Dosyası İndir
              </button>
              
              <button
                type="button"
                onClick={onResetAllData}
                className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full font-bold text-[10px] tracking-wider uppercase transition-colors cursor-pointer border border-red-500/10"
              >
                Lokal Verileri Temizle
              </button>
            </div>
          )}
        </div>

        {/* 14. Güvenli Çıkış */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => toggleSection('logout')}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut size={14} className="text-red-400" />
              {language === 'tr' ? menuHeaders.logout.tr : menuHeaders.logout.en}
            </span>
            {expandedSection === 'logout' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandedSection === 'logout' && (
            <div className="p-5 border-t border-white/5 bg-black/25 text-xs text-center space-y-4 animate-slide-up">
              <p className="text-slate-400 font-bold leading-relaxed">{language === 'tr' ? 'Mevcut eko oturumunuzu güvenli bir biçimde sonlandırmak ister misiniz?' : 'Are you sure you want to log out safely?'}</p>
              <button
                type="button"
                onClick={onLogout}
                className="px-6 py-2 bg-red-400 hover:bg-red-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-widest transition-colors cursor-pointer inline-block"
              >
                OTURUMU KAPAT
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
