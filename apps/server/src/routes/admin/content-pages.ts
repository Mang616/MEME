import { Router } from "express";
import { z } from "zod";
import { normalizeInviteActivityPayload } from "@meme/invite-activity-defaults";
import { normalizeRegisterActivityPayload } from "@meme/register-activity-defaults";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { ensureCouponTemplates } from "../../services/coupons.js";
import { contentPageService } from "../../services/cms.js";
import type { ContentPage } from "../../types.js";

export const adminContentPagesRouter = Router();

const updateBodySchema = z.object({
  title: z.string().min(1).optional(),
  payload: z.unknown().optional(),
});

const vipLevelItemSchema = z.object({
  level: z.number().int().min(0),
  label: z.string().min(1),
  title: z.string().min(1),
  icon: z.string(),
  bg: z.string(),
  color: z.string(),
});

const vipConfigPayloadSchema = z.object({
  vipMin: z.number().int().min(0),
  vipMax: z.number().int().min(0),
  levelList: z.array(vipLevelItemSchema).min(1),
});

const vipPrivilegeRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.string(),
  unlocked: z.boolean(),
});

const vipLevelActivityItemSchema = z.object({
  level: z.number().int().min(0),
  cumulativeThreshold: z.number().min(0),
  upgradeTarget: z.number().min(0),
  privilegeRows: z.array(vipPrivilegeRowSchema).min(1),
});

const vipActivityPayloadSchema = z.object({
  consumeLabel: z.string().min(1),
  promotionRewardText: z.string().min(1),
  maxLevelHint: z.string().min(1),
  upgradeHintTemplate: z.string().min(1),
  sectionTitle: z.string().min(1),
  sectionSubtitleTemplate: z.string().min(1),
  levelList: z.array(vipLevelActivityItemSchema).min(1),
});

const couponItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(["fixed", "percent"]),
  value: z.number().min(0),
  minSpend: z.number().min(0),
  maxDiscount: z.number().min(0),
  validDays: z.number().int().min(1),
  scope: z.enum(["all", "escort", "companion"]),
  enabled: z.boolean(),
  sortOrder: z.number(),
});

const couponsPayloadSchema = z.object({
  items: z.array(couponItemSchema),
});

const registerActivityPayloadSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  templateIds: z.array(z.string().min(1)),
});

const inviteActivityRewardsSchema = z.object({
  inviterTemplateIds: z.array(z.string().min(1)),
  inviteeTemplateIds: z.array(z.string().min(1)),
});

const inviteActivityPayloadSchema = z.object({
  enabled: z.boolean().optional(),
  tag: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cta: z.string().min(1),
  navTag: z.string().min(1),
  navTitle: z.string().min(1),
  rules: z.array(z.string().min(1)).min(1),
  poster: z.object({
    headline: z.string().min(1),
    footnote: z.string().min(1),
  }),
  rewards: inviteActivityRewardsSchema.optional(),
});

function validatePayload(slug: string, payload: unknown) {
  if (slug === "vip-config") {
    const parsed = vipConfigPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false as const, message: "VIP 配置格式错误" };
    }
    if (parsed.data.vipMax < parsed.data.vipMin) {
      return { ok: false as const, message: "vipMax 不能小于 vipMin" };
    }
    return { ok: true as const, payload: parsed.data };
  }
  if (slug === "vip-activity") {
    const parsed = vipActivityPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false as const, message: "VIP 活动配置格式错误" };
    }
    return { ok: true as const, payload: parsed.data };
  }
  if (slug === "coupons") {
    const parsed = couponsPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false as const, message: "优惠券配置格式错误" };
    }
    return { ok: true as const, payload: parsed.data };
  }
  if (slug === "register-activity") {
    const parsed = registerActivityPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false as const, message: "注册活动配置格式错误" };
    }
    return { ok: true as const, payload: normalizeRegisterActivityPayload(parsed.data) };
  }
  if (slug === "invite-activity") {
    const parsed = inviteActivityPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false as const, message: "邀请活动配置格式错误" };
    }
    return { ok: true as const, payload: normalizeInviteActivityPayload(parsed.data) };
  }
  return { ok: true as const, payload };
}

async function validateAndPreparePayload(slug: string, payload: unknown) {
  const validated = validatePayload(slug, payload);
  if (!validated.ok) return validated;
  if (slug === "register-activity" || slug === "invite-activity") {
    const nextPayload = await ensureActivityCouponTemplates(slug, validated.payload);
    return { ok: true as const, payload: nextPayload };
  }
  return validated;
}

async function ensureActivityCouponTemplates(slug: string, payload: unknown) {
  if (slug === "register-activity") {
    const normalized = normalizeRegisterActivityPayload(payload as Parameters<typeof normalizeRegisterActivityPayload>[0]);
    await ensureCouponTemplates(normalized.templateIds);
    return normalized;
  }
  if (slug === "invite-activity") {
    const normalized = normalizeInviteActivityPayload(payload as Parameters<typeof normalizeInviteActivityPayload>[0]);
    await ensureCouponTemplates([
      ...normalized.rewards.inviterTemplateIds,
      ...normalized.rewards.inviteeTemplateIds,
    ]);
    return normalized;
  }
  return payload;
}

async function prepareContentPageResponse(slug: string, page: ContentPage) {
  if (slug === "register-activity" || slug === "invite-activity") {
    const payload = await ensureActivityCouponTemplates(slug, page.payload);
    return { ...page, payload };
  }
  return page;
}

adminContentPagesRouter.get(
  "/",
  requireRead(...adminApiPolicy.content.read),
  async (_req, res) => {
    const items = await contentPageService.list();
    res.json({ items, total: items.length });
  },
);

adminContentPagesRouter.get(
  "/:slug",
  requireRead(...adminApiPolicy.content.read),
  async (req, res) => {
    const slug = String(req.params.slug);
    const page = await contentPageService.getBySlug(slug);
    if (!page) {
      res.status(404).json({ error: "NOT_FOUND", message: "内容不存在" });
      return;
    }
    res.json(await prepareContentPageResponse(slug, page));
  },
);

adminContentPagesRouter.put(
  "/:slug",
  requireWrite(...adminApiPolicy.content.write),
  async (req, res) => {
    const slug = String(req.params.slug);
    const parsed = updateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
      return;
    }

    if (parsed.data.payload !== undefined) {
      const validated = await validateAndPreparePayload(slug, parsed.data.payload);
      if (!validated.ok) {
        res.status(400).json({ error: "INVALID_BODY", message: validated.message });
        return;
      }
      parsed.data.payload = validated.payload;
    }

    const page = await contentPageService.updateBySlug(slug, parsed.data);
    if (!page) {
      res.status(404).json({ error: "NOT_FOUND", message: "内容不存在" });
      return;
    }
    res.json(await prepareContentPageResponse(slug, page));
  },
);
