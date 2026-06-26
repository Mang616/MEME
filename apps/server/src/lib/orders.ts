import { formatDateTime } from "./format-time.js";
import { AUTO_ASSIGN_LABEL, ORDER_STATUS_TEXT } from "../constants.js";
import type { Order, OrderProductSnapshot } from "../types.js";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function buildOrderId(date = new Date()) {
  const tail = String(Math.floor(Math.random() * 900000) + 100000);
  return `D_${String(date.getFullYear()).slice(2)}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}_${tail}`;
}

export type CreateOrderInput = {
  productId: string;
  quantity: number;
  region: string;
  userId: string;
  ownerUserId?: string;
  assignedPlayer: string;
  remark?: string;
  userCouponId?: string;
  serviceType?: import("../types.js").ServiceType;
  product: Pick<OrderProductSnapshot, "title" | "desc" | "price" | "cover" | "coverColor">;
};

export type OrderPricing = {
  subtotal: number;
  couponDiscount: number;
  totalPaid: number;
  userCouponId?: string;
  couponName?: string;
};

export function buildOrder(input: CreateOrderInput, pricing?: OrderPricing): Order {
  const qty = Math.max(1, Number(input.quantity) || 1);
  const unitPrice = Number(input.product.price) || 0;
  const subtotal = pricing?.subtotal ?? Math.round(unitPrice * qty * 100) / 100;
  const couponDiscount = pricing?.couponDiscount ?? 0;
  const totalPaid = pricing?.totalPaid ?? subtotal;

  return {
    id: buildOrderId(),
    productId: input.productId,
    serviceType: input.serviceType ?? "escort",
    status: "pending_accept",
    statusText: ORDER_STATUS_TEXT.pending_accept,
    orderTime: formatDateTime(),
    region: input.region,
    userId: input.userId,
    ownerUserId: input.ownerUserId,
    assignedPlayer: input.assignedPlayer || AUTO_ASSIGN_LABEL,
    servicePlayer: "—",
    remark: input.remark ?? "",
    product: {
      title: input.product.title,
      desc: input.product.desc ?? "",
      price: unitPrice,
      quantity: qty,
      cover: input.product.cover ?? "",
      coverColor: input.product.coverColor ?? "",
    },
    subtotal,
    couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
    userCouponId: pricing?.userCouponId,
    couponName: pricing?.couponName,
    totalPaid,
    paid: true,
    refunded: false,
    autoSettleTime: "",
    actions: ["contact", "detail"],
  };
}
