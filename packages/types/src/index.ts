export const ORDER_STATUS = [
  "pending_accept",
  "pending_confirm",
  "completed",
  "after_sale",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  pending_accept: "待接单",
  pending_confirm: "待确认",
  completed: "已完成",
  after_sale: "售后中",
};

export const SERVICE_TYPES = ["escort", "companion"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const ORDER_REGIONS = ["端游", "手游"] as const;
