import { describe, it, expect } from 'vitest';
import { assertValidTransition } from '../../src/modules/orders/order-state-machine.js';
import { ORDER_STATUS } from '../../src/config/constants.js';

describe('Order State Machine Unit Tests', () => {
  it('allows valid state progressions', () => {
    expect(() => assertValidTransition('PENDING', 'PAYMENT_PROCESSING')).not.toThrow();
    expect(() => assertValidTransition('PAYMENT_PROCESSING', 'PAID')).not.toThrow();
    expect(() => assertValidTransition('PAID', 'PROCESSING')).not.toThrow();
    expect(() => assertValidTransition('PROCESSING', 'FULFILLED')).not.toThrow();
    expect(() => assertValidTransition('FULFILLED', 'COMPLETED')).not.toThrow();
  });

  it('allows valid cancellation and refund transitions', () => {
    expect(() => assertValidTransition('PAID', 'CANCELLED')).not.toThrow();
    expect(() => assertValidTransition('PAID', 'REFUNDED')).not.toThrow();
    expect(() => assertValidTransition('COMPLETED', 'REFUNDED')).not.toThrow();
  });

  it('rejects invalid or backwards state transitions with AppError', () => {
    // Cannot go backwards from PAID to PENDING
    expect(() => assertValidTransition('PAID', 'PENDING')).toThrow(/Cannot transition order status/);
    // Cannot skip from PENDING directly to COMPLETED
    expect(() => assertValidTransition('PENDING', 'COMPLETED')).toThrow(/Cannot transition order status/);
    // Cannot transition terminal states
    expect(() => assertValidTransition('CANCELLED', 'PAID')).toThrow(/Cannot transition order status/);
    expect(() => assertValidTransition('REFUNDED', 'COMPLETED')).toThrow(/Cannot transition order status/);
  });
});
