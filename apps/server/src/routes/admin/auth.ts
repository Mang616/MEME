import { Router } from "express";
import { z } from "zod";
import { getAdminUser } from "../../db/index.js";
import { isServiceProviderRole } from "@meme/admin-rbac";
import { adminUserService, adminSessionPayload } from "../../services/admin-users.js";
import { adminPresenceService } from "../../services/admin-presence.js";
import type { AuthedRequest } from "../../middleware/auth.js";
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
    ...adminSessionPayload(result.session),
  });
});

const profileSchema = z.object({
  displayName: z.string().min(1).max(128).optional(),
  currentPassword: z.string().min(1).max(64).optional(),
  password: z.string().min(6).max(64).optional(),
});

adminAuthRouter.get("/me", requireAdmin, (req, res) => {
  const admin = (req as AuthedRequest).admin!;
  res.json({
    ok: true,
    ...adminSessionPayload(admin),
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

  const admin = (req as AuthedRequest).admin!;
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
    ...adminSessionPayload(result.session),
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
    ...adminSessionPayload(session),
  });
});

adminAuthRouter.post("/presence", requireAdmin, async (req, res) => {
  const admin = (req as AuthedRequest).admin!;
  const user = await getAdminUser(admin.adminId);
  if (!user?.handlerId || !user.roles.some(isServiceProviderRole)) {
    res.json({ ok: true, linked: false });
    return;
  }

  await adminPresenceService.touch(admin.adminId, user.handlerId);
  res.json({ ok: true, linked: true, online: true });
});

adminAuthRouter.post("/logout", requireAdmin, async (req, res) => {
  const admin = (req as AuthedRequest).admin!;
  await adminPresenceService.clear(admin.adminId);
  res.json({ ok: true });
});
