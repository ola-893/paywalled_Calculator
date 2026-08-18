import { create, all } from 'mathjs';

const math = create(all, {});

// Limit certain unsafe mathjs functions if needed
const limitedEvaluate = math.evaluate;

export interface MathResult {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Safely evaluates a mathematical expression string.
 */
export function evaluateExpression(expression: string): MathResult {
  try {
    if (!expression || expression.trim() === '') {
      return { success: false, error: 'Empty expression' };
    }

    // Clean up display symbols to standard math symbols
    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
      .replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)')
      .trim();

    // Prevent excessive length
    if (sanitized.length > 300) {
      return { success: false, error: 'Expression is too long' };
    }

    // Evaluate
    const rawResult = limitedEvaluate(sanitized);

    if (rawResult === undefined || rawResult === null) {
      return { success: false, error: 'Invalid expression' };
    }

    // Handle complex numbers, matrices, or functions
    if (typeof rawResult === 'function') {
      return { success: false, error: 'Incomplete function call' };
    }

    // Format number nicely
    let formatted: string;
    if (typeof rawResult === 'number') {
      if (!isFinite(rawResult)) {
        return { success: false, error: 'Result is infinite or undefined' };
      }
      if (isNaN(rawResult)) {
        return { success: false, error: 'Result is Not a Number (NaN)' };
      }

      // Round floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
      formatted = math.format(rawResult, { precision: 12 });
    } else {
      formatted = rawResult.toString();
    }

    return {
      success: true,
      result: formatted,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Calculation error';
    return {
      success: false,
      error: message.replace(/mathjs/gi, 'calculator'),
    };
  }
}
