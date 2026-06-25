import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import type { AuthedRequest } from "../../middleware/auth.js";
import { adminUserService } from "../../services/admin-users.js";
import { userService } from "../../services/cms.js";
import { adjustBalanceWithMemberRules } from "../../services/vip-member.js";

const userPatchSchema = z.object({
  nickname: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  status: z.enum(["active", "disabled"]).optional(),
  inviterId: z.string().optional(),
});

const balanceAdjustSchema = z
  .object({
    mode: z.enum(["increment", "decrement", "set"]),
    amount: z.number().min(0),
    adminPassword: z.string().min(1).max(64),
    remark: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode !== "set" && data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "增减金额须大于 0",
        path: ["amount"],
      });
    }
  });

export const adminUsersRouter = Router();

adminUsersRouter.get("/", requireRead(...adminApiPolicy.users.read), async (_req, res) => {
  const items = await userService.list();
  res.json({ items, total: items.length });
});

adminUsersRouter.get("/:id/detail", requireRead(...adminApiPolicy.users.read), async (req, res) => {
  const detail = await userService.getDetail(paramString(req.params.id));
  if (!detail) {
    res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
    return;
  }
  res.json(detail);
});

adminUsersRouter.get("/:id", requireRead(...adminApiPolicy.users.read), async (req, res) => {
  const user = await userService.getById(paramString(req.params.id));
  if (!user) {
    res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
    return;
  }
  res.json(user);
});

adminUsersRouter.put("/:id", requireWrite(...adminApiPolicy.users.write), async (req, res) => {
  const parsed = userPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "用户参数错误" });
    return;
  }

  try {
    const updated = await userService.update(paramString(req.params.id), parsed.data);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      error: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "更新失败",
    });
  }
});

adminUsersRouter.post(
  "/:id/balance",
  requireWrite(...adminApiPolicy.users.write),
  async (req, res) => {
    const parsed = balanceAdjustSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_BODY", message: "余额变更参数错误" });
      return;
    }

    const admin = (req as AuthedRequest).admin;
    if (!admin) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "请先登录" });
      return;
    }

    const ok = await adminUserService.verifyAdminPassword(admin, parsed.data.adminPassword);
    if (!ok) {
      res.status(403).json({ error: "INVALID_PASSWORD", message: "管理员密码不正确" });
      return;
    }

    const userId = paramString(req.params.id);
    const existing = await userService.getById(userId);
    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
      return;
    }

    const previousBalance = existing.balance;
    try {
      const updated = await adjustBalanceWithMemberRules(existing, {
        mode: parsed.data.mode,
        amount: parsed.data.amount,
        remark: parsed.data.remark,
      });
      if (!updated) {
        res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
        return;
      }

      if (parsed.data.remark?.trim()) {
        console.info(
          `[balance-adjust] admin=${admin.username} user=${userId} mode=${parsed.data.mode} amount=${parsed.data.amount} ${previousBalance}->${updated.balance} remark=${parsed.data.remark.trim()}`,
        );
      }

      res.json({
        ...updated,
        previousBalance,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
        res.status(400).json({ error: "INSUFFICIENT_BALANCE", message: "变更后余额不能为负数" });
        return;
      }
      res.status(400).json({ error: "INVALID_AMOUNT", message: "金额无效" });
    }
  },
);
