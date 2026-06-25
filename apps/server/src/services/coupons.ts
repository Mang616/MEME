import {
  getContentPageBySlug,
  getUserCoupon,
  insertUserCoupon,
  listUserCouponsByUser,
  updateUserCoupon,
} from "../db/index.js";
import { formatDateTime } from "../lib/format-time.js";
import {
  calcCouponDiscount,
  calcOrderSubtotal,
  calcOrderTotalPaid,
  type CouponTemplate,
} from "../lib/coupons.js";
import type { Product, ServiceType, UserCoupon } from "../types.js";

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + Math.max(1, days));
  return next;
}

function parseTemplates(payload: unknown): CouponTemplate[] {
  const items = (payload as { items?: CouponTemplate[] } | null)?.items;
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && item.enabled !== false);
}

export async function listCouponTemplates() {
  const page = await getContentPageBySlug("coupons");
  return parseTemplates(page?.payload);
}

function isCouponActive(coupon: UserCoupon, now = new Date()) {
  if (coupon.usedAt) return false;
  const expires = new Date(String(coupon.expiresAt).replace(/-/g, "/"));
  return !Number.isNaN(expires.getTime()) && expires.getTime() >= now.getTime();
}

export type UserCouponStatus = "available" | "used" | "expired";

export function getUserCouponStatus(coupon: UserCoupon, now = new Date()): UserCouponStatus {
  if (coupon.usedAt) return "used";
  if (!isCouponActive(coupon, now)) return "expired";
  return "available";
}

export async function listUserCouponsForWallet(userId: string) {
  const items = await listUserCouponsByUser(userId);
  const statusOrder: Record<UserCouponStatus, number> = {
    available: 0,
    used: 1,
    expired: 2,
  };
  return items
    .map((item) => ({
      ...item,
      status: getUserCouponStatus(item),
    }))
    .sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        a.expiresAt.localeCompare(b.expiresAt) ||
        b.claimedAt.localeCompare(a.claimedAt),
    );
}

export async function countActiveUserCoupons(userId: string) {
  const items = await listUserCouponsByUser(userId);
  return items.filter((item) => isCouponActive(item)).length;
}

export async function listAvailableUserCoupons(
  userId: string,
  input: { serviceType: ServiceType; subtotal: number },
) {
  const items = await listUserCouponsByUser(userId);
  return items
    .filter((item) => isCouponActive(item))
    .map((item) => {
      const discount = calcCouponDiscount(item, input.subtotal, input.serviceType);
      return {
        ...item,
        applicable: discount > 0,
        discount,
      };
    })
    .sort((a, b) => {
      if (a.applicable !== b.applicable) return a.applicable ? -1 : 1;
      return b.discount - a.discount || a.expiresAt.localeCompare(b.expiresAt);
    });
}

export function grantCouponFromTemplate(userId: string, template: CouponTemplate): UserCoupon {
  const now = new Date();
  return {
    id: `uc_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`,
    userId,
    templateId: template.id,
    name: template.name,
    description: template.description ?? "",
    type: template.type,
    value: template.value,
    minSpend: template.minSpend,
    maxDiscount: template.maxDiscount,
    scope: template.scope,
    expiresAt: formatDateTime(addDays(now, template.validDays)),
    usedAt: "",
    usedOrderId: "",
    claimedAt: formatDateTime(now),
  };
}

export async function grantDefaultCouponsForUser(userId: string) {
  const templates = await listCouponTemplates();
  const existing = await listUserCouponsByUser(userId);
  const ownedTemplateIds = new Set(existing.map((item) => item.templateId));
  const created: UserCoupon[] = [];

  for (const template of templates) {
    if (ownedTemplateIds.has(template.id)) continue;
    const coupon = grantCouponFromTemplate(userId, template);
    await insertUserCoupon(coupon);
    created.push(coupon);
  }

  return created;
}

export async function resolveOrderCouponPricing(input: {
  ownerUserId?: string;
  userCouponId?: string;
  product: Product;
  quantity: number;
}) {
  const subtotal = calcOrderSubtotal(input.product.price, input.quantity);
  if (!input.ownerUserId || !input.userCouponId) {
    return {
      subtotal,
      couponDiscount: 0,
      totalPaid: subtotal,
      userCouponId: undefined as string | undefined,
      couponName: undefined as string | undefined,
    };
  }

  const coupon = await getUserCoupon(input.userCouponId);
  if (!coupon || coupon.userId !== input.ownerUserId) {
    throw new Error("COUPON_NOT_FOUND");
  }
  if (!isCouponActive(coupon)) {
    throw new Error("COUPON_UNAVAILABLE");
  }

  const couponDiscount = calcCouponDiscount(coupon, subtotal, input.product.serviceType);
  if (couponDiscount <= 0) {
    throw new Error("COUPON_NOT_APPLICABLE");
  }

  return {
    subtotal,
    couponDiscount,
    totalPaid: calcOrderTotalPaid(subtotal, couponDiscount),
    userCouponId: coupon.id,
    couponName: coupon.name,
  };
}

export async function markUserCouponUsed(userCouponId: string, orderId: string) {
  const coupon = await getUserCoupon(userCouponId);
  if (!coupon) {
    throw new Error("COUPON_NOT_FOUND");
  }
  if (coupon.usedAt) {
    throw new Error("COUPON_ALREADY_USED");
  }
  const updated = await updateUserCoupon(userCouponId, {
    usedAt: formatDateTime(),
    usedOrderId: orderId,
  });
  if (!updated) {
    throw new Error("COUPON_NOT_FOUND");
  }
  return updated;
}
