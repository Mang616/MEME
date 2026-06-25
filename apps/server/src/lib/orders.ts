import { formatDateTime } from "./format-time.js";
import { AUTO_ASSIGN_LABEL, ORDER_STATUS_TEXT } from "../constants.js";
import type { Order, OrderProductSnapshot } from "../types.js";

export { formatDateTime as formatOrderTime };

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
  assignedPlayer: string;
  remark?: string;
  product: Pick<OrderProductSnapshot, "title" | "desc" | "price" | "cover" | "coverColor">;
};

export function buildOrder(input: CreateOrderInput): Order {
  const qty = Math.max(1, Number(input.quantity) || 1);
  const unitPrice = Number(input.product.price) || 0;
  const totalPaid = Math.round(unitPrice * qty * 100) / 100;

  return {
    id: buildOrderId(),
    productId: input.productId,
    status: "pending_accept",
    statusText: ORDER_STATUS_TEXT.pending_accept,
    orderTime: formatDateTime(),
    region: input.region,
    userId: input.userId,
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
    totalPaid,
    paid: true,
    refunded: false,
    autoSettleTime: "",
    actions: ["contact", "detail"],
  };
}
