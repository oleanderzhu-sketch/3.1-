/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  RotateCcw, 
  Play, 
  ChevronLeft, 
  Sparkles,
  AlertCircle,
  Star,
  Atom,
  Zap,
  Infinity as InfinityIcon,
  Gauge
} from 'lucide-react';
import { useGameLogic } from './useGameLogic';
import { GameMode, GRID_ROWS, GRID_COLS, Difficulty } from './types';

const BLOCK_COLORS: Record<number, string> = {
  1: 'bg-[#FF4D4D] border-[#B22222]',
  2: 'bg-[#FFD700] border-[#B8860B]',
  3: 'bg-[#FF8C00] border-[#CD853F]',
  4: 'bg-[#B8860B] border-[#8B4513]',
  5: 'bg-[#FF4500] border-[#8B0000]',
  6: 'bg-[#DAA520] border-[#B8860B]',
  7: 'bg-[#B22222] border-[#800000]',
  8: 'bg-[#FFDAB9] border-[#CD853F]',
  9: 'bg-[#CD853F] border-[#8B4513]',
};

const MATH_SYMBOLS = ['∑', '∫', 'ψ', 'Δ', 'π', '∞', '√', 'λ'];

export default function App() {
  const {
    grid,
    score,
    target,
    selectedIds,
    isGameOver,
    mode,
    timeLeft,
    combo,
    difficulty,
    lastMatchPos,
    initGame,
    toggleSelect,
    reset
  } = useGameLogic();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  const currentSum = grid
    .filter((b) => selectedIds.includes(b.id))
    .reduce((sum, b) => sum + b.value, 0);

  const BackgroundDecor = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 quantum-grid opacity-30" />
      
      {/* Floating Symbols */}
      {MATH_SYMBOLS.map((sym, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: Math.random() * 1000 }}
          animate={{ 
            y: [0, -1000],
            opacity: [0, 0.2, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 10 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: i * 2
          }}
          className="math-symbol text-6xl"
          style={{ left: `${Math.random() * 100}%` }}
        >
          {sym}
        </motion.div>
      ))}

      {/* Horse Motifs */}
      <div className="absolute top-20 left-10 opacity-10 rotate-[-15deg]">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" className="text-gold-500">
          <path d="M19,7L18.1,8.8C17.4,10.2 15.9,11 14.4,11H12V13H13C14.1,13 15,13.9 15,15V19H13V15H11V19H9V15C9,13.9 9.9,13 11,13H12V11H9.6C8.1,11 6.6,10.2 5.9,8.8L5,7V5H7V7L8,9H16L17,7V5H19V7Z" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 rotate-[15deg] scale-x-[-1]">
        <svg width="250" height="250" viewBox="0 0 24 24" fill="currentColor" className="text-gold-500">
          <path d="M19,7L18.1,8.8C17.4,10.2 15.9,11 14.4,11H12V13H13C14.1,13 15,13.9 15,15V19H13V15H11V19H9V15C9,13.9 9.9,13 11,13H12V11H9.6C8.1,11 6.6,10.2 5.9,8.8L5,7V5H7V7L8,9H16L17,7V5H19V7Z" />
        </svg>
      </div>
    </div>
  );

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#8B0000] flex items-center justify-center p-4 font-sans relative">
        <BackgroundDecor />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full game-card p-10 relative overflow-hidden z-10"
        >
          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 text-[#FFD700] animate-pulse"><Star fill="currentColor" size={24} /></div>
          <div className="absolute bottom-4 right-4 text-[#00F2FF] animate-bounce"><Atom size={24} /></div>

          <div className="text-center mb-10">
            <h1 className="text-5xl font-chinese font-black tracking-tight text-[#8B0000] mb-2">3.1数学营</h1>
            <p className="text-[#B8860B] font-bold uppercase tracking-widest text-sm">Quantum Horse Camp</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gauge size={16} className="text-[#8B0000]" />
              <span className="text-xs font-chinese font-black uppercase tracking-widest text-[#B8860B]">选择坍缩速度</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '慢速', value: Difficulty.SLOW, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                { label: '中速', value: Difficulty.MEDIUM, color: 'bg-blue-100 text-blue-700 border-blue-200' },
                { label: '快速', value: Difficulty.FAST, color: 'bg-red-100 text-red-700 border-red-200' },
              ].map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setSelectedDifficulty(diff.value)}
                  className={`py-3 rounded-xl font-chinese font-black text-sm border-2 transition-all ${
                    selectedDifficulty === diff.value 
                      ? `${diff.color.replace('100', '500').replace('text-', 'text-white')} border-transparent scale-105 shadow-lg` 
                      : `${diff.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => initGame(GameMode.CLASSIC, selectedDifficulty)}
              className="w-full bg-[#8B0000] border-b-8 border-[#5A0000] text-[#FFD700] rounded-[24px] p-6 transition-all hover:scale-[1.02] active:translate-y-2 active:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-2xl font-chinese font-black">经典模式</span>
                  <span className="text-xs font-bold opacity-80 uppercase">Classic Quantum</span>
                </div>
                <Play fill="currentColor" />
              </div>
            </button>

            <button
              onClick={() => initGame(GameMode.TIME, selectedDifficulty)}
              className="w-full bg-[#DAA520] border-b-8 border-[#B8860B] text-[#8B0000] rounded-[24px] p-6 transition-all hover:scale-[1.02] active:translate-y-2 active:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-2xl font-chinese font-black">计时模式</span>
                  <span className="text-xs font-bold opacity-80 uppercase">Time Dilation</span>
                </div>
                <Timer />
              </div>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t-4 border-dashed border-[#B8860B]/30">
            <h3 className="text-sm font-chinese font-black text-[#8B0000] mb-4">量子规则</h3>
            <ul className="space-y-3 text-sm font-bold text-[#8B4513]">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FFD700] text-[#8B0000] flex items-center justify-center shrink-0">1</div>
                <span>点击数字，坍缩至目标和！</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FFD700] text-[#8B0000] flex items-center justify-center shrink-0">2</div>
                <span>跃迁不限位置，自由组合。</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FFD700] text-[#8B0000] flex items-center justify-center shrink-0">3</div>
                <span>万马奔腾，莫让方块触顶！</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#8B0000] text-white font-sans overflow-hidden flex flex-col items-center p-4 relative">
      <BackgroundDecor />
      
      {/* Header */}
      <div className="w-full max-w-lg bg-white/95 rounded-[32px] p-6 shadow-xl border-4 border-[#FFD700] mb-6 flex items-center justify-between relative overflow-hidden z-10">
        <button 
          onClick={reset}
          className="p-3 bg-red-100 hover:bg-red-200 text-[#8B0000] rounded-2xl transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-chinese font-black uppercase tracking-widest text-[#B8860B]">目标坍缩值</span>
          <div className="target-bubble px-8 py-2 text-4xl font-display font-black">
            {target}
          </div>
        </div>

        <div className="text-right">
          <span className="block text-xs font-chinese font-black uppercase tracking-widest text-[#B8860B]">能量积分</span>
          <div className="relative">
            <span className="text-2xl font-display font-black text-[#8B0000]">{score.toLocaleString()}</span>
            <AnimatePresence>
              {lastMatchPos && (
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 top-0 text-emerald-600 font-display font-black text-sm"
                >
                  +{combo > 0 ? (selectedIds.length || 3) * 10 * combo : 10}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-lg flex-1 flex flex-col gap-4 z-10">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-xs font-chinese font-black uppercase text-[#FFD700]">当前能级:</div>
              <div className={`text-2xl font-display font-black ${currentSum > target ? 'text-red-400' : 'text-[#00F2FF]'}`}>
                {currentSum}
              </div>
            </div>
            {combo > 1 && (
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                key={combo}
                className="bg-[#FFD700] text-[#8B0000] px-3 py-1 rounded-full text-xs font-display font-black shadow-lg border border-[#B8860B]"
              >
                量子共振 x{combo}!
              </motion.div>
            )}
          </div>
          {mode === GameMode.TIME && (
            <div className={`flex items-center gap-2 px-4 py-1 rounded-full ${timeLeft < 4 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#00F2FF]/20 text-[#00F2FF] border border-[#00F2FF]/50'}`}>
              <Timer size={16} />
              <span className="text-lg font-display font-black">{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Grid Container */}
        <div className="flex-1 relative bg-white/10 backdrop-blur-sm rounded-[40px] p-4 shadow-2xl border-4 border-[#FFD700]/50 overflow-hidden">
          <div 
            className="relative w-full h-full"
            style={{
              aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
            }}
          >
            {/* Combo Popup Animation */}
            <AnimatePresence>
              {lastMatchPos && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -50, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute z-30 pointer-events-none text-[#FFD700] font-chinese font-black text-3xl drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{
                      left: `${(lastMatchPos.x * 100) / GRID_COLS}%`,
                      top: `${(lastMatchPos.y * 100) / GRID_ROWS}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {combo > 1 ? `量子共振 x${combo}!` : '完美坍缩!'}
                  </motion.div>
                  
                  {/* Particle Explosion */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 200, 
                        y: (Math.random() - 0.5) * 200, 
                        scale: 0,
                        opacity: 0,
                        rotate: Math.random() * 360
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute z-20 w-4 h-4 rounded-full pointer-events-none"
                      style={{
                        left: `${(lastMatchPos.x * 100) / GRID_COLS}%`,
                        top: `${(lastMatchPos.y * 100) / GRID_ROWS}%`,
                        backgroundColor: ['#FFD700', '#00F2FF', '#FF4D4D', '#DAA520', '#FFFFFF'][i % 5],
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 10px currentColor'
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {grid.map((block) => (
                <motion.button
                  key={block.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    left: `${(block.col * 100) / GRID_COLS}%`,
                    top: `${(block.row * 100) / GRID_ROWS}%`,
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0, 
                    rotate: Math.random() * 90 - 45,
                    filter: 'brightness(2) blur(4px)',
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 35,
                    layout: { 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      mass: 1.2
                    }
                  }}
                  onClick={() => toggleSelect(block.id)}
                  className="absolute p-1"
                  style={{
                    width: `${100 / GRID_COLS}%`,
                    height: `${100 / GRID_ROWS}%`,
                  }}
                >
                  <div className={`
                    w-full h-full rounded-[16px] flex items-center justify-center text-2xl font-display font-black text-white
                    block-base border-b-4 shadow-lg
                    ${BLOCK_COLORS[block.value]}
                    ${selectedIds.includes(block.id) ? 'block-selected' : ''}
                    ${block.row < 2 ? 'ring-4 ring-red-400/80 animate-pulse' : ''}
                  `}>
                    {block.value}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full bg-white rounded-[40px] p-10 shadow-2xl border-4 border-[#FFD700] text-center"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 text-red-600 rounded-full mb-6">
                <AlertCircle size={64} />
              </div>
              <h2 className="text-4xl font-chinese font-black text-[#8B0000] mb-2">量子坍缩！</h2>
              <p className="text-[#8B4513] font-bold mb-8">方块已突破量子边界！</p>
              
              <div className="bg-[#FFF9E6] rounded-[24px] p-6 mb-8 border-2 border-[#FFD700]">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-chinese font-black text-[#B8860B] uppercase text-xs">最终能量值</span>
                  <span className="text-4xl font-display font-black text-[#8B0000]">{score.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => initGame(mode!)}
                  className="flex items-center justify-center gap-2 bg-[#8B0000] border-b-4 border-[#5A0000] text-[#FFD700] font-chinese font-black py-4 rounded-2xl active:translate-y-1 active:border-b-0 transition-all"
                >
                  <RotateCcw size={20} />
                  再次跃迁
                </button>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 bg-gray-100 border-b-4 border-gray-300 text-gray-600 font-chinese font-black py-4 rounded-2xl active:translate-y-1 active:border-b-0 transition-all"
                >
                  回基地
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-4 text-[10px] font-chinese font-black uppercase tracking-[0.3em] text-[#FFD700]/60 z-10">
        3.1数学营 • 乙巳马年量子版 • 快乐学习
      </footer>
    </div>
  );
}
