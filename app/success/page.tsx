'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Receipt,
  Download,
  Crown,
  Zap,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { sounds } from '@/lib/sound';
import {
  getOrCreateSessionToken,
  saveLocalUnlocked,
  saveStoredPass,
  LocalPassInfo,
} from '@/lib/session';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('session_id');
  const calcId = searchParams.get('calc_id');
  const tier = searchParams.get('tier') || 'single';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    result?: string;
    expression?: string;
    tier?: string;
    pass?: LocalPassInfo | null;
  } | null>(null);

  useEffect(() => {
    const token = getOrCreateSessionToken();

    const verifyPayment = async () => {
      try {
        const url = `/api/verify?session_id=${encodeURIComponent(sessionId || '')}&calc_id=${encodeURIComponent(calcId || '')}&tier=${encodeURIComponent(tier)}&session_token=${encodeURIComponent(token)}`;
        const res = await fetch(url);
        const resultJson = await res.json();

        if (!res.ok) {
          throw new Error(resultJson.error || 'Verification failed');
        }

        setData(resultJson);

        // Save unlock to local session
        if (resultJson.calcId && resultJson.result) {
          saveLocalUnlocked({
            id: resultJson.calcId,
            expression: resultJson.expression || '',
            result: resultJson.result,
            unlockedAt: Date.now(),
            tier: resultJson.tier || tier,
          });
        }

        // Save pass if applicable
        if (resultJson.pass) {
          saveStoredPass(resultJson.pass);
        }

        // Celebrate!
        sounds.playCashRegister();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to verify payment';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, calcId, tier]);

  const handlePrintReceipt = () => {
    sounds.playKeyClick(600);
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
        <h2 className="text-xl font-bold font-mono">Verifying Stripe Payment...</h2>
        <p className="text-xs text-slate-500">Decrypting your calculation results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-rose-950/40 border border-rose-500/40 rounded-3xl text-center flex flex-col items-center gap-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Verification Issue</h2>
        <p className="text-xs text-rose-200">{error}</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Calculator</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 my-8 px-4 animate-fadeIn">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/25 animate-bounce">
        <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
      </div>

      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PAYMENT VERIFIED & UNLOCKED</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight pt-2">
          Your Answer Is Revealed!
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Thank you for funding the future of cloud-computed arithmetic.
        </p>
      </div>

      {/* Main Answer Card */}
      <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Calculation Box */}
        {data?.expression && (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800/80 gap-2">
            <div className="font-mono text-sm text-slate-400">
              {data.expression}
            </div>
            <div className="font-mono font-black text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300">
              = {data.result}
            </div>
            <div className="text-[10px] font-mono text-emerald-400/80 mt-1">
              ✓ 100% MATHEMATICALLY ACCURATE
            </div>
          </div>
        )}

        {/* Pass activated info */}
        {data?.pass && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30">
            {data.pass.type === 'vip' ? (
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
            ) : (
              <Zap className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-white block">
                {data.pass.type === 'vip' ? '👑 Lifetime VIP Activated!' : '⚡ 24-Hour Math Pass Active!'}
              </span>
              <span className="text-slate-400">
                You can now perform unlimited calculations without paywalls.
              </span>
            </div>
          </div>
        )}

        {/* Official Receipt Snippet */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-2 font-mono text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Invoice Item:</span>
            </span>
            <span className="text-slate-200">
              {data?.tier === 'vip' ? 'Lifetime VIP ($9.99)' : data?.tier === 'day_pass' ? '24h Pass ($2.99)' : 'Single Unlock ($0.50)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Transaction Status:</span>
            <span className="text-emerald-400 font-bold">PAID (STRIPE)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Timestamp:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Calculator</span>
          </button>
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="px-4 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-emerald-400" />}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
