import { NextRequest, NextResponse } from 'next/server';
import { evaluateExpression } from '@/lib/math';
import { store } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { expression, sessionToken } = body;

    if (!expression || typeof expression !== 'string') {
      return NextResponse.json({ error: 'Expression is required' }, { status: 400 });
    }

    // Evaluate the expression safely on the server
    const mathResult = evaluateExpression(expression);

    if (!mathResult.success || mathResult.result === undefined) {
      return NextResponse.json(
        { error: mathResult.error || 'Syntax error in calculation' },
        { status: 400 }
      );
    }

    // Check if the user has an active 24h Day Pass or Lifetime VIP pass
    const activePass = sessionToken ? store.getUserPass(sessionToken) : null;
    const isPassActive = Boolean(activePass);

    // Save calculation to server-side store
    const record = store.saveCalculation(
      expression,
      mathResult.result,
      isPassActive,
      activePass?.type
    );

    if (isPassActive) {
      // User has VIP / Day Pass - return the answer immediately
      return NextResponse.json({
        id: record.id,
        expression: record.expression,
        result: record.result,
        unlocked: true,
        unlockedAt: record.unlockedAt,
        passType: record.passType,
        passExpiresAt: activePass?.expiresAt,
      });
    }

    // Otherwise, return paywalled / locked record WITHOUT the actual answer
    return NextResponse.json({
      id: record.id,
      expression: record.expression,
      unlocked: false,
      hint: record.hint,
      timestamp: record.timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
