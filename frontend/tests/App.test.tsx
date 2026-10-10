import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../src/utils/currency';
import { dollarsToCents, centsToDollars } from '../src/utils/money';
import { checkPermission } from '../src/utils/permissions';

describe('Frontend Core Utilities & Business Rules', () => {
  describe('Financial Calculations & Currency Formatting', () => {
    it('formats cents into canonical INR currency display by default and USD when specified', () => {
      expect(formatCurrency(0)).toBe('₹0.00');
      expect(formatCurrency(199)).toBe('₹1.99');
      expect(formatCurrency(4999)).toBe('₹49.99');
      expect(formatCurrency(125000)).toBe('₹1,250.00');
      expect(formatCurrency(4999, 'USD')).toBe('$49.99');
    });

    it('converts dollar amounts to integer cents avoiding float drift', () => {
      expect(dollarsToCents(49.99)).toBe(4999);
      expect(dollarsToCents('25.50')).toBe(2550);
      expect(dollarsToCents(0.01)).toBe(1);
      expect(dollarsToCents('0')).toBe(0);
    });

    it('converts integer cents back to formatted dollar strings', () => {
      expect(centsToDollars(4999)).toBe('49.99');
      expect(centsToDollars(100)).toBe('1.00');
      expect(centsToDollars(5)).toBe('0.05');
    });
  });

  describe('Role-Based Access Control & Permission Checks', () => {
    it('grants access when wildcard permission is present', () => {
      expect(checkPermission(['*'], 'products:delete')).toBe(true);
      expect(checkPermission(['*'], 'stores:settings')).toBe(true);
    });

    it('grants access only when specific required permission is held', () => {
      const staffPerms = ['products:read', 'orders:read', 'orders:update'];
      expect(checkPermission(staffPerms, 'products:read')).toBe(true);
      expect(checkPermission(staffPerms, 'orders:update')).toBe(true);
      expect(checkPermission(staffPerms, 'stores:delete')).toBe(false);
      expect(checkPermission(staffPerms, 'team:invite')).toBe(false);
    });
  });

  describe('Cart Calculation Integrity', () => {
    it('computes subtotal correctly from items with integer cents', () => {
      const items = [
        { priceCents: 2500, quantity: 2 },
        { priceCents: 6000, quantity: 1 }
      ];
      const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      expect(subtotalCents).toBe(11000); // $110.00
    });
  });
});
