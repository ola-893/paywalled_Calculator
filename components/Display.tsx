'use client';

import React from 'react';
import { Lock, Unlock, Sparkles, Loader2, DollarSign } from 'lucide-react';

interface DisplayProps {
  expression: string;
  result: string | null;
  isLocked: boolean;
  hint?: string | null;
  isLoading: boolean;
  error?: string | null;
  onOpenPaywall: () => void;
  isVip?: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  isLocked,
  hint,
  isLoading,
  error,
  onOpenPaywall,
  isVip,
}) => {
  return (
    <div className="relative w-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col justify-between min-h-[170px] overflow-hidden transition-all duration-300">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: Status indicators & Current expression */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
        <div className="flex items-center gap-2">
          {isVip ? (
            <span className="flex items-center gap-1 text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] tracking-wide animate-pulse">
              👑 VIP UNLOCKED
            </span>
          ) : isLocked ? (
            <span className="flex items-center gap-1 text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px]">
              <Lock className="w-2.5 h-2.5" /> PAYWALL ACTIVE
            </span>
          ) : result ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
              <Unlock className="w-2.5 h-2.5" /> UNLOCKED
            </span>
          ) : (
            <span className="text-slate-500 text-[10px] flex items-center gap-1">
              <DollarSign className="w-2.5 h-2.5 text-emerald-500" /> READY
            </span>
          )}
        </div>

        {/* Expression display with horizontal scrolling if long */}
        <div className="text-right overflow-x-auto max-w-[70%] scrollbar-none whitespace-nowrap text-slate-400 font-mono text-sm md:text-base">
          {expression || '0'}
        </div>
      </div>

      {/* Main Result / Paywall Area */}
      <div className="flex flex-col items-end justify-end flex-grow">
        {isLoading ? (
          <div className="flex items-center gap-2 text-emerald-400 py-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-mono tracking-wider">CALCULATING ANSWER...</span>
          </div>
        ) : error ? (
          <div className="text-rose-400 text-sm md:text-base font-mono bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl animate-shake">
            ⚠️ {error}
          </div>
        ) : isLocked ? (
          <div className="w-full flex flex-col items-end gap-2 animate-fadeIn">
            {/* Blurred Mock Result Placeholder */}
            <div className="relative w-full flex items-center justify-between group cursor-pointer" onClick={onOpenPaywall}>
              <div className="text-xs text-amber-300/80 font-mono flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                <Lock className="w-3 h-3 text-amber-400 animate-bounce" />
                <span>Premium Secret Answer</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold font-mono tracking-wider select-none text-slate-300 filter blur-[7px] group-hover:blur-[5px] transition-all">
                ████████
              </div>
            </div>

            {/* Hint & Pay CTA Button */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 mt-1">
              <span className="text-[11px] text-slate-400 italic max-w-[200px] truncate">
                💡 {hint || 'Pay to unlock this mathematical result.'}
              </span>
              <button
                type="button"
                onClick={onOpenPaywall}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reveal for $0.50</span>
              </button>
            </div>
          </div>
        ) : result !== null ? (
          <div className="flex flex-col items-end gap-1 animate-fadeIn">
            <div className="text-3xl md:text-5xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 selection:bg-emerald-500 selection:text-black">
              = {result}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
              <span>✓ PAID & VERIFIED INVOICE</span>
            </div>
          </div>
        ) : (
          <div className="text-3xl md:text-5xl font-light font-mono text-slate-600">
            0
          </div>
        )}
      </div>
    </div>
  );
};
