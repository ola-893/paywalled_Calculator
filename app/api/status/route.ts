import { NextResponse } from 'next/server';
import { isStripeConfigured } from '@/lib/stripe';

export async function GET() {
  const hasSecretKey = isStripeConfigured;
  const hasPublishableKey = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')
  );

  return NextResponse.json({
    isStripeConfigured: hasSecretKey,
    hasPublishableKey,
    mode: hasSecretKey ? 'live_or_test_stripe' : 'demo_simulation',
  });
}
