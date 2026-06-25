import { Router } from "express";
import { z } from "zod";
import { ADMIN_ROLES } from "../../constants/admin-rbac.js";
import type { AuthedRequest } from "../../middleware/auth.js";
import { requireAdmin, requirePermission } from "../../middleware/auth.js";
import { adminUserService } from "../../services/admin-users.js";

const adminRoleEnum = z.enum(ADMIN_ROLES as unknown as [typeof ADMIN_ROLES[number], ...typeof ADMIN_ROLES[number][]]);

const createSchema = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(6).max(64),
  displayName: z.string().min(1).max(128),
  roles: z.array(adminRoleEnum).min(1),
  enabled: z.boolean().default(true),
});

const patchSchema = z.object({
  displayName: z.string().min(1).max(128).optional(),
  password: z.string().min(6).max(64).optional(),
  roles: z.array(adminRoleEnum).min(1).optional(),
  enabled: z.boolean().optional(),
});

export const adminStaffRouter = Router();

adminStaffRouter.use(requireAdmin);

adminStaffRouter.get("/roles", requirePermission("admin_users.read"), (_req, res) => {
  res.json({ items: adminUserService.roleOptions() });
});

adminStaffRouter.get("/", requirePermission("admin_users.read"), async (_req, res) => {
  const items = await adminUserService.listRows();
  res.json({ items, total: items.length });
});

adminStaffRouter.post("/", requirePermission("admin_users.write"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "账号参数错误" });
    return;
  }

  try {
    const created = await adminUserService.create(parsed.data);
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof Error && err.message === "ADMIN_USER_EXISTS") {
      res.status(409).json({ error: "CONFLICT", message: "账号已存在" });
      return;
    }
    throw err;
  }
});

adminStaffRouter.put("/:id", requirePermission("admin_users.write"), async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "账号参数错误" });
    return;
  }

  const updated = await adminUserService.update(String(req.params.id), parsed.data);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "账号不存在" });
    return;
  }
  res.json(updated);
});

adminStaffRouter.delete("/:id", requirePermission("admin_users.write"), async (req, res) => {
  const admin = (req as AuthedRequest).admin!;
  if (admin.adminId === String(req.params.id)) {
    res.status(400).json({ error: "INVALID_BODY", message: "不能删除当前登录账号" });
    return;
  }

  const ok = await adminUserService.remove(String(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "NOT_FOUND", message: "账号不存在" });
    return;
  }
  res.status(204).end();
});
