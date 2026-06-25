import type { OrderStatus } from "@/lib/api";

export const ORDER_STATUS_MAP: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending_accept: { label: "待接单", color: "orange" },
  pending_confirm: { label: "待确认", color: "blue" },
  completed: { label: "已完成", color: "green" },
  after_sale: { label: "售后中", color: "red" },
};

/** 商品 / 打手共用的服务类型文案 */
export const SERVICE_TYPE_LABELS = {
  escort: "护航",
  companion: "陪玩",
} as const;

export const ESCORT_LEVEL_MAP = {
  demon: "魔王",
  ace: "王牌",
  rookie: "新锐",
} as const;

export const REGION_MAP = {
  pc: "端游",
  mobile: "手游",
} as const;

export const USER_STATUS_MAP = {
  active: { label: "正常", color: "green" },
  disabled: { label: "已禁用", color: "red" },
} as const;

export const BANNER_LINK_TYPE_MAP = {
  products: "商品分类",
  tab: "小程序页面",
  none: "无跳转",
} as const;

export const ANNOUNCEMENT_PLACEMENT_MAP = {
  home_bar: "首页提示条",
  popup: "弹窗",
} as const;
