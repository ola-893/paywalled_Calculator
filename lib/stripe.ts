import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || '';

export const isStripeConfigured = Boolean(apiKey && apiKey.startsWith('sk_'));

export const stripe = isStripeConfigured
  ? new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  : null;

export interface PricingTier {
  id: 'single' | 'day_pass' | 'vip';
  name: string;
  price: number; // in cents
  displayPrice: string;
  badge?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  single: {
    id: 'single',
    name: 'Single Calculation Unlock',
    price: 50, // $0.50
    displayPrice: '$0.50',
    description: 'Instant reveal for this specific calculation.',
    features: [
      'Unlocks the exact answer right now',
      'Downloadable Official Receipt',
      'Added to your unlocked history ledger'
    ],
  },
  day_pass: {
    id: 'day_pass',
    name: '24-Hour Math Pass',
    price: 299, // $2.99
    displayPrice: '$2.99',
    badge: '⚡ Most Popular',
    popular: true,
    description: 'Unlimited calculations and instant answers for 24 hours.',
    features: [
      'Unlimited instant answers for 24 hours',
      'Zero wait time / zero locked screens',
      'Scientific calculations included',
      'Export calculation history'
    ],
  },
  vip: {
    id: 'vip',
    name: 'Lifetime Calculator VIP',
    price: 999, // $9.99
    displayPrice: '$9.99',
    badge: '👑 Best Value',
    description: 'Never pay a toll to calculate anything ever again.',
    features: [
      'Lifetime VIP status on this device',
      'Exclusive Golden VIP Calculator Theme',
      'Priority server-grade floating-point compute',
      'Bragging rights on your financial math acumen'
    ],
  },
};
