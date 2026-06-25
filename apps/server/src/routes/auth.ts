import { Router } from "express";
import { z } from "zod";
import { getBearerToken, requireUser } from "../middleware/auth.js";
import { userAuthService } from "../services/app.js";
import { listAvailableUserCoupons, listUserCouponsForWallet } from "../services/coupons.js";
import { getUserInvitePayload } from "../services/invite.js";
import { getProduct, getUser, listUserLedgerByUser } from "../db/index.js";
import { calcOrderSubtotal } from "../lib/coupons.js";

export const authRouter = Router();

const phoneSchema = z.object({
  phone: z.string().min(11),
  scene: z.string().optional(),
});

authRouter.post("/sms/send", async (req, res) => {
  const parsed = phoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "手机号格式错误" });
    return;
  }
  try {
    const result = await userAuthService.sendSmsCode(parsed.data.phone, parsed.data.scene ?? "login");
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "BAD_REQUEST", message: err instanceof Error ? err.message : "发送失败" });
  }
});

const smsLoginSchema = z.object({
  phone: z.string().min(11),
  code: z.string().min(6).max(6),
  inviterCode: z.string().optional(),
});

authRouter.post("/sms/login", async (req, res) => {
  const parsed = smsLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "登录参数错误" });
    return;
  }
  try {
    const result = await userAuthService.loginWithSms(
      parsed.data.phone,
      parsed.data.code,
      parsed.data.inviterCode,
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "BAD_REQUEST", message: err instanceof Error ? err.message : "登录失败" });
  }
});

const wechatSchema = z.object({
  code: z.string().min(1),
  inviterCode: z.string().optional(),
});

authRouter.post("/wechat", async (req, res) => {
  const parsed = wechatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "微信登录参数错误" });
    return;
  }
  try {
    const result = await userAuthService.loginWithWechat(parsed.data.code, parsed.data.inviterCode);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "BAD_REQUEST", message: err instanceof Error ? err.message : "登录失败" });
  }
});

export const userRouter = Router();

userRouter.get("/me", async (req, res) => {
  const token = getBearerToken(req);
  const { verifyUserToken } = await import("../middleware/auth.js");
  const userId = verifyUserToken(token);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
    return;
  }
  const user = await userAuthService.getMe(userId);
  if (!user) {
    res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
    return;
  }
  res.json({ user });
});

userRouter.get("/ledger", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  const items = await listUserLedgerByUser(userId);
  res.json({ items, total: items.length });
});

userRouter.get("/coupons", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  const productId = typeof req.query.productId === "string" ? req.query.productId : "";
  const quantityRaw = typeof req.query.quantity === "string" ? Number(req.query.quantity) : 1;
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;

  if (!productId) {
    const items = await listUserCouponsForWallet(userId);
    res.json({ items, total: items.length });
    return;
  }

  let serviceType: import("../types.js").ServiceType = "escort";
  let subtotal = 0;
  const product = await getProduct(productId);
  if (product) {
    serviceType = product.serviceType;
    subtotal = calcOrderSubtotal(product.price, quantity);
  }

  const items = await listAvailableUserCoupons(userId, { serviceType, subtotal });
  res.json({ items, total: items.length });
});

userRouter.get("/invite", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  try {
    const user = await getUser(userId);
    if (!user) {
      res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
      return;
    }
    const payload = await getUserInvitePayload(user);
    res.json(payload);
  } catch (err) {
    res.status(400).json({
      error: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "加载邀请信息失败",
    });
  }
});

const bindPhoneSchema = z.object({
  phone: z.string().min(11),
  code: z.string().min(6).max(6),
});

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatarGender: z.enum(["male", "female", "bag"]).optional(),
});

userRouter.patch("/me", requireUser, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "资料参数无效" });
    return;
  }
  if (!parsed.data.nickname && !parsed.data.avatarGender) {
    res.status(400).json({ error: "INVALID_BODY", message: "没有可更新的字段" });
    return;
  }

  const userId = (req as typeof req & { userId: string }).userId;
  try {
    const user = await userAuthService.updateProfile(userId, parsed.data);
    res.json({ user });
  } catch (err) {
    res.status(400).json({
      error: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "更新失败",
    });
  }
});

const rechargeSchema = z.object({
  amount: z.number().positive().max(100_000),
});

userRouter.post("/recharge", requireUser, async (req, res) => {
  const parsed = rechargeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "充值金额无效" });
    return;
  }
  const userId = (req as typeof req & { userId: string }).userId;
  try {
    const result = await userAuthService.recharge(userId, parsed.data.amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "充值失败",
    });
  }
});

userRouter.post("/bind-phone", requireUser, async (req, res) => {
  const parsed = bindPhoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "绑定参数错误" });
    return;
  }
  const userId = (req as typeof req & { userId: string }).userId;
  try {
    const result = await userAuthService.bindPhone(userId, parsed.data.phone, parsed.data.code);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "BAD_REQUEST", message: err instanceof Error ? err.message : "绑定失败" });
  }
});
