import type { ServiceType } from "../types.js";

export type CouponType = "fixed" | "percent";
export type CouponScope = "all" | "escort" | "companion";

export type CouponTemplate = {
  id: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minSpend: number;
  maxDiscount: number;
  validDays: number;
  scope: CouponScope;
  enabled: boolean;
  sortOrder: number;
};

export type CouponLike = Pick<
  CouponTemplate,
  "type" | "value" | "minSpend" | "maxDiscount" | "scope" | "name"
>;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calcOrderSubtotal(unitPrice: number, quantity: number) {
  const qty = Math.max(1, Number(quantity) || 1);
  const unit = Number(unitPrice) || 0;
  return roundMoney(unit * qty);
}

export function couponMatchesScope(scope: CouponScope, serviceType: ServiceType) {
  if (scope === "all") return true;
  return scope === serviceType;
}

export function calcCouponDiscount(coupon: CouponLike, subtotal: number, serviceType: ServiceType) {
  const amount = Number(subtotal) || 0;
  if (amount <= 0) return 0;
  if (!couponMatchesScope(coupon.scope, serviceType)) return 0;
  if (amount < Number(coupon.minSpend) || 0) return 0;

  let discount = 0;
  if (coupon.type === "fixed") {
    discount = Number(coupon.value) || 0;
  } else {
    const fold = Number(coupon.value) || 10;
    discount = amount * (1 - fold / 10);
    const cap = Number(coupon.maxDiscount) || 0;
    if (cap > 0) discount = Math.min(discount, cap);
  }

  discount = roundMoney(Math.max(0, discount));
  return roundMoney(Math.min(discount, amount));
}

export function calcOrderTotalPaid(subtotal: number, couponDiscount: number) {
  return roundMoney(Math.max(0, subtotal - couponDiscount));
}

export function formatCouponValueLabel(coupon: Pick<CouponLike, "type" | "value">) {
  if (coupon.type === "percent") return `${coupon.value} 折`;
  return `¥${coupon.value}`;
}
