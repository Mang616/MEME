import { getContentPageBySlug } from "../db/index.js";
import {
  REGISTER_ACTIVITY_DEFAULTS,
  normalizeRegisterActivityPayload,
  type RegisterActivityPayload,
} from "@meme/register-activity-defaults";
import type { AppUser } from "../types.js";
import { grantCouponsByTemplateIds, ensureCouponTemplates } from "./coupons.js";

export type { RegisterActivityPayload };

export async function loadRegisterActivityPayload(): Promise<RegisterActivityPayload> {
  const page = await getContentPageBySlug("register-activity");
  if (page?.payload) {
    return normalizeRegisterActivityPayload(page.payload as Partial<RegisterActivityPayload>);
  }
  return REGISTER_ACTIVITY_DEFAULTS;
}

/** 新用户注册成功后发放注册活动配置的优惠券 */
export async function grantRegisterRewardsForUser(userId: string) {
  const activity = await loadRegisterActivityPayload();
  if (!activity.enabled || !activity.templateIds.length) return [];
  await ensureCouponTemplates(activity.templateIds);
  return grantCouponsByTemplateIds(userId, activity.templateIds);
}
