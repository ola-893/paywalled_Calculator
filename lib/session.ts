'use client';

const SESSION_KEY = 'paycalc_session_token';
const UNLOCKED_MAP_KEY = 'paycalc_unlocked_answers';
const PASS_KEY = 'paycalc_active_pass';

export interface LocalUnlockedCalc {
  id: string;
  expression: string;
  result: string;
  unlockedAt: number;
  tier: string;
}

export interface LocalPassInfo {
  type: 'day_pass' | 'vip';
  activatedAt: number;
  expiresAt: number | null;
}

export function getOrCreateSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = 'usr_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

export function getLocalUnlockedMap(): Record<string, LocalUnlockedCalc> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UNLOCKED_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalUnlocked(calc: LocalUnlockedCalc) {
  if (typeof window === 'undefined') return;
  try {
    const map = getLocalUnlockedMap();
    map[calc.id] = calc;
    localStorage.setItem(UNLOCKED_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getStoredPass(): LocalPassInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PASS_KEY);
    if (!raw) return null;
    const pass = JSON.parse(raw) as LocalPassInfo;
    if (pass.expiresAt && Date.now() > pass.expiresAt) {
      localStorage.removeItem(PASS_KEY);
      return null;
    }
    return pass;
  } catch {
    return null;
  }
}

export function saveStoredPass(pass: LocalPassInfo) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PASS_KEY, JSON.stringify(pass));
  } catch {
    // ignore
  }
}
