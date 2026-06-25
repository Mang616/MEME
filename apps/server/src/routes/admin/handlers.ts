import { Router } from "express";
import { z } from "zod";
import { handlerService } from "../../services.js";

const handlerBodySchema = z.object({
  name: z.string().min(1),
  level: z.enum(["demon", "ace", "rookie"]),
  region: z.enum(["pc", "mobile"]),
  serviceType: z.enum(["escort", "companion"]),
  gender: z.enum(["male", "female"]),
  avatar: z.string().default("/assets/profile/boys.webp"),
  online: z.boolean().default(false),
});

export const adminHandlersRouter = Router();

adminHandlersRouter.get("/", async (_req, res) => {
  const handlers = await handlerService.list();
  res.json({
    items: handlerService.listAdminRows(handlers),
    total: handlers.length,
  });
});

adminHandlersRouter.get("/:id", async (req, res) => {
  const handler = await handlerService.getById(req.params.id);
  if (!handler) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }
  res.json(handler);
});

adminHandlersRouter.post("/", async (req, res) => {
  const parsed = handlerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "打手参数错误" });
    return;
  }

  try {
    const handler = await handlerService.create(parsed.data);
    res.status(201).json(handlerService.listAdminRows([handler])[0]);
  } catch (err) {
    if (err instanceof Error && err.message === "HANDLER_EXISTS") {
      res.status(409).json({ error: "CONFLICT", message: "打手 ID 已存在" });
      return;
    }
    throw err;
  }
});

adminHandlersRouter.put("/:id", async (req, res) => {
  const parsed = handlerBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "打手参数错误" });
    return;
  }

  const updated = await handlerService.update(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }

  res.json(handlerService.listAdminRows([updated])[0]);
});

adminHandlersRouter.patch("/:id/online", async (req, res) => {
  const parsed = z.object({ online: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
    return;
  }

  const updated = await handlerService.update(req.params.id, { online: parsed.data.online });
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }

  res.json(handlerService.listAdminRows([updated])[0]);
});

adminHandlersRouter.delete("/:id", async (req, res) => {
  const ok = await handlerService.remove(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }
  res.status(204).end();
});
