import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { store } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const calcId = searchParams.get('calc_id');
    const tier = searchParams.get('tier') as 'single' | 'day_pass' | 'vip' | null;
    const sessionToken = searchParams.get('session_token');

    if (!sessionId && !calcId) {
      return NextResponse.json({ error: 'Missing session_id or calc_id' }, { status: 400 });
    }

    let verifiedTier: 'single' | 'day_pass' | 'vip' = tier || 'single';
    let verifiedCalcId = calcId;
    let verifiedSessionToken = sessionToken;

    // If Stripe is configured and session_id is provided, verify with Stripe API
    if (isStripeConfigured && stripe && sessionId && sessionId !== 'simulated') {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment has not been completed or was unsuccessful' },
          { status: 400 }
        );
      }

      // Read metadata from Stripe session
      if (session.metadata) {
        verifiedTier = (session.metadata.tier as 'single' | 'day_pass' | 'vip') || verifiedTier;
        verifiedCalcId = session.metadata.calcId || verifiedCalcId;
        verifiedSessionToken = session.metadata.sessionToken || verifiedSessionToken;
      }
    }

    let calculation = verifiedCalcId ? store.getCalculation(verifiedCalcId) : undefined;
    let activatedPass = null;

    // Handle pass activation
    if (verifiedSessionToken && (verifiedTier === 'day_pass' || verifiedTier === 'vip')) {
      activatedPass = store.activatePass(verifiedSessionToken, verifiedTier);
    }

    // Unlock calculation if applicable
    if (verifiedCalcId) {
      calculation = store.unlockCalculation(verifiedCalcId, verifiedTier);
    }

    return NextResponse.json({
      success: true,
      calcId: verifiedCalcId,
      result: calculation?.result,
      expression: calculation?.expression,
      tier: verifiedTier,
      pass: activatedPass,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
