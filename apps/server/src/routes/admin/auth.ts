import { Router } from "express";
import { z } from "zod";
import { adminUserService } from "../../services/admin-users.js";
import { getBearerToken, requireAdmin, resolveAdminSession } from "../../middleware/auth.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "账号或密码格式错误" });
    return;
  }

  const result = await adminUserService.login(parsed.data.username.trim(), parsed.data.password);
  if (!result) {
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "账号或密码错误" });
    return;
  }

  res.json({
    token: result.token,
    username: result.session.username,
    displayName: result.session.displayName,
    adminId: result.session.adminId,
    roles: result.session.roles,
    permissions: result.session.permissions,
  });
});

const profileSchema = z.object({
  displayName: z.string().min(1).max(128).optional(),
  currentPassword: z.string().min(1).max(64).optional(),
  password: z.string().min(6).max(64).optional(),
});

adminAuthRouter.get("/me", requireAdmin, (req, res) => {
  const admin = (req as typeof req & { admin: NonNullable<ReturnType<typeof resolveAdminSession>> }).admin;
  res.json({
    ok: true,
    username: admin.username,
    displayName: admin.displayName,
    adminId: admin.adminId,
    roles: admin.roles,
    permissions: admin.permissions,
  });
});

adminAuthRouter.patch("/me", requireAdmin, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "资料参数错误" });
    return;
  }

  const { displayName, currentPassword, password } = parsed.data;
  if (!displayName && !password) {
    res.status(400).json({ error: "INVALID_BODY", message: "请填写要修改的内容" });
    return;
  }

  const admin = (req as typeof req & { admin: NonNullable<ReturnType<typeof resolveAdminSession>> }).admin;
  const result = await adminUserService.updateSelfProfile(admin, {
    displayName,
    currentPassword,
    password,
  });

  if ("error" in result) {
    res.status(result.status).json({ error: "PROFILE_UPDATE_FAILED", message: result.error });
    return;
  }

  res.json({
    ok: true,
    token: result.token,
    username: result.session.username,
    displayName: result.session.displayName,
    adminId: result.session.adminId,
    roles: result.session.roles,
    permissions: result.session.permissions,
  });
});

adminAuthRouter.get("/session", (req, res) => {
  const token = getBearerToken(req);
  const session = token ? resolveAdminSession(token) : null;
  if (!session) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  res.json({
    ok: true,
    username: session.username,
    displayName: session.displayName,
    adminId: session.adminId,
    roles: session.roles,
    permissions: session.permissions,
  });
});
