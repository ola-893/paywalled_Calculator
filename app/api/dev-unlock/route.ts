import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calcId, tier = 'single', sessionToken } = body;

    let activatedPass = null;
    if (sessionToken && (tier === 'day_pass' || tier === 'vip')) {
      activatedPass = store.activatePass(sessionToken, tier);
    }

    let calculation = undefined;
    if (calcId) {
      calculation = store.unlockCalculation(calcId, 'simulated');
    }

    return NextResponse.json({
      success: true,
      simulated: true,
      calcId,
      result: calculation?.result,
      expression: calculation?.expression,
      tier,
      pass: activatedPass,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Dev unlock error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
