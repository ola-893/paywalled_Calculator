# 🧮 PayCalc — The Stripe-Paywalled Calculator

A sleek, satirical yet fully functional calculator web application that calculates any mathematical expression, but locks the answer behind a **Stripe paywall**.

---

## ✨ Features

- **Full Mathematical Utility**: Standard arithmetic (`+`, `-`, `×`, `÷`, `%`, `^`) + expandable scientific operations (`sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `π`, `e`, factorials).
- **Server-Side Paywall Security**: Calculations are securely evaluated and locked server-side with an encrypted identifier and teaser hint. No inspect-element bypasses!
- **Stripe Checkout Integration**:
  - **Single Calculation Unlock ($0.50)**: Instant reveal for the current calculation.
  - **24-Hour Math Pass ($2.99)**: Unlimited instant answers without paywalls for 24 hours.
  - **Lifetime VIP Access ($9.99)**: Permanent VIP badge and unlimited free unlocks.
- **Built-in Demo & Sandbox Mode**: Works out of the box with one-click simulated unlocks, plus full support for real Stripe Test/Live API keys.
- **Celebration & Audio**:
  - Web Audio API synthesizer for tactile button clicks, lock clank sounds, and cash register "cha-ching" on unlock.
  - Confetti celebration on successful answer reveal.
- **Calculation Ledger & Receipts**: History ledger with status badges, reloadable expressions, and printable invoice receipts.
- **Full Keyboard Support**: Supports numbers, operators, `Enter`/`=`, `Backspace`, `Esc`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Configure Stripe API Keys
Create a `.env.local` file:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```
> *Note: If no Stripe keys are provided, the app automatically runs in **Demo Simulation Mode**, allowing you to test the full unlock flow without an account.*

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism design system
- **Payment Processing**: Stripe Node SDK & Stripe Checkout
- **Math Engine**: Math.js (safe sandboxed evaluation)
- **Animations & Effects**: Canvas Confetti, Web Audio API
