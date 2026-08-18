'use client';

import React from 'react';
import { Delete, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface KeypadProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
  showScientific: boolean;
  onToggleScientific: () => void;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onClear,
  onDelete,
  onCalculate,
  showScientific,
  onToggleScientific,
  disabled = false,
}) => {
  const handlePress = (char: string, pitch = 600) => {
    sounds.playKeyClick(pitch);
    onInput(char);
  };

  const handleAction = (action: () => void, pitch = 450) => {
    sounds.playKeyClick(pitch);
    action();
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Scientific Mode Toggle Header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => {
            sounds.playKeyClick(500);
            onToggleScientific();
          }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/50 cursor-pointer"
        >
          <span>Scientific Functions</span>
          {showScientific ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[10px] text-slate-500 font-mono">
          Standard Keypad
        </span>
      </div>

      {/* Scientific Functions Grid (Collapsible) */}
      {showScientific && (
        <div className="grid grid-cols-5 gap-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl animate-fadeIn backdrop-blur-md">
          {[
            { label: 'sin', val: 'sin(' },
            { label: 'cos', val: 'cos(' },
            { label: 'tan', val: 'tan(' },
            { label: 'log', val: 'log10(' },
            { label: 'ln', val: 'log(' },
            { label: '√', val: 'sqrt(' },
            { label: '^', val: '^' },
            { label: '(', val: '(' },
            { label: ')', val: ')' },
            { label: 'π', val: 'π' },
            { label: 'e', val: 'e' },
            { label: '!', val: '!' },
            { label: 'abs', val: 'abs(' },
            { label: '%', val: '%' },
            { label: '1/x', val: '1/(' },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              disabled={disabled}
              onClick={() => handlePress(btn.val, 750)}
              className="py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-800 hover:border-slate-700 active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Standard Calculator Grid */}
      <div className="grid grid-cols-4 gap-2.5 md:gap-3">
        {/* Row 1 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onClear, 400)}
          className="h-14 md:h-16 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold font-mono text-base md:text-lg active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          AC
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onDelete, 450)}
          className="h-14 md:h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress('%', 650)}
          className="h-14 md:h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold font-mono text-base md:text-lg active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          %
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress(' ÷ ', 700)}
          className="h-14 md:h-16 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold font-mono text-xl active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          ÷
        </button>

        {/* Row 2 */}
        {['7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => handlePress(num, 580)}
            className="h-14 md:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold font-mono text-xl md:text-2xl active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-cyan-950/20 disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress(' × ', 700)}
          className="h-14 md:h-16 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold font-mono text-xl active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          ×
        </button>

        {/* Row 3 */}
        {['4', '5', '6'].map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => handlePress(num, 580)}
            className="h-14 md:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold font-mono text-xl md:text-2xl active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress(' − ', 700)}
          className="h-14 md:h-16 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold font-mono text-xl active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          −
        </button>

        {/* Row 4 */}
        {['1', '2', '3'].map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => handlePress(num, 580)}
            className="h-14 md:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold font-mono text-xl md:text-2xl active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress(' + ', 700)}
          className="h-14 md:h-16 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold font-mono text-xl active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress('00', 580)}
          className="h-14 md:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold font-mono text-lg active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          00
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress('0', 580)}
          className="h-14 md:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold font-mono text-xl md:text-2xl active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress('.', 600)}
          className="h-14 md:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold font-mono text-2xl active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          .
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onCalculate, 300)}
          className="h-14 md:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black font-mono text-2xl flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>=</span>
        </button>
      </div>
    </div>
  );
};
