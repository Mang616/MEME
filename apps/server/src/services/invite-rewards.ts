import { getUser, listOrders, updateUser } from "../db/index.js";
import { formatDateTime } from "../lib/format-time.js";
import type { InviteActivityRewards } from "@meme/invite-activity-defaults";
import type { AppUser, Order } from "../types.js";
import { grantCouponsByTemplateIds, ensureCouponTemplates } from "./coupons.js";
import { loadInviteActivityPayload } from "./invite.js";

async function grantInvitePair(user: AppUser, rewards: InviteActivityRewards) {
  const refreshed = await getUser(user.id);
  if (!refreshed?.inviterId || refreshed.inviteRewardAt) return false;

  await ensureCouponTemplates([
    ...rewards.inviteeTemplateIds,
    ...rewards.inviterTemplateIds,
  ]);

  if (rewards.inviteeTemplateIds.length) {
    await grantCouponsByTemplateIds(refreshed.id, rewards.inviteeTemplateIds);
  }
  if (rewards.inviterTemplateIds.length) {
    await grantCouponsByTemplateIds(refreshed.inviterId, rewards.inviterTemplateIds, {
      allowDuplicate: true,
    });
  }

  await updateUser(refreshed.id, { inviteRewardAt: formatDateTime() });
  return true;
}

/** 被邀请人首单支付成功后发放邀请奖励 */
export async function tryGrantInviteRewardsOnOrder(order: Order) {
  const activity = await loadInviteActivityPayload();
  if (!activity.enabled) return false;
  if (!order.ownerUserId) return false;

  const user = await getUser(order.ownerUserId);
  if (!user?.inviterId || user.inviteRewardAt) return false;

  const orders = await listOrders(order.ownerUserId);
  if (orders.length !== 1) return false;

  return grantInvitePair(user, activity.rewards);
}
