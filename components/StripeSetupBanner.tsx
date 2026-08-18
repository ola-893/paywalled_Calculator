'use client';

import React, { useState } from 'react';
import { CreditCard, HelpCircle, X, Check, Copy, KeyRound, ShieldAlert } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface StripeSetupBannerProps {
  isStripeConfigured: boolean;
}

export const StripeSetupBanner: React.FC<StripeSetupBannerProps> = ({ isStripeConfigured }) => {
  const [showModal, setShowModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    sounds.playKeyClick(600);
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      {/* Top Banner / Pill */}
      <div className="flex items-center justify-center w-full px-4 pt-4">
        <button
          type="button"
          onClick={() => {
            sounds.playKeyClick(500);
            setShowModal(true);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-lg ${
            isStripeConfigured
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
              : 'bg-amber-950/50 border-amber-500/40 text-amber-300 shadow-amber-500/10'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStripeConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isStripeConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <CreditCard className="w-3.5 h-3.5" />
          <span>
            {isStripeConfigured
              ? 'Stripe Checkout Connected'
              : 'Stripe Paywall Demo Mode (Click for Setup)'}
          </span>
          <HelpCircle className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* Info & Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 text-left">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Stripe Integration Status</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {isStripeConfigured ? '🟢 Live / Test API Keys Configured' : '🟡 Test Simulation Mode Active'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                The app comes with built-in <strong>Stripe Checkout</strong> support.
                You can test both <strong>real Stripe Checkout</strong> and <strong>instant demo simulation</strong>!
              </p>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-2">
                <div className="text-slate-400">// To use your real Stripe Test API Keys, add to .env.local:</div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-emerald-400">STRIPE_SECRET_KEY=sk_test_...</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('STRIPE_SECRET_KEY=sk_test_your_key_here', 'secret')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-cyan-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here', 'pub')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-2xl text-[11px] text-indigo-300">
                <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Stripe Test Cards:</strong> In test mode, Stripe accepts <code>4242 4242 4242 4242</code> with any future expiration date and CVC.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              Got it, let's calculate!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
