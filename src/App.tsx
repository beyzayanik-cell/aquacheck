/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TRANSLATIONS } from './constants/translations';
import { 
  UserProfile, 
  ThemeOption, 
  FontOption, 
  LanguageOption, 
  WaterRecord, 
  Badge, 
  Mission, 
  Friend, 
  ChatMessage 
} from './types';
import { THEMES, getFontFamily } from './components/ThemeStyles';
import { generateStarterRecords } from './utils/mockData';

// Firebase Authentication & Firestore imports
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, deleteDoc } from 'firebase/firestore';

// Import Modular Screen Components
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import AddWaterScreen from './components/AddWaterScreen';
import HistoryScreen from './components/HistoryScreen';
import StatsScreen from './components/StatsScreen';
import PlantScreen from './components/PlantScreen';
import DamsScreen from './components/DamsScreen';
import ChatAssistant from './components/ChatAssistant';
import PredictionScreen from './components/PredictionScreen';
import SocialScreen from './components/SocialScreen';
import SettingsScreen from './components/SettingsScreen';
import PremiumScreen from './components/PremiumScreen';
import ProfileScreen from './components/ProfileScreen';
import EnvironmentalScreen from './components/EnvironmentalScreen';
import AchievementsScreen from './components/AchievementsScreen';
import ReportsScreen from './components/ReportsScreen';
import AquaBotAI from './components/AquaBotAI';
import CongratsModal from './components/CongratsModal';
import DroughtMapScreen from './components/DroughtMapScreen';

// Core Lucide Icons for responsive side navigation (desktop) and footer bars (mobile)
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Sprout, 
  Settings, 
  History, 
  Bot, 
  HelpCircle, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Crown, 
  LogOut, 
  Menu, 
  X,
  MapPin,
  Map,
  Waves,
  BellRing,
  Award,
  FileText,
  Leaf,
  User
} from 'lucide-react';

// Default starter water logs for stats & visual charts on first view
const STARTER_RECORDS: WaterRecord[] = [
  { id: 'start1', category: 'shower', liters: 45, date: new Date().toISOString().split('T')[0], time: '08:30', note: 'Sabah duşu tazyikli' },
  { id: 'start2', category: 'toilet', liters: 9, date: new Date().toISOString().split('T')[0], time: '09:00', note: 'Rezervuar' },
  { id: 'start3', category: 'kitchen', liters: 8, date: new Date().toISOString().split('T')[0], time: '13:00', note: 'Öğle yemeği hazırlığı ve temizlik' },
  { id: 'start4', category: 'dish', liters: 12, date: new Date().toISOString().split('T')[0], time: '14:30', note: 'Bulaşık makinesi doluyken çalıştırıldı' },
  { id: 'start5', category: 'laundry', liters: 50, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '16:00', note: 'Eko çamaşır modu' },
  { id: 'start6', category: 'garden', liters: 80, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], time: '19:30', note: 'Bahçe sulama akşam' }
];

const STARTER_FRIENDS: Friend[] = [
  { id: 'f1', name: 'Ayşe Teyze (Annem)', rank: 1, score: 980 },
  { id: 'f2', name: 'Ahmet (Kardeşim)', rank: 2, score: 720 },
  { id: 'f3', name: 'Doğa Dostu (Siz)', rank: 3, score: 450, isMe: true },
  { id: 'f4', name: 'Hakan (Amcam)', rank: 4, score: 320 }
];

export default function App() {
  // Authentication & cloud loaders
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Main list records
  const [records, setRecords] = useState<WaterRecord[]>([]);

  // Global settings state parameters
  const [language, setLanguage] = useState<LanguageOption>('tr');
  const [theme, setTheme] = useState<ThemeOption>('ocean');
  const [font, setFont] = useState<FontOption>('inter');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [reminderInterval, setReminderInterval] = useState<number>(3600);

  // Active modular subpage panel router
  const [activeView, setActiveView] = useState<'home' | 'add' | 'stats' | 'plant' | 'settings' | 'history' | 'dams' | 'chat' | 'social' | 'premium' | 'prediction' | 'profile' | 'environmental' | 'achievements' | 'badges' | 'reports' | 'auth' | 'droughtMap'>('home');

  // Gamification Plant, XP and levels
  const [plantState, setPlantState] = useState({ level: 3, xp: 850, streak: 5 });
  const [userProgression, setUserProgression] = useState({ level: 3, xp: 450 });

  const [congratsModal, setCongratsModal] = useState({
    isOpen: false,
    type: 'badge' as 'badge' | 'level',
    title: '',
    description: '',
    icon: '',
    xpReward: 0
  });

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [missions, setMissions] = useState<Mission[]>([
    { id: 'm1', titleKey: 'missionSifon', xpReward: 50, completed: false, progress: 0, target: 1, status: 'not_started' },
    { id: 'm2', titleKey: 'missionGarden', xpReward: 100, completed: true, progress: 1, target: 1, status: 'completed' },
    { id: 'm3', titleKey: 'missionShower', xpReward: 150, completed: false, progress: 3, target: 5, status: 'in_progress' },
    { id: 'm4', titleKey: 'missionEco', xpReward: 200, completed: false, progress: 88, target: 90, status: 'in_progress' }
  ]);

  const [badges, setBadges] = useState<Badge[]>([
    { id: 'b1', titleKey: 'suKahramani', descKey: 'suKahramaniDesc', icon: '🐳', unlockedAt: new Date().toISOString() },
    { id: 'b2', titleKey: 'cevreDostu', descKey: 'cevreDostuDesc', icon: '☘️', unlockedAt: new Date().toISOString() },
    { id: 'b3', titleKey: 'tasarrufUstasi', descKey: 'tasarrufUstasiDesc', icon: '🏅' },
    { id: 'b4', titleKey: 'kuraklikSavascisi', descKey: 'kuraklikSavascisiDesc', icon: '🛡️' },
    { id: 'b5', titleKey: 'yeşilDunyaElcisi', descKey: 'yeşilDunyaElcisiDesc', icon: '🌍' },
    // 8 New Badges from AquaCheck v2.0
    { id: 'b_ilk_damla', titleKey: '💧 İlk Damla', descKey: 'İlk su kaydı oluşturuldu.', icon: '💧' },
    { id: 'b_filiz', titleKey: '🌱 Filiz Koruyucusu', descKey: 'İlk bitki yetiştirildi.', icon: '🌱' },
    { id: 'b_doga_dostu', titleKey: '🌳 Doğa Dostu', descKey: '1000 litre tasarruf sağlandı.', icon: '🌳' },
    { id: 'b_gezegen', titleKey: '🌍 Gezegen Koruyucusu', descKey: '5000 litre tasarruf sağlandı.', icon: '🌍' },
    { id: 'b_baraj', titleKey: '🏞️ Baraj Gözlemcisi', descKey: '30 gün boyunca baraj takibi yapıldı.', icon: '🏞️' },
    { id: 'b_tasarruf_ustasi', titleKey: '🔥 Tasarruf Ustası', descKey: '7 gün üst üste hedef tutturuldu.', icon: '🔥' },
    { id: 'b_hizli', titleKey: '⚡ Hızlı Gelişim', descKey: 'Bitki 5 seviye büyütüldü.', icon: '⚡' },
    { id: 'b_efsane', titleKey: '🏆 AquaCheck Efsanesi', descKey: 'Tüm rozetler toplandı.', icon: '🏆' }
  ]);

  const [friends, setFriends] = useState<Friend[]>(STARTER_FRIENDS);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Reminders / Alerts system simulator
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Memoized total water savings for gamification & city boards
  const totalSaving = useMemo(() => {
    let showerSaved = 0;
    let dishSaved = 0;
    let gardenSaved = 0;
    let kitchenSaved = 0;
    records.forEach(r => {
      if (r.category === 'shower' && r.liters < 40) showerSaved += (40 - r.liters);
      else if (r.category === 'dish' && r.liters < 12) dishSaved += (12 - r.liters);
      else if (r.category === 'garden' && r.liters < 50) gardenSaved += (50 - r.liters);
      else if (r.category === 'kitchen' && r.liters < 10) kitchenSaved += (10 - r.liters);
    });
    return (showerSaved || 420) + (dishSaved || 190) + (gardenSaved || 850) + (kitchenSaved || 340);
  }, [records]);

  // Firestore Sync Helper
  const syncStateToFirestore = async (fields: any) => {
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), fields);
      } catch (err) {
        console.error('Error syncing state properties:', err);
      }
    }
  };

  // Auth & Firestore State Handlers (Real persistent syncing)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.language) setLanguage(data.language);
            if (data.theme) setTheme(data.theme);
            if (data.font) setFont(data.font);
            if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
            if (data.reminderInterval) setReminderInterval(data.reminderInterval);
            if (data.plantState) setPlantState(data.plantState);
            if (data.userProgression) setUserProgression(data.userProgression);
            if (data.badges) setBadges(data.badges);
            
            setUser({
              username: data.username || fbUser.email?.split('@')[0] || 'kullanici',
              fullName: data.fullName || 'Doğa Dostu',
              email: data.email || fbUser.email || '',
              phone: data.phone || '',
              photoUrl: data.photoUrl || fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              dailyGoal: data.dailyGoal || 150
            });
          } else {
            // First time signup trigger
            const defaultProfile = {
              username: fbUser.displayName?.toLowerCase().replace(/\s+/g, '_') || fbUser.email?.split('@')[0] || 'eko_kullanici',
              fullName: fbUser.displayName || (fbUser.isAnonymous ? 'Konuk Kullanıcı' : 'Doğa Dostu'),
              email: fbUser.email || 'guest@aquacheck.org',
              phone: fbUser.phoneNumber || '',
              photoUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              dailyGoal: 150,
              level: 3,
              xp: 850,
              streak: 5,
              language: 'tr',
              theme: 'ocean',
              font: 'inter',
              notificationsEnabled: true,
              reminderInterval: 3600,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, defaultProfile);
            setUser({
              username: defaultProfile.username,
              fullName: defaultProfile.fullName,
              email: defaultProfile.email,
              phone: defaultProfile.phone,
              photoUrl: defaultProfile.photoUrl,
              dailyGoal: defaultProfile.dailyGoal
            });
          }

          // Real-time Water Records sync
          const recsRef = collection(db, 'users', fbUser.uid, 'records');
          const unsubRecs = onSnapshot(recsRef, (snapshot) => {
            const fbRecords: WaterRecord[] = [];
            snapshot.forEach((snap) => {
              fbRecords.push({ id: snap.id, ...snap.data() } as WaterRecord);
            });

            if (fbRecords.length === 0) {
              const baseStarter = [...generateStarterRecords(), ...STARTER_RECORDS];
              baseStarter.forEach(async (r) => {
                const { id, ...cleaned } = r;
                await setDoc(doc(db, 'users', fbUser.uid, 'records', id), cleaned);
              });
            } else {
              fbRecords.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
              setRecords(fbRecords);
            }
          });

          setLoadingAuth(false);
          return () => unsubRecs();
        } catch (error) {
          console.error("Firestore loading routine error:", error);
          setLoadingAuth(false);
        }
      } else {
        setUser(null);
        setRecords([]);
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Award XP routine
  const awardUserXp = (amount: number, reasonTr: string, reasonEn: string) => {
    setUserProgression(prev => {
      let newXp = prev.xp + amount;
      let oldLvl = prev.level;
      
      let requiredXp = 1000;
      if (oldLvl >= 100) requiredXp = 10000;
      else if (oldLvl >= 50) requiredXp = 6000;
      else if (oldLvl >= 20) requiredXp = 4000;
      else if (oldLvl >= 10) requiredXp = 2500;
      else if (oldLvl >= 5) requiredXp = 1500;

      let newLvl = oldLvl;
      if (newXp >= requiredXp) {
        newXp -= requiredXp;
        newLvl += 1;
        
        const lvlTitle = getTitleForLevel(newLvl);
        setCongratsModal({
          isOpen: true,
          type: 'level',
          title: language === 'tr' ? `Seviye ${newLvl}: ${lvlTitle}` : `Level ${newLvl}: ${lvlTitle}`,
          description: language === 'tr' 
            ? `Tebrikler! Sürdürülebilirlik yolculuğunda yeni bir seviyeye ulaştınız.` 
            : `Outstanding! You reached a new sustainable progression peak.`,
          icon: '⭐',
          xpReward: amount
        });
      } else {
        setSystemAlertMessage(`✨ +${amount} XP: ${language === 'tr' ? reasonTr : reasonEn}`);
      }
      return { level: newLvl, xp: newXp };
    });
  };

  const getTitleForLevel = (lvl: number) => {
    if (lvl >= 100) return language === 'tr' ? 'Sürdürülebilirlik Efsanesi' : 'Stewardship Legend';
    if (lvl >= 50) return 'AquaMaster';
    if (lvl >= 20) return language === 'tr' ? 'Su Koruyucusu' : 'Water Guardian';
    if (lvl >= 10) return language === 'tr' ? 'Çevre Dostu' : 'Eco-Friendly';
    if (lvl >= 5) return language === 'tr' ? 'Tasarruf Meraklısı' : 'Conservation Hobbyist';
    return language === 'tr' ? 'Yeni Başlayan' : 'Water Novice';
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => {
      const idx = prev.findIndex(b => b.id === badgeId);
      if (idx !== -1 && !prev[idx].unlockedAt) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          unlockedAt: new Date().toISOString()
        };
        
        setCongratsModal({
          isOpen: true,
          type: 'badge',
          title: updated[idx].titleKey,
          description: updated[idx].descKey,
          icon: updated[idx].icon,
          xpReward: 500
        });

        awardUserXp(500, `Rozet Kazanıldı: ${updated[idx].titleKey}`, `Badge Unlocked: ${updated[idx].titleKey}`);
        return updated;
      }
      return prev;
    });
  };

  // Automated Badge Trigger Checking
  useEffect(() => {
    if (records.length > 0) {
      unlockBadge('b_ilk_damla');
    }
  }, [records]);

  useEffect(() => {
    let showerSaved = 0;
    let dishSaved = 0;
    let gardenSaved = 0;
    let kitchenSaved = 0;
    records.forEach(r => {
      if (r.category === 'shower' && r.liters < 40) showerSaved += (40 - r.liters);
      else if (r.category === 'dish' && r.liters < 12) dishSaved += (12 - r.liters);
      else if (r.category === 'garden' && r.liters < 50) gardenSaved += (50 - r.liters);
      else if (r.category === 'kitchen' && r.liters < 10) kitchenSaved += (10 - r.liters);
    });
    const totalSaving = (showerSaved || 420) + (dishSaved || 190) + (gardenSaved || 850) + (kitchenSaved || 340);
    if (totalSaving >= 5000) {
      unlockBadge('b_gezegen');
    }
    if (totalSaving >= 1000) {
      unlockBadge('b_doga_dostu');
    }

    // 🌱 b_filiz: Filiz Koruyucusu (First plant growth tracked/saved)
    if (plantState.level >= 2 || plantState.xp > 50) {
      unlockBadge('b_filiz');
    }

    // ⚡ b_hizli: Hızlı Gelişim (Plant grown to level 5)
    if (plantState.level >= 5) {
      unlockBadge('b_hizli');
    }

    // 🔥 b_tasarruf_ustasi: Tasarruf Ustası (Streak >= 7)
    if (plantState.streak >= 7) {
      unlockBadge('b_tasarruf_ustasi');
    }

    // 🏞️ b_baraj: Baraj Gözlemcisi (Visiting the drought / hydrology map)
    if (activeView === 'droughtMap' || activeView === 'dams') {
      unlockBadge('b_baraj');
    }

    // 🏆 b_efsane: AquaCheck Efsanesi (All other 7 badges unlocked)
    const unlockedCount = badges.filter(b => b.id.startsWith('b_') && b.id !== 'b_efsane' && b.unlockedAt).length;
    if (unlockedCount >= 7) {
      unlockBadge('b_efsane');
    }
  }, [records, plantState.level, plantState.xp, plantState.streak, activeView]);



  // Centralized background syncing of profile fields when properties mutate
  useEffect(() => {
    if (!loadingAuth && auth.currentUser) {
      syncStateToFirestore({
        language,
        theme,
        font,
        notificationsEnabled,
        reminderInterval,
        plantState,
        userProgression,
        badges
      });
    }
  }, [language, theme, font, notificationsEnabled, reminderInterval, plantState, userProgression, badges, loadingAuth]);

  // Alarms timers simulator
  useEffect(() => {
    if (!notificationsEnabled) return;

    const alarmMessages = [
      '💧 Bugün su içmeyi ve hedefini kontrol almayı unutma!',
      '🌱 Çiçeğin can suyunu vermeyi ve günlük görevleri tamamlamayı unutma!',
      '🚨 Baraj seviyeleri kritik sınırda, musluğu gereksiz açık bırakma!',
      '🌍 Çevre için su tüketimini %15 azaltarak ormanlarını koruyabilirsin.'
    ];

    const timer = setInterval(() => {
      const randMsg = alarmMessages[Math.floor(Math.random() * alarmMessages.length)];
      setSystemAlertMessage(randMsg);
      // Automatically clear after 6 seconds
      setTimeout(() => {
        setSystemAlertMessage(null);
      }, 6000);
    }, reminderInterval * 1000); // Trigger reminder as seconds for speed and reviews

    return () => clearInterval(timer);
  }, [reminderInterval, notificationsEnabled]);

  // Handlers
  const handleLoginProgress = (newProfile: UserProfile) => {
    setUser(newProfile);
    setActiveView('home');
  };

  const handleAddRecord = async (record: Omit<WaterRecord, 'id'>) => {
    if (!auth.currentUser) return;
    const recordId = 'rec_' + Date.now();
    const newRec: WaterRecord = {
      ...record,
      id: recordId
    };

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'records', recordId), newRec);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `/users/${auth.currentUser.uid}/records/${recordId}`);
    }

    // Track original plant system level-ups
    setPlantState(prev => {
      let newXp = prev.xp + 100;
      let newLvl = prev.level;
      if (newXp >= 2000 && newLvl < 8) {
         newXp -= 2000;
         newLvl += 1;
         // Prompt congrats for plant level update
         setTimeout(() => {
           setCongratsModal({
             isOpen: true,
             type: 'level',
             title: language === 'tr' ? `🌱 Sanal Çiçeğiniz Büyüdü!` : `🌱 Plant Level Up!`,
             description: language === 'tr' 
               ? `Tebrikler! Çiçeğiniz başarıyla ${newLvl}. gelişim aşamasına ulaştı.` 
               : `Congrats! Your custom flora reached development stage ${newLvl}.`,
             icon: '🌿',
             xpReward: 300
           });
         }, 300);
      }
      return { ...prev, xp: newXp, level: newLvl };
    });

    // Track professional Level XP System
    awardUserXp(120, 'Su Tüketim Girişi Yapıldı', 'Water log created');
  };

  const handleDeleteRecord = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'records', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `/users/${auth.currentUser.uid}/records/${id}`);
    }
  };

  const handleWaterPlantManual = () => {
    // Legacy Plant XP
    let oldLvl = plantState.level;
    setPlantState(prev => {
      let newXp = prev.xp + 150;
      let newLvl = prev.level;
      if (newXp >= 2000 && newLvl < 8) {
        newXp -= 2000;
        newLvl += 1;
        
        setTimeout(() => {
          setCongratsModal({
            isOpen: true,
            type: 'level',
            title: language === 'tr' ? `🌱 Sanal Çiçeğiniz Büyüdü!` : `🌱 Plant Level Up!`,
            description: language === 'tr' 
              ? `Tebrikler! Çiçeğiniz başarıyla ${newLvl}. gelişim aşamasına ulaştı.` 
              : `Congrats! Your custom flora reached development stage ${newLvl}.`,
            icon: '🌿',
            xpReward: 300
          });
        }, 100);
      }
      return { ...prev, xp: newXp, level: newLvl };
    });

    // Check fast growth badge (b_hizli)
    if (plantState.level >= 5) {
      unlockBadge('b_hizli');
    }

    // Professional Level System XP
    awardUserXp(150, 'Sanal Çiçek Sulandı', 'Watered virtual plant');
  };

  const handleUpdateMissionStatus = (id: string, status: 'not_started' | 'in_progress' | 'completed') => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        let isPreviouslyCompleted = m.completed;
        let markCompleted = status === 'completed';
        
        if (markCompleted && !isPreviouslyCompleted) {
          // Legacy XP
          setPlantState(ps => {
            let newXp = ps.xp + m.xpReward;
            let newLvl = ps.level;
            if (newXp >= 2000 && newLvl < 8) {
              newXp -= 2000;
              newLvl += 1;
            }
            return { ...ps, xp: newXp, level: newLvl };
          });

          // Professional Level System XP
          awardUserXp(m.xpReward, `Milli Görev Tamamlandı: ${m.titleKey}`, `Eco task complete: ${m.titleKey}`);
          
          setSystemAlertMessage(language === 'tr' ? `🎯 Görev Tamamlandı! +${m.xpReward} Deneyim Puanı (XP) kazandınız!` : `🎯 Mission Completed! You gained +${m.xpReward} Experience Points (XP)!`);
        }

        return { 
          ...m, 
          status, 
          completed: markCompleted, 
          progress: markCompleted ? m.target : m.progress 
        };
      }
      return m;
    }));
  };

  const handleGenerateNewMissions = () => {
    const missionPool = [
      { titleKey: 'missionSifon', xpReward: 50, target: 1 },
      { titleKey: 'missionGarden', xpReward: 100, target: 1 },
      { titleKey: 'missionShower', xpReward: 150, target: 3 },
      { titleKey: 'missionEco', xpReward: 200, target: 90 },
      { titleKey: 'missionBulasik', xpReward: 80, target: 1 },
      { titleKey: 'missionMusluk', xpReward: 60, target: 1 },
      { titleKey: 'missionSebze', xpReward: 70, target: 1 },
      { titleKey: 'missionYagmur', xpReward: 120, target: 1 },
      { titleKey: 'missionSizinti', xpReward: 110, target: 1 },
      { titleKey: 'missionSaksı', xpReward: 40, target: 1 }
    ];

    const shuffled = [...missionPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4).map((m, idx) => ({
      id: `m_gen_${Date.now()}_${idx}`,
      titleKey: m.titleKey,
      xpReward: m.xpReward,
      completed: false,
      progress: 0,
      target: m.target,
      status: 'not_started' as const
    }));

    setMissions(selected);
    setSystemAlertMessage(language === 'tr' ? '🔄 Günlük yeni yeşil görevleriniz başarıyla tanımlandı!' : '🔄 Your new daily green missions have been updated successfully!');
  };

  const handleSaveProfile = (partial: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...partial });
    }
  };

  const handleAddFriend = (name: string) => {
    const newFr: Friend = {
      id: 'friend_' + Date.now(),
      name: name,
      rank: friends.length + 1,
      score: 150 // Starting score
    };
    setFriends(prev => [...prev, newFr]);
  };

  const handleSendMessage = async (text: string) => {
    setChatLoading(true);
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_user',
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    };

    setChatHistory(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          language: language === 'tr' ? 'Turkish' : 'English'
        })
      });

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: 'msg_' + Date.now() + '_ai',
        sender: 'ai',
        text: data.text || data.fallbackText,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };

      setChatHistory(prev => [...prev, aiReply]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: 'msg_' + Date.now() + '_ai',
        sender: 'ai',
        text: 'Sanal asistan meşgul veya çevrimdışı. Settings > Secrets panelinden GEMINI_API_KEY anahtarını kontrol edip etmediğinizden emin olun!',
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleResetData = () => {
    setRecords([]);
    setPlantState({ level: 1, xp: 0, streak: 1 });
    // Keep user profile but clean stats
    triggerCustomDataReset();
  };

  const triggerCustomDataReset = () => {
    localStorage.removeItem('aquacheck_records');
    localStorage.removeItem('aquacheck_plant');
  };

  const activeColors = THEMES[theme] || THEMES.ocean;
  const isLightTheme = theme === 'white';
  const currentFontFamily = getFontFamily(font);
  const t = TRANSLATIONS[language];

  // Mobile layout navigation array
  const mobileNav = [
    { view: 'home', icon: Home, label: t.home },
    { view: 'add', icon: PlusCircle, label: t.addWater },
    { view: 'stats', icon: BarChart3, label: t.stats },
    { view: 'plant', icon: Sprout, label: t.plant },
    { view: 'settings', icon: Settings, label: t.settings }
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center animate-pulse">
            <span className="text-5xl animate-bounce">💧</span>
            <div className="absolute w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-black tracking-widest text-cyan-350 animate-pulse uppercase font-mono mt-6">
            AQUACHECK GÜVENLİ BAĞLANTI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden"
      style={{ 
        fontFamily: currentFontFamily,
        backgroundImage: `linear-gradient(135deg, ${activeColors.bgGradFrom} 0%, ${activeColors.bgGradTo} 100%)`
      }}
    >
      
      {/* Premium Floating Particles & Sophisticated Dark Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Ambient Glow Circles */}
        <div className="absolute top-10 left-10 w-[24rem] h-[24rem] md:w-[36rem] md:h-[36rem] bg-blue-500/10 rounded-full blur-[120px] md:blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] md:w-[45rem] md:h-[45rem] bg-emerald-500/8 rounded-full blur-[130px] md:blur-[180px]" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-cyan-400/8 rounded-full blur-[100px]" />

        {/* Soft Animated Water Droplets */}
        <div className="absolute top-[10%] left-[20%] w-10 h-10 bg-cyan-400/5 rounded-full blur-sm animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[40%] right-[15%] w-16 h-16 bg-blue-400/5 rounded-full blur-md animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-teal-400/5 rounded-full blur-sm animate-bounce" style={{ animationDuration: '10s' }} />

        {/* Waves SVG overlay details */}
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-[0.03] select-none pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1440 320">
            <path 
              fill={activeColors.secondary} 
              d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,149.3C672,160,768,224,864,229.3C960,235,1056,181,1152,144C1248,107,1344,85,1392,75L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
            />
          </svg>
        </div>
      </div>

      {/* Floating System notifications cards */}
      {systemAlertMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slide-up">
          <div className="p-4 rounded-xl border border-cyan-400/20 bg-slate-900/90 text-white font-bold text-xs shadow-xl backdrop-blur-md flex gap-3 items-center">
            <BellRing className="w-5 h-5 text-cyan-400 shrink-0 animate-swing" />
            <p className="flex-1 text-xs font-semibold leading-relaxed">
              {systemAlertMessage}
            </p>
            <button 
              onClick={() => setSystemAlertMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Primary header bar */}
      <header className="sticky top-0 z-40 bg-black/25 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('home')}>
          <span className="text-xl" style={{ color: activeColors.secondary }}>
            💧
          </span>
          <span 
            className="text-lg font-black uppercase tracking-tight"
            style={{ color: activeColors.textPrimary }}
          >
            {t.appTitle}
          </span>
        </div>

        {/* Global settings indicator pill */}
        <div className="flex items-center gap-2">
          {/* Quick Premium indicator info */}
          <button 
            onClick={() => setActiveView('premium')}
            className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider"
          >
            <Crown size={12} />
            PREMIUM
          </button>

          {/* Quick AI Coaching Button selector */}
          <button 
            onClick={() => setActiveView('chat')}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all text-glow-hover cursor-pointer"
          >
            <Bot size={14} className="text-cyan-400" />
            Coaching
          </button>
        </div>
      </header>

      {/* Main body area router */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 relative z-10">
        {!user ? (
          // Separate Auth layout
          <AuthScreen 
            language={language}
            theme={theme}
            colors={activeColors}
            onLoginSuccess={handleLoginProgress}
          />
        ) : (
          // Authenticated views router
          <div className="flex w-full gap-4 md:gap-8 items-start">
            
            {/* Side Navigation bar (Sticky & Always Visible on all screen sizes) */}
            <aside className="flex flex-col gap-2 rounded-2xl bg-[#0d1216]/45 backdrop-blur-md border border-white/5 p-2 md:p-4 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto scrollbar-none shrink-0 w-14 md:w-64">
              {mobileNav.map((item) => {
                const isSelected = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view as any)}
                    className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
 
              <div className="border-t border-white/5 my-3 pt-3 space-y-2">
                {/* Additional Sidebar items */}
                <button
                  onClick={() => setActiveView('history')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'history' ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <History size={14} className="shrink-0" />
                  <span className="hidden md:inline">{t.history}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('dams')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'dams' ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Waves size={14} className="shrink-0" />
                  <span className="hidden md:inline">{t.damsTitle}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('droughtMap')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'droughtMap' ? 'bg-teal-500/10 border border-teal-500/25 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.06)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Map size={14} className="text-teal-400 shrink-0" />
                  <span className="hidden md:inline truncate">{language === 'tr' ? 'Kuraklık Haritası' : 'Drought Map'}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('social')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'social' ? 'bg-cyan-500/10 text-cyan-305' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Users size={14} className="shrink-0" />
                  <span className="hidden md:inline">{t.leaderboardTitle}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('prediction')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'prediction' ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <TrendingUp size={14} className="shrink-0" />
                  <span className="hidden md:inline">{t.predictTitle}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('profile')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'profile' ? 'bg-[#00fbfb]/10 text-[#00fbfb]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <User size={14} className="text-[#00fbfb] shrink-0" />
                  <span className="hidden md:inline">{t.profileTitle}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('environmental')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'environmental' ? 'bg-[#00fbfb]/10 text-[#00fbfb]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Leaf size={14} className="text-emerald-400 shrink-0" />
                  <span className="hidden md:inline">{language === 'tr' ? 'Çevresel Etki' : 'Eco Impact'}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('achievements')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'achievements' ? 'bg-[#00fbfb]/10 text-[#00fbfb]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Award size={14} className="text-amber-400 shrink-0" />
                  <span className="hidden md:inline">{language === 'tr' ? 'Başarımlar' : 'Achievements'}</span>
                </button>
 
                <button
                  onClick={() => setActiveView('reports')}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                    activeView === 'reports' ? 'bg-[#00fbfb]/10 text-[#00fbfb]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FileText size={14} className="text-cyan-400 shrink-0" />
                  <span className="hidden md:inline">{language === 'tr' ? 'PDF Raporlar' : 'PDF Reports'}</span>
                </button>
              </div>
 
              {/* Logout button */}
              <button 
                onClick={async () => {
                  if (confirm(language === 'tr' ? 'Güvenli çıkış yapmak istiyor musunuz?' : 'Are you sure you want to log out secure?')) {
                    try {
                      await signOut(auth);
                      setUser(null);
                      setActiveView('home');
                    } catch (err) {
                      console.error("Logout error:", err);
                    }
                  }
                }}
                className="w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-xl text-xs font-black text-red-400 hover:bg-red-500/10 transition-colors mt-4 text-left cursor-pointer"
              >
                <LogOut size={16} className="shrink-0" />
                <span className="hidden md:inline">{t.logout}</span>
              </button>
            </aside>
 
            {/* Main view router area */}
            <div className="flex-grow min-w-0 flex-1">
              {activeView === 'home' && (
                <HomeScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  user={user}
                  records={records}
                  badges={badges}
                  onNavigate={setActiveView as any}
                  onOpenNotifications={() => setSystemAlertMessage('💧 Bugünkü su tüketim limitini tamamlamaya yaklaştın, harikasın!')}
                  userProgression={userProgression}
                />
              )}

              {activeView === 'add' && (
                <AddWaterScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  onAddRecord={handleAddRecord}
                  onNavigate={setActiveView as any}
                />
              )}

              {activeView === 'stats' && (
                <StatsScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  records={records}
                />
              )}

              {activeView === 'plant' && (
                <PlantScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  badges={badges}
                  missions={missions}
                  plantState={plantState}
                  records={records}
                  onWaterPlant={handleWaterPlantManual}
                  onClaimBadge={() => {}}
                  onUpdateMissionStatus={handleUpdateMissionStatus}
                  onGenerateNewMissions={handleGenerateNewMissions}
                  userLevel={userProgression.level}
                  totalSavings={totalSaving}
                  onAwardXp={awardUserXp}
                  onShowAlert={(msg) => setSystemAlertMessage(msg)}
                />
              )}

              {activeView === 'droughtMap' && (
                <DroughtMapScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                />
              )}

              {activeView === 'settings' && (
                <SettingsScreen 
                  language={language}
                  theme={theme}
                  font={font}
                  colors={activeColors}
                  user={user}
                  notificationsEnabled={notificationsEnabled}
                  reminderInterval={reminderInterval}
                  onSaveProfile={handleSaveProfile}
                  onSetLanguage={setLanguage}
                  onSetTheme={setTheme}
                  onSetFont={setFont}
                  onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
                  onSetReminder={setReminderInterval}
                  onExportData={() => {}}
                  onNavigate={setActiveView as any}
                  onResetAllData={handleResetData}
                  onLogout={async () => {
                    try {
                      await signOut(auth);
                      setUser(null);
                      setActiveView('home');
                    } catch (err) {
                      console.error("Logout error in settings:", err);
                    }
                  }}
                />
              )}

              {activeView === 'history' && (
                <HistoryScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  records={records}
                  onDeleteRecord={handleDeleteRecord}
                />
              )}

              {activeView === 'dams' && (
                <DamsScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                />
              )}

              {activeView === 'chat' && (
                <ChatAssistant 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  isLoading={chatLoading}
                />
              )}

              {activeView === 'prediction' && (
                <PredictionScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  records={records}
                  dailyGoal={user.dailyGoal}
                />
              )}

              {activeView === 'social' && (
                <SocialScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  friends={friends}
                  onAddFriend={handleAddFriend}
                />
              )}

              {activeView === 'premium' && (
                <PremiumScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                />
              )}

              {activeView === 'profile' && (
                <ProfileScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  user={user}
                  onSaveProfile={handleSaveProfile}
                  records={records}
                  badges={badges}
                  onNavigate={setActiveView as any}
                />
              )}

              {activeView === 'environmental' && (
                <EnvironmentalScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  records={records}
                />
              )}

              {activeView === 'achievements' && (
                <AchievementsScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  badges={badges}
                  missions={missions}
                  plantState={plantState}
                />
              )}

              {activeView === 'reports' && (
                <ReportsScreen 
                  language={language}
                  theme={theme}
                  colors={activeColors}
                  records={records}
                  user={user}
                  onShowAlert={(msg) => setSystemAlertMessage(msg)}
                />
              )}
            </div>

          </div>
        )}
      </main>

       {/* Mobile Footer Menu is replaced by persistent responsive left sidebar */}

      {user && (
        <AquaBotAI 
          language={language}
          theme={theme}
          colors={activeColors}
          user={user}
          records={records}
          badges={badges}
          missions={missions}
          plantState={plantState}
          onNavigate={setActiveView as any}
        />
      )}

      {/* Celebrating modal popup for badges and levels */}
      <CongratsModal
        isOpen={congratsModal.isOpen}
        type={congratsModal.type}
        title={congratsModal.title}
        description={congratsModal.description}
        icon={congratsModal.icon}
        xpReward={congratsModal.xpReward}
        onClose={() => setCongratsModal(prev => ({ ...prev, isOpen: false }))}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

    </div>
  );
}
