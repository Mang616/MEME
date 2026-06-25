import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ADMIN_ACCOUNT, AUTH_SECRET } from "../config.js";

const TOKEN_PREFIX = "meme.";

export function signToken(username: string) {
  const payload = Buffer.from(JSON.stringify({ username, ts: Date.now() })).toString(
    "base64url",
  );
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${TOKEN_PREFIX}${payload}.${sig}`;
}

export function verifyToken(token: string) {
  if (!token.startsWith(TOKEN_PREFIX)) return null;

  const body = token.slice(TOKEN_PREFIX.length);
  const dot = body.lastIndexOf(".");
  if (dot < 0) return null;

  const payload = body.slice(0, dot);
  const sig = body.slice(dot + 1);
  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  if (sig !== expected) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username: string;
    };
    return data.username;
  } catch {
    return null;
  }
}

export function loginAdmin(username: string, password: string) {
  if (username !== ADMIN_ACCOUNT.username || password !== ADMIN_ACCOUNT.password) {
    return null;
  }
  return signToken(username);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const username = verifyToken(token);

  if (!username) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
    return;
  }

  res.locals.adminUser = username;
  next();
}
