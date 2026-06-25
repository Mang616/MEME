import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { normalizeAdminRoles, permissionsForRoles, type AdminPermission, type AdminRole } from "../constants/admin-rbac.js";
import { hasPermission } from "../constants/admin-rbac.js";
import { AUTH_SECRET } from "../config.js";
import type { AdminSession } from "../services/admin-users.js";

const TOKEN_PREFIX = "meme.";
const USER_TOKEN_PREFIX = "meme.user.";

export type AdminTokenPayload = {
  adminId: string;
  username: string;
  displayName: string;
  roles: AdminRole[];
  ts: number;
};

export type AuthedRequest = Request & {
  admin?: AdminSession;
  userId?: string;
};

function signPayload(payload: object, prefix: string) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(encoded).digest("base64url");
  return `${prefix}${encoded}.${sig}`;
}

function verifyPayload<T>(token: string, prefix: string): T | null {
  if (!token.startsWith(prefix)) return null;
  const body = token.slice(prefix.length);
  const dot = body.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = body.slice(0, dot);
  const sig = body.slice(dot + 1);
  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function signAdminToken(session: Pick<AdminSession, "adminId" | "username" | "displayName" | "roles">) {
  return signPayload(
    {
      adminId: session.adminId,
      username: session.username,
      displayName: session.displayName,
      roles: session.roles,
      ts: Date.now(),
    },
    TOKEN_PREFIX,
  );
}

/** @deprecated 使用 signAdminToken */
export function signToken(username: string) {
  return signAdminToken({
    adminId: "legacy",
    username,
    displayName: username,
    roles: ["super_admin"],
  });
}

export function signUserToken(userId: string) {
  return signPayload({ userId, ts: Date.now() }, USER_TOKEN_PREFIX);
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  return verifyPayload<AdminTokenPayload>(token, TOKEN_PREFIX);
}

export function verifyToken(token: string) {
  return verifyAdminToken(token)?.username ?? null;
}

export function verifyUserToken(token: string) {
  const data = verifyPayload<{ userId: string }>(token, USER_TOKEN_PREFIX);
  return data?.userId ?? null;
}

export function resolveAdminSession(token: string): AdminSession | null {
  const payload = verifyAdminToken(token);
  if (!payload?.username) return null;
  const roles = normalizeAdminRoles(payload.roles ?? ["super_admin"]);
  return {
    adminId: payload.adminId,
    username: payload.username,
    displayName: payload.displayName || payload.username,
    roles,
    permissions: permissionsForRoles(roles),
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const session = token ? resolveAdminSession(token) : null;

  if (!session?.username) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
    return;
  }

  (req as AuthedRequest).admin = session;
  next();
}

export function requirePermission(...needed: AdminPermission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as AuthedRequest).admin;
    if (!admin) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
      return;
    }
    const ok = needed.every((perm) => hasPermission(admin.roles, perm));
    if (!ok) {
      res.status(403).json({ error: "FORBIDDEN", message: "当前角色无此操作权限" });
      return;
    }
    next();
  };
}

export function requireAnyPermission(...needed: AdminPermission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as AuthedRequest).admin;
    if (!admin) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
      return;
    }
    const ok = needed.some((perm) => hasPermission(admin.roles, perm));
    if (!ok) {
      res.status(403).json({ error: "FORBIDDEN", message: "当前角色无此操作权限" });
      return;
    }
    next();
  };
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = verifyUserToken(token);

  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
    return;
  }

  (req as AuthedRequest).userId = userId;
  next();
}

export function getOptionalUserId(req: Request) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token ? verifyUserToken(token) : null;
}

export function getBearerToken(req: Request) {
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}
