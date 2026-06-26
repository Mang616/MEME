export type CouponType = "fixed" | "percent";
export type CouponScope = "all" | "escort" | "companion";

export type CouponItem = {
  id: string;
  name: string;
  description: string;
  type: CouponType;
  /** 满减金额（元）或折扣（如 9.5 表示 9.5 折） */
  value: number;
  /** 最低消费门槛（元） */
  minSpend: number;
  /** 折扣券最高减免（元），0 表示不限制 */
  maxDiscount: number;
  /** 领取后有效天数 */
  validDays: number;
  scope: CouponScope;
  enabled: boolean;
  sortOrder: number;
};

export type CouponsPayload = {
  items: CouponItem[];
};

export const COUPON_DEFAULTS: CouponsPayload = {
  items: [
    {
      id: "cp_welcome",
      name: "新人满减券",
      description: "注册后可领取，首单可用",
      type: "fixed",
      value: 10,
      minSpend: 50,
      maxDiscount: 0,
      validDays: 30,
      scope: "all",
      enabled: true,
      sortOrder: 1,
    },
    {
      id: "cp_invite_inviter",
      name: "邀请人奖励券",
      description: "好友完成首单后，邀请人获得",
      type: "fixed",
      value: 15,
      minSpend: 0,
      maxDiscount: 0,
      validDays: 30,
      scope: "all",
      enabled: true,
      sortOrder: 4,
    },
    {
      id: "cp_invite_invitee",
      name: "被邀请人奖励券",
      description: "通过邀请注册并完成首单后获得",
      type: "fixed",
      value: 10,
      minSpend: 0,
      maxDiscount: 0,
      validDays: 30,
      scope: "all",
      enabled: true,
      sortOrder: 5,
    },
    {
      id: "cp_vip_escort",
      name: "VIP 护航券",
      description: "VIP 会员护航订单可用",
      type: "fixed",
      value: 20,
      minSpend: 100,
      maxDiscount: 0,
      validDays: 7,
      scope: "escort",
      enabled: true,
      sortOrder: 2,
    },
    {
      id: "cp_discount_95",
      name: "全场 95 折券",
      description: "限时折扣，最高减 50 元",
      type: "percent",
      value: 9.5,
      minSpend: 80,
      maxDiscount: 50,
      validDays: 14,
      scope: "all",
      enabled: true,
      sortOrder: 3,
    },
  ],
};

function normalizeItem(raw: Partial<CouponItem> & { id?: string }, index: number): CouponItem {
  const id = raw.id?.trim() || `cp_${Date.now()}_${index}`;
  const type: CouponType = raw.type === "percent" ? "percent" : "fixed";
  const scope: CouponScope =
    raw.scope === "escort" || raw.scope === "companion" ? raw.scope : "all";

  return {
    id,
    name: raw.name?.trim() || "未命名优惠券",
    description: raw.description?.trim() ?? "",
    type,
    value: Math.max(0, Number(raw.value) || 0),
    minSpend: Math.max(0, Number(raw.minSpend) || 0),
    maxDiscount: Math.max(0, Number(raw.maxDiscount) || 0),
    validDays: Math.max(1, Math.round(Number(raw.validDays) || 7)),
    scope,
    enabled: raw.enabled !== false,
    sortOrder: Number.isFinite(raw.sortOrder) ? Number(raw.sortOrder) : index,
  };
}

export function normalizeCouponsPayload(payload: CouponsPayload | undefined): CouponsPayload {
  const raw = payload?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return {
      items: COUPON_DEFAULTS.items.map((item) => ({ ...item })),
    };
  }
  return {
    items: raw
      .map((item, index) => normalizeItem(item, index))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
  };
}

export function createEmptyCoupon(sortOrder: number): CouponItem {
  return normalizeItem(
    {
      id: `cp_${Date.now()}`,
      name: "",
      description: "",
      type: "fixed",
      value: 10,
      minSpend: 0,
      maxDiscount: 0,
      validDays: 7,
      scope: "all",
      enabled: true,
      sortOrder,
    },
    sortOrder,
  );
}

export function formatCouponValue(item: CouponItem): string {
  if (item.type === "percent") {
    return `${item.value} 折`;
  }
  return `¥${item.value}`;
}
