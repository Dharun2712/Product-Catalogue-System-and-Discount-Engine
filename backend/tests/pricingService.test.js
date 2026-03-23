const {
  roundMoney,
  assertValidSubtotal,
  getCouponValidationResult,
  calculateCouponDiscount,
  calculateOrderTotal,
} = require('../services/pricingService');

describe('pricingService', () => {
  describe('roundMoney', () => {
    test('rounds floating point values safely to 2 decimals', () => {
      expect(roundMoney(10.005)).toBe(10.01);
      expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    });
  });

  describe('assertValidSubtotal', () => {
    test('accepts and rounds valid subtotals', () => {
      expect(assertValidSubtotal(99.999)).toBe(100);
    });

    test('throws for negative subtotal', () => {
      expect(() => assertValidSubtotal(-1)).toThrow('Subtotal must be a non-negative number');
    });

    test('throws for non-numeric subtotal', () => {
      expect(() => assertValidSubtotal('abc')).toThrow('Subtotal must be a non-negative number');
    });
  });

  describe('getCouponValidationResult', () => {
    const now = new Date('2026-01-15T00:00:00.000Z');

    test('rejects inactive coupons', () => {
      const result = getCouponValidationResult({ active: false }, 100, now);
      expect(result).toEqual({ valid: false, reason: 'inactive' });
    });

    test('rejects expired coupons', () => {
      const result = getCouponValidationResult(
        { active: true, expiry: '2026-01-01T00:00:00.000Z' },
        100,
        now,
      );

      expect(result).toEqual({ valid: false, reason: 'expired' });
    });

    test('rejects coupons when minimum order is not met', () => {
      const result = getCouponValidationResult(
        { active: true, expiry: '2026-12-01T00:00:00.000Z', minOrderValue: 500 },
        499.99,
        now,
      );

      expect(result).toEqual({
        valid: false,
        reason: 'minimum_order_not_met',
        minimumOrderValue: 500,
      });
    });
  });

  describe('calculateCouponDiscount', () => {
    test('calculates percentage discount and applies cap', () => {
      const coupon = { type: 'percentage', value: 20, maxDiscountCap: 100 };
      expect(calculateCouponDiscount(coupon, 1000)).toBe(100);
    });

    test('clamps fixed discount to subtotal', () => {
      const coupon = { type: 'fixed', value: 999 };
      expect(calculateCouponDiscount(coupon, 120)).toBe(120);
    });

    test('returns zero for invalid coupon values', () => {
      const coupon = { type: 'fixed', value: -50 };
      expect(calculateCouponDiscount(coupon, 120)).toBe(0);
    });
  });

  describe('calculateOrderTotal', () => {
    test('never allows total below zero', () => {
      expect(calculateOrderTotal(100, 999)).toBe(0);
    });

    test('rounds final total correctly', () => {
      expect(calculateOrderTotal(99.999, 10.005)).toBe(89.99);
    });
  });
});
