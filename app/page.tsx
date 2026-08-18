import { Calculator } from '@/components/Calculator';
import { ShieldCheck, Sparkles, Zap, Lock, DollarSign, Calculator as CalcIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 md:p-8 relative selection:bg-emerald-500 selection:text-black">
      {/* Background glowing orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <header className="w-full max-w-4xl flex flex-col items-center text-center gap-3 pt-4 pb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The World's First Paywalled Mathematical Utility</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Why Get Math for Free in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">
            This Economy?
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-xl">
          Enter any calculation. Our high-precision cloud arithmetic engines will compute the exact answer—then lock it securely behind a Stripe paywall.
        </p>
      </header>

      {/* Main Interactive Calculator */}
      <section className="w-full max-w-md z-10 my-2">
        <Calculator />
      </section>

      {/* Feature Highlights / Humorous Pitch */}
      <section className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 my-10 z-10 text-left">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">True Server Paywall</h3>
          <p className="text-xs text-slate-400">
            No Inspect Element tricks! Your answer is computed server-side and only revealed once verified by Stripe.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Dynamic Pricing</h3>
          <p className="text-xs text-slate-400">
            Choose between $0.50 Single Unlock, $2.99 24h Math Pass, or $9.99 Lifetime VIP access.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col gap-2">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Stripe Verified</h3>
          <p className="text-xs text-slate-400">
            Industry standard payments via Stripe Checkout. Test sandbox mode enabled for immediate demo testing.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-6 border-t border-slate-900 text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span>PayCalc • Monetizing Basic Arithmetic</span>
        </div>
        <p>Built with Next.js, Tailwind CSS & Stripe</p>
      </footer>
    </main>
  );
}
