import { describe, it, expect } from 'vitest';
import { formatCentsToCurrency, dollarsToCents } from '../../src/shared/money/money.js';

describe('Pricing & Currency Utilities Unit Tests', () => {
  it('formats cents to INR currency string cleanly by default and USD when specified', () => {
    expect(formatCentsToCurrency(2500)).toBe('₹25.00');
    expect(formatCentsToCurrency(0)).toBe('₹0.00');
    expect(formatCentsToCurrency(99)).toBe('₹0.99');
    expect(formatCentsToCurrency(150000)).toBe('₹1,500.00');
    expect(formatCentsToCurrency(2500, 'USD')).toBe('$25.00');
  });

  it('supports custom currency codes', () => {
    expect(formatCentsToCurrency(1000, 'EUR')).toContain('10.00');
  });

  it('converts floating-point dollars to integer cents accurately with rounding', () => {
    expect(dollarsToCents(49.99)).toBe(4999);
    expect(dollarsToCents(0.01)).toBe(1);
    expect(dollarsToCents(100)).toBe(10000);
    // Floating point precision test: 19.99 * 100 often is 1998.9999999999998 in raw JS
    expect(dollarsToCents(19.99)).toBe(1999);
  });
});
