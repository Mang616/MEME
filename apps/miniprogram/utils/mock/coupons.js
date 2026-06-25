/** 优惠券模板默认配置（与后台 apps/admin/src/lib/coupons.ts 保持一致） */
const COUPON_DEFAULTS = {
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

module.exports = { COUPON_DEFAULTS };
