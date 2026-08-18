'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, RefreshCcw, DollarSign } from 'lucide-react';

function CancelContent() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-6 my-12 px-4 animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-xl">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Payment Cancelled
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Your calculation remains locked securely in our vault. No charges were made to your account.
        </p>
      </div>

      <div className="w-full p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2 text-left">
        <p className="flex items-center gap-1.5 text-slate-300 font-medium">
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Still need that mathematical truth?</span>
        </p>
        <p>
          You can return to the calculator at any time to unlock your result, or try our instant test demo sandbox.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-5 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Calculator</span>
        </button>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <CancelContent />
      </Suspense>
    </main>
  );
}
