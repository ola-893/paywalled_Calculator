'use client';

import React from 'react';
import { History, Lock, Unlock, Trash2, Clock, ArrowUpRight } from 'lucide-react';
import { sounds } from '@/lib/sound';

export interface HistoryItem {
  id: string;
  expression: string;
  result?: string;
  unlocked: boolean;
  timestamp: number;
  tier?: string;
  hint?: string;
}

interface HistoryLedgerProps {
  items: HistoryItem[];
  onSelectCalculation: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onUnlockItem: (item: HistoryItem) => void;
}

export const HistoryLedger: React.FC<HistoryLedgerProps> = ({
  items,
  onSelectCalculation,
  onClearHistory,
  onUnlockItem,
}) => {
  return (
    <div className="w-full flex flex-col gap-3 bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Calculation Ledger</span>
          <span className="text-xs font-mono font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
            {items.length}
          </span>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick(400);
              onClearHistory();
            }}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-slate-900 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 text-xs">
            <Clock className="w-6 h-6 mb-2 stroke-1 opacity-50" />
            <p>No calculations yet.</p>
            <p className="text-[10px] text-slate-600">Calculations will be logged here.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition-all group"
            >
              {/* Left details */}
              <div
                className="flex flex-col gap-0.5 cursor-pointer max-w-[65%]"
                onClick={() => {
                  sounds.playKeyClick(600);
                  onSelectCalculation(item);
                }}
              >
                <div className="font-mono text-xs text-slate-400 group-hover:text-slate-200 truncate">
                  {item.expression}
                </div>

                {item.unlocked && item.result ? (
                  <div className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-1 truncate">
                    <span>= {item.result}</span>
                  </div>
                ) : (
                  <div className="font-mono text-xs text-slate-500 filter blur-[3px] select-none">
                    = ██████
                  </div>
                )}
              </div>

              {/* Right unlock status button */}
              <div className="flex items-center gap-1.5">
                {item.unlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-xl">
                    <Unlock className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playKeyClick(700);
                      onUnlockItem(item);
                    }}
                    className="flex items-center gap-1 text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-xl transition-all hover:scale-105 cursor-pointer shadow-sm"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>$0.50</span>
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
