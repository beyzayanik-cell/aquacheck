/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  dailyGoal: number; // in Liters
  password?: string;
}

export type ThemeOption =
  | 'ocean'       // Ocean Blue
  | 'forest'      // Forest Green
  | 'navy'        // Deep Navy
  | 'black'       // Midnight Black
  | 'purple'      // Royal Purple
  | 'pink'        // Rose Pink
  | 'sunset'      // Sunset Orange
  | 'white'       // Pure White
  | 'gray'        // Arctic Gray
  | 'emerald'     // Emerald
  | 'crimson'     // Crimson Red
  | 'gold'        // Gold Luxury
  | 'neon'        // Cyber Neon
  | 'lavender'    // Lavender
  | 'coffee'      // Coffee Brown
  | 'carbon';     // Dark Carbon

export type FontOption =
  | 'poppins'
  | 'inter'
  | 'roboto'
  | 'montserrat'
  | 'opensans'
  | 'nunito'
  | 'lato'
  | 'merriweather'
  | 'playfair'
  | 'ubuntu';

export type LanguageOption = 'tr' | 'en' | 'de' | 'es' | 'ru' | 'ar' | 'fr' | 'it' | 'pt' | 'ja';

export interface WaterRecord {
  id: string;
  category: string;
  liters: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  note: string;
}

export interface DamStatus {
  city: string;
  fullness: number;
  lastUpdate: string;
  riskLevel: 'safe' | 'warning' | 'critical';
  weeklyChange: number; // positive or negative
}

export interface PlantState {
  level: number;
  xp: number;
  streak: number;
}

export interface Mission {
  id: string;
  titleKey: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export interface Badge {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  unlockedAt?: string;
}

export interface Friend {
  id: string;
  name: string;
  rank: number;
  score: number;
  isMe?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AppState {
  user: UserProfile | null;
  records: WaterRecord[];
  activeView: 'home' | 'add' | 'stats' | 'plant' | 'settings' | 'history' | 'dams' | 'chat' | 'social' | 'premium' | 'prediction' | 'profile' | 'environmental' | 'achievements' | 'badges' | 'reports' | 'auth';
  language: LanguageOption;
  theme: ThemeOption;
  bgColorTheme: 'light' | 'dark'; // Sub-mode
  font: FontOption;
  notificationsEnabled: boolean;
  reminderInterval: number; // in seconds or minutes
  plant: PlantState;
  missions: Mission[];
  badges: Badge[];
  friends: Friend[];
  chatHistory: ChatMessage[];
  lastPrediction: string | null;
}
