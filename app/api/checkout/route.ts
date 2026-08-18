import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured, PRICING_TIERS } from '@/lib/stripe';
import { store } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calcId, tier = 'single', sessionToken } = body;

    const selectedTier = PRICING_TIERS[tier] || PRICING_TIERS.single;

    // Check calculation validity if single unlock
    if (tier === 'single' && calcId) {
      const calc = store.getCalculation(calcId);
      if (!calc) {
        return NextResponse.json({ error: 'Calculation not found or expired' }, { status: 404 });
      }
      if (calc.unlocked) {
        return NextResponse.json({ error: 'This calculation is already unlocked' }, { status: 400 });
      }
    }

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({
        isDev: true,
        message: 'Stripe is not configured in .env.local. Use Demo Mode or provide Stripe keys.',
      });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `PayCalc: ${selectedTier.name}`,
              description: selectedTier.description,
              images: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'],
            },
            unit_amount: selectedTier.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        calcId: calcId || '',
        tier,
        sessionToken: sessionToken || '',
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&calc_id=${calcId || ''}&tier=${tier}`,
      cancel_url: `${origin}/cancel?calc_id=${calcId || ''}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
