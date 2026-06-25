import { Router } from "express";
import { z } from "zod";
import { orderService } from "../../services.js";
import type { OrderStatus } from "../../types.js";

const patchSchema = z.object({
  status: z
    .enum(["pending_accept", "pending_confirm", "completed", "after_sale"])
    .optional(),
  servicePlayer: z.string().optional(),
});

export const adminOrdersRouter = Router();

adminOrdersRouter.get("/", async (_req, res) => {
  const orders = await orderService.list();
  res.json({
    items: orderService.listAdminRows(orders),
    total: orders.length,
  });
});

adminOrdersRouter.get("/:id", async (req, res) => {
  const order = await orderService.getById(req.params.id);
  if (!order) {
    res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
    return;
  }
  res.json(order);
});

adminOrdersRouter.patch("/:id", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
    return;
  }

  const updated = await orderService.update(req.params.id, parsed.data as {
    status?: OrderStatus;
    servicePlayer?: string;
  });

  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
    return;
  }

  res.json(orderService.listAdminRows([updated])[0]);
});
