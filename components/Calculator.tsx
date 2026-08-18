'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, Crown, Zap, DollarSign } from 'lucide-react';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { PaywallModal } from './PaywallModal';
import { HistoryLedger, HistoryItem } from './HistoryLedger';
import { StripeSetupBanner } from './StripeSetupBanner';
import { sounds } from '@/lib/sound';
import {
  getOrCreateSessionToken,
  getLocalUnlockedMap,
  saveLocalUnlocked,
  getStoredPass,
  saveStoredPass,
  LocalPassInfo,
} from '@/lib/session';

export const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [currentCalcId, setCurrentCalcId] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showScientific, setShowScientific] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  const [sessionToken, setSessionToken] = useState<string>('');
  const [activePass, setActivePass] = useState<LocalPassInfo | null>(null);
  const [isStripeConfigured, setIsStripeConfigured] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initialize session & check Stripe status
  useEffect(() => {
    const token = getOrCreateSessionToken();
    setSessionToken(token);

    const pass = getStoredPass();
    if (pass) {
      setActivePass(pass);
    }

    // Check Stripe server status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsStripeConfigured(Boolean(data.isStripeConfigured));
      })
      .catch(() => {});

    // Load local history
    try {
      const storedHistory = localStorage.getItem('paycalc_history_items');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update history in storage
  const updateHistory = (newItems: HistoryItem[]) => {
    setHistory(newItems);
    try {
      localStorage.setItem('paycalc_history_items', JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  // Toggle Sound
  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playKeyClick(650);
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  // Handle Keypad Character Input
  const handleInput = useCallback(
    (char: string) => {
      setError(null);

      // If previous state had a result or was locked, start fresh if typing new numbers
      if (result !== null || isLocked) {
        if (![' + ', ' − ', ' × ', ' ÷ ', '^', '%'].includes(char)) {
          setExpression(char);
          setResult(null);
          setIsLocked(false);
          setCurrentCalcId(null);
          setCurrentHint(null);
          return;
        } else if (result !== null) {
          // Chain operation with previous result
          setExpression(result + char);
          setResult(null);
          setIsLocked(false);
          setCurrentCalcId(null);
          setCurrentHint(null);
          return;
        }
      }

      setExpression((prev) => prev + char);
    },
    [result, isLocked]
  );

  // Clear All
  const handleClear = useCallback(() => {
    setExpression('');
    setResult(null);
    setIsLocked(false);
    setCurrentCalcId(null);
    setCurrentHint(null);
    setError(null);
  }, []);

  // Delete Single Character
  const handleDelete = useCallback(() => {
    setError(null);
    if (result !== null || isLocked) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.endsWith(' + ') || prev.endsWith(' − ') || prev.endsWith(' × ') || prev.endsWith(' ÷ ')) {
        return prev.slice(0, -3);
      }
      if (prev.endsWith('sin(') || prev.endsWith('cos(') || prev.endsWith('tan(') || prev.endsWith('log(')) {
        return prev.slice(0, -4);
      }
      if (prev.endsWith('log10(') || prev.endsWith('sqrt(')) {
        return prev.slice(0, -5);
      }
      return prev.slice(0, -1);
    });
  }, [result, isLocked, handleClear]);

  // Execute Calculation (Sends to backend for paywalled evaluation)
  const handleCalculate = useCallback(async () => {
    if (!expression || expression.trim() === '') return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression,
          sessionToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Calculation error');
      }

      if (data.unlocked) {
        // Result is already unlocked (e.g. VIP pass or active day pass)
        setResult(data.result);
        setIsLocked(false);
        setCurrentCalcId(data.id);
        sounds.playKeyClick(800);

        const newHistoryItem: HistoryItem = {
          id: data.id,
          expression: data.expression,
          result: data.result,
          unlocked: true,
          timestamp: Date.now(),
          tier: data.passType || 'vip',
        };
        updateHistory([newHistoryItem, ...history.filter((h) => h.id !== data.id)]);
      } else {
        // PAYWALL TRIGGERED!
        setIsLocked(true);
        setCurrentCalcId(data.id);
        setCurrentHint(data.hint);
        setResult(null);

        // Play padlock clank sound
        sounds.playLockSound();

        const newHistoryItem: HistoryItem = {
          id: data.id,
          expression: data.expression,
          unlocked: false,
          timestamp: data.timestamp || Date.now(),
          hint: data.hint,
        };
        updateHistory([newHistoryItem, ...history.filter((h) => h.id !== data.id)]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calculation error';
      setError(msg);
      sounds.playKeyClick(250);
    } finally {
      setIsLoading(false);
    }
  }, [expression, sessionToken, history]);

  // Handle successful unlock from modal or redirect
  const handleUnlockSuccess = (unlockedResult: string, tier: string, passExpiresAt?: number) => {
    setResult(unlockedResult);
    setIsLocked(false);
    setError(null);
    triggerConfetti();

    // If day pass or vip activated, update local session
    if (tier === 'day_pass' || tier === 'vip') {
      const newPass: LocalPassInfo = {
        type: tier,
        activatedAt: Date.now(),
        expiresAt: passExpiresAt || (tier === 'day_pass' ? Date.now() + 24 * 60 * 60 * 1000 : null),
      };
      setActivePass(newPass);
      saveStoredPass(newPass);
    }

    if (currentCalcId) {
      saveLocalUnlocked({
        id: currentCalcId,
        expression,
        result: unlockedResult,
        unlockedAt: Date.now(),
        tier,
      });

      // Update history record
      updateHistory(
        history.map((item) =>
          item.id === currentCalcId
            ? { ...item, unlocked: true, result: unlockedResult, tier }
            : item
        )
      );
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input/modal
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput(' + ');
      } else if (e.key === '-') {
        handleInput(' − ');
      } else if (e.key === '*' || e.key === 'x') {
        handleInput(' × ');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput(' ÷ ');
      } else if (e.key === '(' || e.key === ')') {
        handleInput(e.key);
      } else if (e.key === '^' || e.key === '%') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        if (isPaywallOpen) {
          setIsPaywallOpen(false);
        } else {
          handleClear();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleDelete, handleClear, isPaywallOpen]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto gap-4">
      {/* Top Banner with Stripe info */}
      <StripeSetupBanner isStripeConfigured={isStripeConfigured} />

      {/* Main Calculator Card */}
      <div className="w-full bg-slate-900/70 border border-slate-800 backdrop-blur-2xl rounded-[32px] p-5 md:p-6 shadow-2xl shadow-slate-950/60 flex flex-col gap-4 relative overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20">
              $
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>PayCalc</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  v1.0
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Pass Badge */}
            {activePass && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                {activePass.type === 'vip' ? (
                  <>
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>VIP LIFETIME</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>24H PASS</span>
                  </>
                )}
              </div>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isSoundEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <Display
          expression={expression}
          result={result}
          isLocked={isLocked}
          hint={currentHint}
          isLoading={isLoading}
          error={error}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          isVip={activePass?.type === 'vip'}
        />

        {/* Keypad */}
        <Keypad
          onInput={handleInput}
          onClear={handleClear}
          onDelete={handleDelete}
          onCalculate={handleCalculate}
          showScientific={showScientific}
          onToggleScientific={() => setShowScientific(!showScientific)}
          disabled={isLoading}
        />
      </div>

      {/* History Ledger Section */}
      <HistoryLedger
        items={history}
        onSelectCalculation={(item) => {
          setExpression(item.expression);
          if (item.unlocked && item.result) {
            setResult(item.result);
            setIsLocked(false);
            setCurrentCalcId(item.id);
          } else {
            setResult(null);
            setIsLocked(true);
            setCurrentCalcId(item.id);
            setCurrentHint(item.hint || null);
          }
        }}
        onClearHistory={() => updateHistory([])}
        onUnlockItem={(item) => {
          setExpression(item.expression);
          setCurrentCalcId(item.id);
          setCurrentHint(item.hint || null);
          setIsPaywallOpen(true);
        }}
      />

      {/* Paywall Checkout Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        calcId={currentCalcId}
        expression={expression}
        hint={currentHint}
        sessionToken={sessionToken}
        isStripeConfigured={isStripeConfigured}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </div>
  );
};
