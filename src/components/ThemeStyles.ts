/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeOption } from '../types';

export interface ThemeColors {
  primary: string;       // HEX or tailwind class name
  secondary: string;
  bgGradFrom: string;    // Gradient start for background
  bgGradTo: string;
  cardBg: string;        // Translucent card bg
  textPrimary: string;
  textMuted: string;
  borderClass: string;
  shadowClass: string;
}

export const THEMES: Record<ThemeOption, ThemeColors> = {
  ocean: {
    primary: '#00e1e1', // Aqua/Cyan
    secondary: '#0ea5e9',
    bgGradFrom: '#020d1e',
    bgGradTo: '#01050e',
    cardBg: 'rgba(15, 23, 42, 0.65)',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    borderClass: 'border border-[#00e1e1]/15',
    shadowClass: 'shadow-[0_8px_30px_rgba(0,225,225,0.05)]'
  },
  forest: {
    primary: '#10b981', // Forest Emerald
    secondary: '#34d399',
    bgGradFrom: '#022c22',
    bgGradTo: '#020617',
    cardBg: 'rgba(2, 44, 34, 0.45)',
    textPrimary: '#ecfdf5',
    textMuted: '#a7f3d0',
    borderClass: 'border border-emerald-500/20',
    shadowClass: 'shadow-[0_8px_30px_rgba(16,185,129,0.05)]'
  },
  navy: {
    primary: '#3b82f6', // Bright Blue
    secondary: '#60a5fa',
    bgGradFrom: '#030712',
    bgGradTo: '#0b1329',
    cardBg: 'rgba(15, 23, 42, 0.6)',
    textPrimary: '#f1f5f9',
    textMuted: '#cbd5e1',
    borderClass: 'border border-blue-500/15',
    shadowClass: 'shadow-[0_8px_30px_rgba(59,130,246,0.05)]'
  },
  black: {
    primary: '#ffffff', // Clean White highlights
    secondary: '#a1a1aa',
    bgGradFrom: '#000000',
    bgGradTo: '#0a0a0a',
    cardBg: 'rgba(18, 18, 18, 0.85)',
    textPrimary: '#ffffff',
    textMuted: '#a1a1aa',
    borderClass: 'border border-zinc-800',
    shadowClass: 'shadow-[0_8px_32px_rgba(255,255,255,0.02)]'
  },
  purple: {
    primary: '#a855f7', // Purple
    secondary: '#c084fc',
    bgGradFrom: '#0e051a',
    bgGradTo: '#030107',
    cardBg: 'rgba(23, 10, 41, 0.65)',
    textPrimary: '#faf5ff',
    textMuted: '#d8b4fe',
    borderClass: 'border border-purple-500/20',
    shadowClass: 'shadow-[0_8px_30px_rgba(168,85,247,0.05)]'
  },
  pink: {
    primary: '#ec4899', // Pink Rose
    secondary: '#fbcfe8',
    bgGradFrom: '#1c0512',
    bgGradTo: '#050003',
    cardBg: 'rgba(28, 5, 18, 0.65)',
    textPrimary: '#fdf2f8',
    textMuted: '#fbcfe8',
    borderClass: 'border border-pink-500/20',
    shadowClass: 'shadow-[0_8px_30px_rgba(236,72,153,0.05)]'
  },
  sunset: {
    primary: '#f97316', // Bright Orange
    secondary: '#fde047',
    bgGradFrom: '#150601',
    bgGradTo: '#050100',
    cardBg: 'rgba(30, 10, 5, 0.65)',
    textPrimary: '#fff7ed',
    textMuted: '#ffedd5',
    borderClass: 'border border-orange-500/25',
    shadowClass: 'shadow-[0_8px_30px_rgba(249,115,22,0.05)]'
  },
  white: {
    primary: '#2563eb', // Pure Indigo-blue text style, high-end high contrast light theme
    secondary: '#0ea5e9',
    bgGradFrom: '#ffffff',
    bgGradTo: '#f4f6fa',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    textPrimary: '#0f172a', // Dark Gray
    textMuted: '#475569',
    borderClass: 'border border-slate-200/80',
    shadowClass: 'shadow-[0_10px_35px_rgba(148,163,184,0.15)]'
  },
  gray: {
    primary: '#e4e4e7', // Arctic Silver
    secondary: '#a1a1aa',
    bgGradFrom: '#09090b',
    bgGradTo: '#18181b',
    cardBg: 'rgba(24, 24, 27, 0.75)',
    textPrimary: '#fafafa',
    textMuted: '#a1a1aa',
    borderClass: 'border border-zinc-700/60',
    shadowClass: 'shadow-[0_8px_30px_rgba(161,161,170,0.05)]'
  },
  emerald: {
    primary: '#059669', // Deep Emerald Mint
    secondary: '#10b981',
    bgGradFrom: '#011c14',
    bgGradTo: '#000806',
    cardBg: 'rgba(1, 35, 25, 0.7)',
    textPrimary: '#f0fdf4',
    textMuted: '#86efac',
    borderClass: 'border border-emerald-500/25',
    shadowClass: 'shadow-[0_8px_30px_rgba(16,185,129,0.06)]'
  },
  crimson: {
    primary: '#ef4444', // Hot Crimson
    secondary: '#f87171',
    bgGradFrom: '#150505',
    bgGradTo: '#050101',
    cardBg: 'rgba(30, 8, 8, 0.7)',
    textPrimary: '#fef2f2',
    textMuted: '#fca5a5',
    borderClass: 'border border-red-500/30',
    shadowClass: 'shadow-[0_8px_30px_rgba(239,68,68,0.06)]'
  },
  gold: {
    primary: '#fbbf24', // Luxury Gold
    secondary: '#f59e0b',
    bgGradFrom: '#050400',
    bgGradTo: '#0d0a02',
    cardBg: 'rgba(20, 15, 5, 0.8)',
    textPrimary: '#fffdf5',
    textMuted: '#fde68a',
    borderClass: 'border border-yellow-500/30',
    shadowClass: 'shadow-[0_8px_30px_rgba(251,191,36,0.06)]'
  },
  neon: {
    primary: '#39ff14', // Acid Green Cyber
    secondary: '#00ffff',
    bgGradFrom: '#000000',
    bgGradTo: '#050805',
    cardBg: 'rgba(5, 10, 5, 0.85)',
    textPrimary: '#f2fff0',
    textMuted: '#85ff7a',
    borderClass: 'border border-[#39ff14]/30',
    shadowClass: 'shadow-[0_8px_35px_rgba(57,255,20,0.08)]'
  },
  lavender: {
    primary: '#8b5cf6', // Indigo-Lavender
    secondary: '#a78bfa',
    bgGradFrom: '#07050f',
    bgGradTo: '#0e0b1c',
    cardBg: 'rgba(18, 14, 32, 0.75)',
    textPrimary: '#f5f3ff',
    textMuted: '#c4b5fd',
    borderClass: 'border border-violet-500/20',
    shadowClass: 'shadow-[0_8px_30px_rgba(139,92,246,0.05)]'
  },
  coffee: {
    primary: '#854d0e', // Warm Coffee Caramel
    secondary: '#b45309',
    bgGradFrom: '#0c0602',
    bgGradTo: '#170c04',
    cardBg: 'rgba(28, 16, 8, 0.75)',
    textPrimary: '#fef3c7',
    textMuted: '#d97706',
    borderClass: 'border border-[#854d0e]/30',
    shadowClass: 'shadow-[0_8px_30px_rgba(133,77,14,0.05)]'
  },
  carbon: {
    primary: '#cbd5e1', // Graphite Carbon
    secondary: '#a1a1aa',
    bgGradFrom: '#0c0f12',
    bgGradTo: '#030405',
    cardBg: 'rgba(18, 20, 24, 0.85)',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    borderClass: 'border border-slate-700/80',
    shadowClass: 'shadow-[0_8px_30px_rgba(203,213,225,0.02)]'
  }
};

export const getFontFamily = (font: string): string => {
  switch (font) {
    case 'poppins': return '"Poppins", sans-serif';
    case 'inter': return '"Inter", sans-serif';
    case 'roboto': return '"Roboto", sans-serif';
    case 'montserrat': return '"Montserrat", sans-serif';
    case 'opensans': return '"Open Sans", sans-serif';
    case 'nunito': return '"Nunito", sans-serif';
    case 'lato': return '"Lato", sans-serif';
    case 'merriweather': return '"Merriweather", serif';
    case 'playfair': return '"Playfair Display", serif';
    case 'ubuntu': return '"Ubuntu", sans-serif';
    default: return '"Inter", sans-serif';
  }
};
