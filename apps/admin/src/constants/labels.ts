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

export const SERVICE_TYPE_MAP = SERVICE_TYPE_LABELS;
export const HANDLER_SERVICE_MAP = SERVICE_TYPE_LABELS;

export const ESCORT_LEVEL_MAP = {
  demon: "魔王",
  ace: "王牌",
  rookie: "新锐",
} as const;

export const REGION_MAP = {
  pc: "端游",
  mobile: "手游",
} as const;
