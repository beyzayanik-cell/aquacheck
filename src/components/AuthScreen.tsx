/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { LanguageOption, ThemeOption, UserProfile } from '../types';
import { Lock, Mail, Phone, User, Settings, Database, RefreshCw, Check } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInAnonymously,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthScreenProps {
  language: LanguageOption;
  theme: ThemeOption;
  colors: any;
  onLoginSuccess: (profile: UserProfile) => void;
}

export default function AuthScreen({ language, theme, colors, onLoginSuccess }: AuthScreenProps) {
  const t = TRANSLATIONS[language];
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
   const [loading, setLoading] = useState(false);
   const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('AQUACHECK_REMEMBER_ME') === 'true');
 
   // Form Fields
   const [username, setUsername] = useState('');
   const [fullname, setFullname] = useState('');
   const [email, setEmail] = useState(() => localStorage.getItem('AQUACHECK_REMEMBERED_EMAIL') || '');
   const [phone, setPhone] = useState('');
   const [password, setPassword] = useState(() => localStorage.getItem('AQUACHECK_REMEMBERED_PASSWORD') || '');
   const [passwordConfirm, setPasswordConfirm] = useState('');
   const [errors, setErrors] = useState<string>('');

  // Custom Firebase Connection Settings
  const [showDbSettings, setShowDbSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      const stored = localStorage.getItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG');
      return stored ? JSON.parse(stored).apiKey || '' : '';
    } catch { return ''; }
  });
  const [customProjectId, setCustomProjectId] = useState(() => {
    try {
      const stored = localStorage.getItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG');
      return stored ? JSON.parse(stored).projectId || '' : '';
    } catch { return ''; }
  });
  const [customDatabaseId, setCustomDatabaseId] = useState(() => {
    try {
      const stored = localStorage.getItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG');
      return stored ? JSON.parse(stored).firestoreDatabaseId || '' : '';
    } catch { return ''; }
  });

  const handleSaveCustomDb = () => {
    if (!customApiKey || !customProjectId) {
      alert(language === 'tr' ? 'Lütfen en az API Anahtarı (API Key) ve Proje Kimliği (Project ID) giriniz.' : 'Please enter at least an API Key and a Project ID.');
      return;
    }
    const config = {
      apiKey: customApiKey.trim(),
      projectId: customProjectId.trim(),
      firestoreDatabaseId: customDatabaseId.trim() || '(default)',
      authDomain: `${customProjectId.trim()}.firebaseapp.com`,
      storageBucket: `${customProjectId.trim()}.firebasestorage.app`
    };
    localStorage.setItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG', JSON.stringify(config));
    alert(language === 'tr' ? 'Bağlantı bilgileri kaydedildi! Uygulama kendi projenize bağlanmak üzere yeniden yüklenecektir.' : 'Connection details saved! The application will reload to connect to your project.');
    window.location.reload();
  };

  const handleResetCustomDb = () => {
    localStorage.removeItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG');
    alert(language === 'tr' ? 'Bağlantı varsayılan AI Studio projesine sıfırlandı. Uygulama yeniden yüklenecektir.' : 'Connection reset to the default AI Studio project. Reloading...');
    window.location.reload();
  };

  const isUsingCustomDb = !!localStorage.getItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setLoading(true);

    if (!email) {
      setErrors('Lütfen geçerli bir e-posta adresi girin.');
      setLoading(false);
      return;
    }
    if (!password) {
      setErrors('Lütfen şifrenizi girin.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        if (password !== passwordConfirm) {
          setErrors('Şifreler eşleşmiyor!');
          setLoading(false);
          return;
        }
        if (!username || !fullname) {
          setErrors('Lütfen tüm zorunlu alanları doldurun.');
          setLoading(false);
          return;
        }

        // 1. Create email/password user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;

        // 2. Generate and store their initial Profile in Firestore
        const profileData = {
          username: username.trim(),
          fullName: fullname.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim() || '+90 555 123 4567',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          dailyGoal: 150,
          level: 3,
          xp: 850,
          streak: 5,
          language: language,
          theme: theme,
          font: 'inter',
          notificationsEnabled: true,
          reminderInterval: 3600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', fbUser.uid), profileData);
        if (rememberMe) {
          localStorage.setItem('AQUACHECK_REMEMBER_ME', 'true');
          localStorage.setItem('AQUACHECK_REMEMBERED_EMAIL', email.trim());
          localStorage.setItem('AQUACHECK_REMEMBERED_PASSWORD', password);
        } else {
          localStorage.removeItem('AQUACHECK_REMEMBER_ME');
          localStorage.removeItem('AQUACHECK_REMEMBERED_EMAIL');
          localStorage.removeItem('AQUACHECK_REMEMBERED_PASSWORD');
        }
        onLoginSuccess(profileData);
      } else {
        // Log in using Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;

        // Fetch User profile doc from firestore
        const docRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(docRef);

        if (rememberMe) {
          localStorage.setItem('AQUACHECK_REMEMBER_ME', 'true');
          localStorage.setItem('AQUACHECK_REMEMBERED_EMAIL', email.trim());
          localStorage.setItem('AQUACHECK_REMEMBERED_PASSWORD', password);
        } else {
          localStorage.removeItem('AQUACHECK_REMEMBER_ME');
          localStorage.removeItem('AQUACHECK_REMEMBERED_EMAIL');
          localStorage.removeItem('AQUACHECK_REMEMBERED_PASSWORD');
        }

        if (docSnap.exists()) {
          onLoginSuccess(docSnap.data() as UserProfile);
        } else {
          // Fallback if record does not exist
          const fallback = {
            username: email.split('@')[0],
            fullName: 'Doğa Dostu',
            email: email,
            phone: '+90 555 123 4567',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            dailyGoal: 150,
            level: 3,
            xp: 850,
            streak: 5,
            language: language,
            theme: theme,
            font: 'inter',
            notificationsEnabled: true,
            reminderInterval: 3600,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(docRef, fallback);
          onLoginSuccess(fallback);
        }
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Kimlik doğrulama işlemi başarısız oldu.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Bu e-posta adresi zaten kullanımda.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Şifreniz çok zayıf (en az 6 karakter girin).';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Lütfen geçerli bir e-posta adresi girin.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Hatalı e-posta adresi veya şifre girildi.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'E-posta/Şifre kimlik doğrulaması yetkilendirilmemiş. Etkinleştirmek için:\n\n1. Firebase Konsoluna gidin (https://console.firebase.google.com)\n2. Sol menüden "Authentication" bölümüne tıklayın.\n3. "Sign-in method" sekmesine geçin.\n4. "Email/Password" (E-posta/Şifre) sağlayıcısını seçip "Enable" (Etkinleştir) seçeneğini işaretleyip Kaydedin.';
      } else {
        errorMsg = err.message || errorMsg;
      }
      setErrors(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleLogin = async () => {
    setErrors('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;

      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);

      let profile: UserProfile;
      if (docSnap.exists()) {
        profile = docSnap.data() as UserProfile;
      } else {
        profile = {
          username: fbUser.displayName?.toLowerCase().replace(/\s+/g, '_') || fbUser.email?.split('@')[0] || 'eko_kahraman',
          fullName: fbUser.displayName || 'Doğa Dostu',
          email: fbUser.email || 'eko.kahraman@gmail.com',
          phone: fbUser.phoneNumber || '+90 532 987 6543',
          photoUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          dailyGoal: 150
        };

        await setDoc(docRef, {
          ...profile,
          level: 3,
          xp: 850,
          streak: 5,
          language: language,
          theme: theme,
          font: 'inter',
          notificationsEnabled: true,
          reminderInterval: 3600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error(err);
      setErrors(err.message || 'Google ile giriş başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGithubLogin = async () => {
    setErrors('');
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;

      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);

      let profile: UserProfile;
      if (docSnap.exists()) {
        profile = docSnap.data() as UserProfile;
      } else {
        profile = {
          username: fbUser.displayName?.toLowerCase().replace(/\s+/g, '_') || fbUser.email?.split('@')[0] || 'eko_tasarrufcu_git',
          fullName: fbUser.displayName || 'Sürdürülebilir Geliştirici',
          email: fbUser.email || 'eko.dev@github.com',
          phone: fbUser.phoneNumber || '+90 541 222 3344',
          photoUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
          dailyGoal: 150
        };

        await setDoc(docRef, {
          ...profile,
          level: 3,
          xp: 850,
          streak: 5,
          language: language,
          theme: theme,
          font: 'inter',
          notificationsEnabled: true,
          reminderInterval: 3600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error(err);
      setErrors(err.message || 'GitHub ile giriş başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGuestLogin = async () => {
    setErrors('');
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const fbUser = userCredential.user;

      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);

      let profile: UserProfile;
      if (docSnap.exists()) {
        profile = docSnap.data() as UserProfile;
      } else {
        profile = {
          username: 'misafir_kullanici',
          fullName: language === 'tr' ? 'Konuk Kullanıcı' : 'Guest User',
          email: 'guest@aquacheck.org',
          phone: '+90 500 000 0000',
          photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          dailyGoal: 150
        };

        await setDoc(docRef, {
          ...profile,
          level: 3,
          xp: 850,
          streak: 5,
          language: language,
          theme: theme,
          font: 'inter',
          notificationsEnabled: true,
          reminderInterval: 3600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error(err);
      setErrors(err.message || 'Misafir girişi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setIsForgot(false);
      setErrors('Sıfırlama e-postası başarıyla gönderildi.');
    } catch (err: any) {
      console.error(err);
      setErrors(err.message || 'E-posta gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 animate-fade-in">
      <div 
        className="w-full max-w-md p-8 rounded-lg border backdrop-blur-2xl relative overflow-hidden transition-all duration-500"
        style={{ 
          backgroundColor: colors.cardBg, 
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Glow Element */}
        <div 
          className="absolute -top-[50%] -right-[50%] w-[150%] h-[150%] pointer-events-none rounded-full opacity-10 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)` }}
        />

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 mb-4 shadow-lg group">
            <span 
              className="text-3xl transition-transform duration-500 group-hover:scale-115"
              style={{ color: colors.secondary }}
            >
              💧
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: colors.textPrimary }}>
            {t.appTitle}
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: colors.textMuted }}>
            {t.appSubtitle}
          </p>
        </div>

        {/* Error Notice */}
        {errors && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium whitespace-pre-wrap">
            {errors}
          </div>
        )}

        {isForgot ? (
          // Forgot Password Flow
          <form onSubmit={handlePasswordResetRequest} className="space-y-5 relative z-10">
            <h3 className="text-xl font-bold text-center" style={{ color: colors.textPrimary }}>
              {t.forgotPassword}
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                {t.email}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full h-11 rounded-full font-bold text-sm transition-all flex items-center justify-center cursor-pointer"
              style={{ 
                backgroundColor: colors.primary, 
                color: colors.textPrimary,
                boxShadow: `0 8px 16px ${colors.primary}30`
              }}
            >
              Sıfırlama Bağlantısı Gönder
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setIsForgot(false)}
                className="text-xs font-semibold hover:underline"
                style={{ color: colors.secondary }}
              >
                Geri Dön
              </button>
            </div>
          </form>
        ) : (
          // Main Login / Register Layout
          <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
            {isRegister && (
              <>
                <div className="space-y-1.5 animate-slide-up">
                  <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                    {t.fullname}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </span>
                    <input 
                      type="text" 
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                    {t.username}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </span>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                      placeholder="surdurulebilir_kullanici"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                    {t.phone}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={18} />
                    </span>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                {t.email}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                  placeholder="example@domain.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                {t.password}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: colors.textMuted }}>
                  {t.passwordConfirm}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input 
                    type="password" 
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-full h-11 pl-11 pr-4 text-sm transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between mt-2 select-none">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: colors.textMuted }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-slate-950 accent-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer text-cyan-400"
                  />
                  <span>{language === 'tr' ? 'Beni Hatırla' : 'Remember Me'}</span>
                </label>
                
                <button 
                  type="button" 
                  onClick={() => setIsForgot(true)}
                  className="text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  style={{ color: colors.textMuted }}
                >
                  {t.forgotPassword}
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 rounded-full font-bold text-sm transition-all duration-300 mt-4 flex items-center justify-center cursor-pointer disabled:opacity-50"
              style={{ 
                backgroundColor: colors.primary, 
                color: colors.textPrimary,
                boxShadow: `0 8px 16px ${colors.primary}40`
              }}
            >
              {loading ? 'Yükleniyor...' : (isRegister ? t.signUp : t.login)}
            </button>

            {/* External Platform Logins */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                type="button" 
                onClick={triggerGoogleLogin}
                disabled={loading}
                className="h-11 rounded-full font-bold text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ color: colors.textPrimary }}
              >
                <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>
              <button 
                type="button" 
                onClick={triggerGithubLogin}
                disabled={loading}
                className="h-11 rounded-full font-bold text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ color: colors.textPrimary }}
              >
                <svg className="w-4 h-4 mr-0.5 fill-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Quick Guest Authentication access */}
            <button 
              type="button" 
              onClick={triggerGuestLogin}
              disabled={loading}
              className="w-full h-11 rounded-full font-black text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              🚀 {language === 'tr' ? 'MİSAFİR OLARAK DEVAM ET' : 'CONTINUE AS GUEST'}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={() => { setIsRegister(!isRegister); setErrors(''); }}
                className="text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: colors.secondary }}
              >
                {isRegister ? t.haveAccount : t.noAccount}
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Firebase Connection Link */}
        <div className="mt-8 pt-6 border-t border-white/5 relative z-10 text-center">
          <button
            type="button"
            onClick={() => setShowDbSettings(!showDbSettings)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-405 transition-colors cursor-pointer bg-transparent border-none"
          >
            <Settings size={14} className={showDbSettings ? 'rotate-90 transition-transform h-3.5 w-3.5' : 'transition-transform h-3.5 w-3.5'} />
            {isUsingCustomDb 
              ? (language === 'tr' ? 'Kendi Firebase Projeniz Bağlı' : 'Custom Firebase Connected')
              : (language === 'tr' ? 'Kendi Firebase Projeni Bağla (AquaCheck)' : 'Connect Your Own Firebase (AquaCheck)')}
          </button>
          
          {showDbSettings && (
            <div className="mt-4 text-left bg-black/40 border border-white/5 rounded-2xl p-4 animate-slide-up space-y-4">
              <div className="flex items-center gap-2 mb-1.5 label text-[10px] font-black uppercase text-cyan-350 tracking-widest">
                <Database size={12} className="text-cyan-400" />
                <span>{language === 'tr' ? 'Firebase Bağlantı Paneli' : 'Firebase Connection'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {language === 'tr' 
                  ? 'Burası AquaCheck Firebase projenizi (Email/Password ve Firestore önceden hazır olan) bağlamanızı sağlar.'
                  : 'Allows you to bypass constraints and connect your custom project with enabled login methods.'}
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">API KEY</label>
                  <input
                    type="text"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg h-9 px-3 text-xs focus:border-cyan-400 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">PROJECT ID</label>
                  <input
                    type="text"
                    value={customProjectId}
                    onChange={(e) => setCustomProjectId(e.target.value)}
                    placeholder="aquacheck-XXXXX"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg h-9 px-3 text-xs focus:border-cyan-400 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">DATABASE ID (OPTIONAL)</label>
                  <input
                    type="text"
                    value={customDatabaseId}
                    onChange={(e) => setCustomDatabaseId(e.target.value)}
                    placeholder="(default)"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg h-9 px-3 text-xs focus:border-cyan-400 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCustomDb}
                  className="flex-1 h-9 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <Check size={12} />
                  {language === 'tr' ? 'Bağlantıyı Kaydet' : 'Save Connection'}
                </button>
                {isUsingCustomDb && (
                  <button
                    type="button"
                    onClick={handleResetCustomDb}
                    className="h-9 w-9 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    title={language === 'tr' ? 'Varsayılana Dön' : 'Reset to Default'}
                  >
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
