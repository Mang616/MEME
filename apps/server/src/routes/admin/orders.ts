import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { requireAnyPermission, requirePermission } from "../../middleware/auth.js";
import type { AuthedRequest } from "../../middleware/auth.js";
import { orderService } from "../../services.js";
import type { OrderStatus } from "../../types.js";

const patchSchema = z.object({
  status: z
    .enum(["pending_accept", "pending_confirm", "completed", "after_sale"])
    .optional(),
  servicePlayer: z.string().optional(),
});

const assignSchema = z.object({
  handlerId: z.string().min(1).optional(),
  servicePlayer: z.string().optional(),
});

export const adminOrdersRouter = Router();

adminOrdersRouter.get("/hall", requirePermission("orders.accept"), async (_req, res) => {
  const orders = await orderService.listHallOrders();
  res.json({
    items: orderService.listHallRows(orders),
    total: orders.length,
  });
});

/** 待处理新订单监听：轮询比对用 */
adminOrdersRouter.get(
  "/watch",
  requireAnyPermission("orders.read", "orders.accept", "orders.dispatch"),
  async (req, res) => {
    const admin = (req as AuthedRequest).admin;
    const orders = await orderService.listDispatchOrders();
    const canDispatch =
      admin?.permissions.includes("orders.dispatch") ||
      admin?.permissions.includes("orders.write");

    if (canDispatch) {
      res.json({
        items: orderService.listAdminRows(orders),
        total: orders.length,
      });
      return;
    }

    const hallOrders = orders.filter((order) => orderService.isHallEligible(order));
    res.json({
      items: orderService.listHallRows(hallOrders),
      total: hallOrders.length,
    });
  },
);

adminOrdersRouter.get(
  "/dispatch",
  requireAnyPermission("orders.dispatch", "orders.write"),
  async (_req, res) => {
    const orders = await orderService.listDispatchOrders();
    res.json({
      items: orderService.listAdminRows(orders),
      total: orders.length,
    });
  },
);

adminOrdersRouter.get("/", requireRead(...adminApiPolicy.orders.read), async (_req, res) => {
  const orders = await orderService.list();
  res.json({
    items: orderService.listAdminRows(orders),
    total: orders.length,
  });
});

adminOrdersRouter.post("/:id/accept", requirePermission("orders.accept"), async (req, res) => {
  const admin = (req as AuthedRequest).admin;
  if (!admin) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "未登录" });
    return;
  }

  try {
    const updated = await orderService.acceptOrder(paramString(req.params.id), admin.displayName);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
      return;
    }
    res.json(orderService.listHallRows([updated])[0]);
  } catch (err) {
    const code = err instanceof Error ? err.message : "ACCEPT_FAILED";
    res.status(409).json({ error: code, message: "无法接单，订单可能已被抢走或需客服派单" });
  }
});

adminOrdersRouter.post(
  "/:id/assign",
  requireAnyPermission("orders.dispatch", "orders.write"),
  async (req, res) => {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
      return;
    }

    const playerName = parsed.data.servicePlayer?.trim() ?? "";
    const handlerId = parsed.data.handlerId;

    if (!handlerId && !playerName) {
      res.status(400).json({ error: "INVALID_BODY", message: "请选择打手" });
      return;
    }

    try {
      const updated = await orderService.assignOrder(paramString(req.params.id), {
        playerName: handlerId ? undefined : playerName,
        handlerId,
      });
      if (!updated) {
        res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
        return;
      }
      res.json(orderService.listAdminRows([updated])[0]);
    } catch (err) {
      if (err instanceof Error && err.message === "HANDLER_NOT_FOUND") {
        res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
        return;
      }
      res.status(409).json({ error: "ASSIGN_FAILED", message: "派单失败，订单可能已被接单或俱乐部已停用" });
    }
  },
);

adminOrdersRouter.get("/:id", requireRead(...adminApiPolicy.orders.read), async (req, res) => {
  const order = await orderService.getById(paramString(req.params.id));
  if (!order) {
    res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
    return;
  }
  res.json(order);
});

adminOrdersRouter.patch("/:id", requireWrite(...adminApiPolicy.orders.write), async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
    return;
  }

  const updated = await orderService.update(paramString(req.params.id), parsed.data as {
    status?: OrderStatus;
    servicePlayer?: string;
  });

  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
    return;
  }

  res.json(orderService.listAdminRows([updated])[0]);
});
