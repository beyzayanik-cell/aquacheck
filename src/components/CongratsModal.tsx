import React, { useEffect, useState } from 'react';
import { Award, Sparkles, Volume2, VolumeX, X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'badge' | 'level';
  title: string;
  description: string;
  icon: string;
  xpReward?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function CongratsModal({
  isOpen,
  onClose,
  type,
  title,
  description,
  icon,
  xpReward,
  soundEnabled,
  onToggleSound
}: CongratsModalProps) {
  
  useEffect(() => {
    if (isOpen && soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          // Uplifting major arpeggio melody (C4 -> E4 -> G4 -> C5 -> E5)
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Rich triangle-sine blended feel
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
            
            gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime + idx * 0.1);
            osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
          });
        }
      } catch (err) {
        console.warn('Uplifting audio melody bypassed in sandbox:', err);
      }
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center shadow-[0_20px_50px_rgba(0,251,251,0.15)] text-white"
        >
          {/* Ambient decorative glowing backdrops */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top control widgets (sound and exit) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Glowing Emblem Core */}
          <div className="relative mx-auto my-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-400/30 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-5xl select-none"
            >
              {icon}
            </motion.div>
            <div className="absolute -right-2 -bottom-2 p-1.5 rounded-full bg-slate-950 border border-cyan-400/40 text-amber-400">
              {type === 'badge' ? <Award size={16} /> : <Trophy size={16} />}
            </div>
          </div>

          {/* Heading and Congratulatory messages */}
          <h3 className="text-sm font-black tracking-widest text-[#00fbfb] uppercase">
            {type === 'badge' ? '🏆 ROZET KAZANILDI! 🏆' : '⭐ SEVİYE ATLANDI! ⭐'}
          </h3>
          <h2 className="mt-2 text-2xl font-black text-white tracking-tight px-2 leading-tight">
            {title}
          </h2>
          <p className="mt-3 text-xs text-slate-300 font-semibold leading-relaxed px-4">
            {description}
          </p>

          {/* Reward badge slot */}
          {xpReward && (
            <div className="mt-5 inline-flex items-center gap-1.5 px-4.5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-bold text-xs">
              <Sparkles size={14} className="animate-spin text-cyan-400" />
              <span>+{xpReward} DENEYİM PUANI (XP)</span>
            </div>
          )}

          {/* Close Trigger Button */}
          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full h-12 rounded-full font-black text-xs uppercase tracking-widest bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 hover:text-slate-900 shadow-lg shadow-cyan-500/15 hover:shadow-cyan-400/25 transition-all cursor-pointer"
              style={{ color: '#030712' }}
            >
              Devam Et
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
