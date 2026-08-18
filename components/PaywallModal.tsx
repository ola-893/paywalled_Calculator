'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Sparkles,
  CreditCard,
  Zap,
  Crown,
  Check,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { PRICING_TIERS, PricingTier } from '@/lib/stripe';
import { sounds } from '@/lib/sound';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  calcId: string | null;
  expression: string;
  hint?: string | null;
  sessionToken: string;
  isStripeConfigured: boolean;
  onUnlockSuccess: (result: string, tier: string, passExpiresAt?: number) => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  calcId,
  expression,
  hint,
  sessionToken,
  isStripeConfigured,
  onUnlockSuccess,
}) => {
  const [selectedTier, setSelectedTier] = useState<'single' | 'day_pass' | 'vip'>('single');
  const [loadingAction, setLoadingAction] = useState<'stripe' | 'simulated' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTierInfo: PricingTier = PRICING_TIERS[selectedTier] || PRICING_TIERS.single;

  const handleStripeCheckout = async () => {
    try {
      setLoadingAction('stripe');
      setErrorMessage(null);
      sounds.playKeyClick(600);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcId,
          tier: selectedTier,
          sessionToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize Stripe checkout');
      }

      if (data.url) {
        // Redirect to Stripe Checkout page
        window.location.href = data.url;
      } else if (data.isDev) {
        // Stripe keys are not yet provided in .env.local
        setErrorMessage(
          'Stripe API keys are not detected in .env.local yet. You can click "Instant Demo Unlock" below to test the unlock flow immediately, or add your STRIPE_SECRET_KEY!'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      setErrorMessage(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulatedUnlock = async () => {
    try {
      setLoadingAction('simulated');
      setErrorMessage(null);
      sounds.playKeyClick(700);

      const res = await fetch('/api/dev-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcId,
          tier: selectedTier,
          sessionToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to simulate payment');
      }

      // Play victory chime and celebrate
      sounds.playCashRegister();
      onUnlockSuccess(data.result, selectedTier, data.pass?.expiresAt);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      setErrorMessage(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-500/10 flex flex-col gap-6 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Unlock Your Answer
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md">
            Calculation for <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md">{expression || 'Expression'}</span> is ready and safely locked.
          </p>
          {hint && (
            <div className="text-[11px] text-amber-300/90 font-mono bg-amber-950/30 border border-amber-500/20 px-3 py-1 rounded-full">
              💡 {hint}
            </div>
          )}
        </div>

        {/* Pricing Tiers Selection */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Tier 1: Single */}
          <button
            type="button"
            onClick={() => setSelectedTier('single')}
            className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              selectedTier === 'single'
                ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/20 text-white'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-xs font-semibold">Single</span>
            <span className="text-base font-extrabold font-mono text-amber-400 mt-0.5">$0.50</span>
            <span className="text-[10px] text-slate-400 leading-tight mt-1">1 Calculation</span>
          </button>

          {/* Tier 2: 24h Pass */}
          <button
            type="button"
            onClick={() => setSelectedTier('day_pass')}
            className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              selectedTier === 'day_pass'
                ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/20 text-white'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[8px] uppercase tracking-wider">
              Popular
            </span>
            <Zap className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-xs font-semibold">24h Pass</span>
            <span className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">$2.99</span>
            <span className="text-[10px] text-slate-400 leading-tight mt-1">Unlimited 24h</span>
          </button>

          {/* Tier 3: Lifetime VIP */}
          <button
            type="button"
            onClick={() => setSelectedTier('vip')}
            className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              selectedTier === 'vip'
                ? 'bg-purple-500/15 border-purple-400 ring-2 ring-purple-400/20 text-white'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-purple-500 text-white font-black text-[8px] uppercase tracking-wider">
              VIP
            </span>
            <Crown className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-xs font-semibold">Lifetime</span>
            <span className="text-base font-extrabold font-mono text-purple-400 mt-0.5">$9.99</span>
            <span className="text-[10px] text-slate-400 leading-tight mt-1">Forever</span>
          </button>
        </div>

        {/* Selected Tier Features List */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              {currentTierInfo.name}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currentTierInfo.displayPrice}
            </span>
          </div>
          <p className="text-xs text-slate-400">{currentTierInfo.description}</p>
          <ul className="flex flex-col gap-1.5 pt-1">
            {currentTierInfo.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Primary Stripe Button */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={handleStripeCheckout}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAction === 'stripe' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Stripe...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay {currentTierInfo.displayPrice} with Stripe</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </>
            )}
          </button>

          {/* Secondary Demo Mode Instant Unlock */}
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={handleSimulatedUnlock}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAction === 'simulated' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Payment Unlock...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Demo Unlock (Test Sandbox)</span>
              </>
            )}
          </button>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted via Stripe Payments • 100% Satirical Guarantee</span>
        </div>
      </div>
    </div>
  );
};
