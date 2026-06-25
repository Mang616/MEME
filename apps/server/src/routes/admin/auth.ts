import { Router } from "express";
import { z } from "zod";
import { loginAdmin, verifyToken } from "../../middleware/auth.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "账号或密码格式错误" });
    return;
  }

  const token = loginAdmin(parsed.data.username.trim(), parsed.data.password);
  if (!token) {
    res.status(401).json({ error: "INVALID_CREDENTIALS", message: "账号或密码错误" });
    return;
  }

  res.json({
    token,
    username: parsed.data.username.trim(),
  });
});

adminAuthRouter.get("/me", (req, res) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const username = token ? verifyToken(token) : null;
  if (!username) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  res.json({ ok: true, username });
});
