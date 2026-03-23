function roundMoney(amount) {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
}

function assertValidSubtotal(subtotal) {
  const numericSubtotal = Number(subtotal);
  if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
    throw new Error('Subtotal must be a non-negative number');
  }
  return roundMoney(numericSubtotal);
}

function getCouponValidationResult(coupon, subtotal, now = new Date()) {
  if (!coupon) {
    return { valid: false, reason: 'not_found' };
  }

  if (!coupon.active) {
    return { valid: false, reason: 'inactive' };
  }

  if (coupon.expiry && new Date(coupon.expiry) < now) {
    return { valid: false, reason: 'expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: 'usage_limit_reached' };
  }

  const minimumOrderValue = Number(coupon.minOrderValue) || 0;
  if (subtotal < minimumOrderValue) {
    return {
      valid: false,
      reason: 'minimum_order_not_met',
      minimumOrderValue,
    };
  }

  return { valid: true };
}

function calculateCouponDiscount(coupon, subtotal) {
  const safeSubtotal = assertValidSubtotal(subtotal);

  if (!coupon) {
    return 0;
  }

  const couponValue = Number(coupon.value);
  if (!Number.isFinite(couponValue) || couponValue <= 0) {
    return 0;
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (couponValue / 100) * safeSubtotal;

    const maxDiscountCap = Number(coupon.maxDiscountCap);
    if (Number.isFinite(maxDiscountCap) && maxDiscountCap > 0) {
      discount = Math.min(discount, maxDiscountCap);
    }
  } else {
    discount = couponValue;
  }

  return roundMoney(Math.max(0, Math.min(discount, safeSubtotal)));
}

function calculateOrderTotal(subtotal, discount) {
  const safeSubtotal = assertValidSubtotal(subtotal);
  const safeDiscount = roundMoney(Number.isFinite(Number(discount)) ? Number(discount) : 0);
  const clampedDiscount = Math.max(0, Math.min(safeDiscount, safeSubtotal));
  return roundMoney(safeSubtotal - clampedDiscount);
}

module.exports = {
  roundMoney,
  assertValidSubtotal,
  getCouponValidationResult,
  calculateCouponDiscount,
  calculateOrderTotal,
};
