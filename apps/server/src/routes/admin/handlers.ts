import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { requireAnyPermission } from "../../middleware/auth.js";
import { handlerService } from "../../services.js";

const handlerBodySchema = z.object({
  name: z.string().min(1),
  level: z.enum(["demon", "ace", "rookie"]),
  region: z.enum(["pc", "mobile"]),
  serviceType: z.enum(["escort", "companion"]),
  gender: z.enum(["male", "female"]),
  avatar: z.string().default("/assets/profile/boys.webp"),
  online: z.boolean().default(false),
  clubId: z.string().min(1).default("club_platform"),
});

export const adminHandlersRouter = Router();

adminHandlersRouter.get("/", requireRead(...adminApiPolicy.handlers.read), async (_req, res) => {
  const handlers = await handlerService.list();
  res.json({
    items: await handlerService.listAdminRows(handlers),
    total: handlers.length,
  });
});

adminHandlersRouter.get(
  "/dispatchable",
  requireAnyPermission("orders.dispatch", "orders.write", "handlers.read"),
  async (_req, res) => {
    const handlers = await handlerService.listDispatchable();
    res.json({
      items: await handlerService.listAdminRows(handlers),
      total: handlers.length,
    });
  },
);

adminHandlersRouter.get("/:id", requireRead(...adminApiPolicy.handlers.read), async (req, res) => {
  const handler = await handlerService.getById(paramString(req.params.id));
  if (!handler) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }
  res.json(handler);
});

adminHandlersRouter.post("/", requireWrite(...adminApiPolicy.handlers.write), async (req, res) => {
  const parsed = handlerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "打手参数错误" });
    return;
  }

  try {
    const handler = await handlerService.create(parsed.data);
    const rows = await handlerService.listAdminRows([handler]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof Error && err.message === "HANDLER_EXISTS") {
      res.status(409).json({ error: "CONFLICT", message: "打手 ID 已存在" });
      return;
    }
    throw err;
  }
});

adminHandlersRouter.put("/:id", requireWrite(...adminApiPolicy.handlers.write), async (req, res) => {
  const parsed = handlerBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "打手参数错误" });
    return;
  }

  const updated = await handlerService.update(paramString(req.params.id), parsed.data);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }

  const rows = await handlerService.listAdminRows([updated]);
  res.json(rows[0]);
});

adminHandlersRouter.patch("/:id/online", requireWrite(...adminApiPolicy.handlers.write), async (req, res) => {
  const parsed = z.object({ online: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
    return;
  }

  const updated = await handlerService.update(paramString(req.params.id), { online: parsed.data.online });
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }

  const rows = await handlerService.listAdminRows([updated]);
  res.json(rows[0]);
});

adminHandlersRouter.delete("/:id", requireWrite(...adminApiPolicy.handlers.write), async (req, res) => {
  const ok = await handlerService.remove(paramString(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }
  res.status(204).end();
});
