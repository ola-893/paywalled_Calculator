import crypto from 'crypto';

export interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  unlocked: boolean;
  unlockedAt?: number;
  passType?: 'single' | 'day_pass' | 'vip' | 'simulated';
  hint?: string;
}

export interface UserPass {
  type: 'day_pass' | 'vip';
  activatedAt: number;
  expiresAt: number | null; // null for lifetime VIP
}

// Global in-memory storage for calculations and passes (persists during server lifetime)
// In production, this would be backed by Redis or PostgreSQL, but memory store works seamlessly for this app
class Store {
  private calculations: Map<string, CalculationRecord> = new Map();
  private userPasses: Map<string, UserPass> = new Map();

  constructor() {
    // Periodic cleanup of records older than 24 hours
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 1000 * 60 * 60);
    }
  }

  private cleanup() {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    for (const [id, record] of this.calculations.entries()) {
      if (record.timestamp < oneDayAgo && !record.unlocked) {
        this.calculations.delete(id);
      }
    }
  }

  saveCalculation(expression: string, result: string, isAlreadyUnlocked: boolean = false, passType?: CalculationRecord['passType']): CalculationRecord {
    const id = crypto.randomUUID();
    
    // Generate a funny teaser/hint
    const hints = [
      "It has numbers in it. That's all we can say for free.",
      "The answer is between -∞ and +∞. Pay $0.50 to narrow it down.",
      "Our AI supercomputers worked tirelessly on this.",
      "Inflation affects math too! $0.50 unlocks the secret.",
      "Behind this blur lies the mathematical truth.",
      "Calculated with 99.999% precision. Worth every penny.",
      "Einstein would have paid for this."
    ];
    const hint = hints[Math.floor(Math.random() * hints.length)];

    const record: CalculationRecord = {
      id,
      expression,
      result,
      timestamp: Date.now(),
      unlocked: isAlreadyUnlocked,
      unlockedAt: isAlreadyUnlocked ? Date.now() : undefined,
      passType: isAlreadyUnlocked ? passType : undefined,
      hint,
    };

    this.calculations.set(id, record);
    return record;
  }

  getCalculation(id: string): CalculationRecord | undefined {
    return this.calculations.get(id);
  }

  unlockCalculation(id: string, passType: CalculationRecord['passType']): CalculationRecord | undefined {
    const record = this.calculations.get(id);
    if (!record) return undefined;

    record.unlocked = true;
    record.unlockedAt = Date.now();
    record.passType = passType;
    this.calculations.set(id, record);
    return record;
  }

  activatePass(sessionToken: string, type: 'day_pass' | 'vip'): UserPass {
    const now = Date.now();
    const expiresAt = type === 'day_pass' ? now + 24 * 60 * 60 * 1000 : null;
    const pass: UserPass = {
      type,
      activatedAt: now,
      expiresAt,
    };
    this.userPasses.set(sessionToken, pass);
    return pass;
  }

  getUserPass(sessionToken: string): UserPass | null {
    if (!sessionToken) return null;
    const pass = this.userPasses.get(sessionToken);
    if (!pass) return null;

    // Check expiration for day pass
    if (pass.expiresAt && Date.now() > pass.expiresAt) {
      this.userPasses.delete(sessionToken);
      return null;
    }
    return pass;
  }

  getAllUserCalculations(ids: string[]): CalculationRecord[] {
    const records: CalculationRecord[] = [];
    for (const id of ids) {
      const record = this.calculations.get(id);
      if (record) {
        records.push(record);
      }
    }
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Ensure singleton across HMR in dev
declare global {
  var __paycalc_store: Store | undefined;
}

export const store = globalThis.__paycalc_store || new Store();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__paycalc_store = store;
}
