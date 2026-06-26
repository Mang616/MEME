import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { requireAnyPermission } from "../../middleware/auth.js";
import { handlerService } from "../../services.js";
import { serviceTypeSchema } from "../../lib/zod-schemas.js";

const handlerProfileFields = {
  realName: z.string().min(1).max(64),
  idNumber: z.string().min(15).max(18),
  phone: z.string().min(11).max(32),
  wechat: z.string().min(1).max(64),
  alipay: z.string().min(1).max(128),
};

const handlerBodySchema = z.object({
  name: z.string().min(1),
  level: z.enum(["demon", "ace", "rookie"]),
  region: z.enum(["pc", "mobile"]),
  serviceType: serviceTypeSchema,
  gender: z.enum(["male", "female"]),
  avatar: z.string().default("/assets/profile/boys.webp"),
  online: z.boolean().default(false),
  clubId: z.string().min(1).default("club_platform"),
  realName: z.string().max(64).optional(),
  idNumber: z.string().max(32).optional(),
  phone: z.string().max(32).optional(),
  wechat: z.string().max(64).optional(),
  alipay: z.string().max(128).optional(),
});

const createWithAccountSchema = handlerBodySchema.extend(handlerProfileFields).extend({
  username: z.string().min(2).max(64),
  password: z.string().min(6).max(64),
  displayName: z.string().max(128).optional(),
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
    const items = await handlerService.listDispatchableRows();
    res.json({
      items,
      total: items.length,
    });
  },
);

adminHandlersRouter.post(
  "/with-account",
  requireWrite(...adminApiPolicy.handlers.write),
  async (req, res) => {
    const parsed = createWithAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_BODY", message: "打手资料或账号参数错误" });
      return;
    }

    const { username, password, displayName, ...handlerInput } = parsed.data;

    try {
      const handler = await handlerService.createWithAccount({
        handler: handlerInput,
        account: { username, password, displayName },
      });
      const rows = await handlerService.listAdminRows([handler]);
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err instanceof Error && err.message === "HANDLER_EXISTS") {
        res.status(409).json({ error: "CONFLICT", message: "打手 ID 已存在" });
        return;
      }
      if (err instanceof Error && err.message === "ADMIN_USER_EXISTS") {
        res.status(409).json({ error: "CONFLICT", message: "后台登录账号已存在" });
        return;
      }
      if (err instanceof Error && err.message === "CLUB_NOT_FOUND") {
        res.status(404).json({ error: "NOT_FOUND", message: "俱乐部不存在" });
        return;
      }
      throw err;
    }
  },
);

adminHandlersRouter.get("/:id", requireRead(...adminApiPolicy.handlers.read), async (req, res) => {
  const handler = await handlerService.getById(paramString(req.params.id));
  if (!handler) {
    res.status(404).json({ error: "NOT_FOUND", message: "打手不存在" });
    return;
  }
  const [row] = await handlerService.listAdminRows([handler]);
  res.json(row);
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
