import {
  findUserByPhone,
  findUserByWechatOpenid,
  getContentPageBySlug,
  getUser,
  insertUser,
  listProductReviews,
  insertFeedback,
  updateUser,
} from "../db/index.js";
import { formatDateTime } from "../lib/format-time.js";
import { resolveMediaUrl } from "../lib/media-url.js";
import { signUserToken } from "../middleware/auth.js";
import {
  avatarPathForGender,
  normalizeAvatarGender,
  normalizePhone,
} from "@meme/user-profile";
import type { AppUser, AvatarGender, ProductReview } from "../types.js";
import { rechargeMember, syncUserVipFromConsume } from "./vip-member.js";
import { countActiveUserCoupons } from "./coupons.js";
import { grantRegisterRewardsForUser } from "./register-rewards.js";
import { bindInviterForUser, ensureUserInviteCode } from "./invite-user.js";
import { resolveInviteCode } from "../lib/invite-code.js";

const DEV_SMS_CODE = "123456";
const smsCodes = new Map<string, { code: string; sentAt: number; scene: string }>();

export async function toClientUser(user: AppUser) {
  const avatarGender = normalizeAvatarGender(user.avatarGender, user.avatar);
  const couponCount = await countActiveUserCoupons(user.id);
  const synced = await ensureUserInviteCode(user);
  return {
    userId: synced.id,
    id: synced.id,
    nickname: synced.nickname,
    phone: synced.phone,
    avatar: await resolveMediaUrl(synced.avatar || avatarPathForGender(avatarGender)),
    avatarGender,
    vipLevel: synced.vipLevel,
    balance: synced.balance,
    totalConsume: synced.totalConsume ?? 0,
    couponCount,
    inviteCode: resolveInviteCode(synced),
    inviterId: synced.inviterId || "",
  };
}

export function reviewToClient(review: ProductReview) {
  return {
    id: review.id,
    user: review.userName,
    rate: review.rate,
    content: review.content,
    time: review.reviewTime,
  };
}

export const contentService = {
  async getBySlug(slug: string) {
    const page = await getContentPageBySlug(slug);
    if (!page) return null;
    return { slug: page.slug, title: page.title, payload: page.payload };
  },
};

export const reviewService = {
  async listByProduct(productId: string) {
    const items = await listProductReviews(productId);
    return items.map(reviewToClient);
  },
};

export const feedbackService = {
  async create(input: {
    userId: string;
    typeId: string;
    content: string;
    contact: string;
  }) {
    const feedback = {
      id: `fb_${Date.now()}`,
      userId: input.userId,
      typeId: input.typeId,
      content: input.content,
      contact: input.contact,
      createdAt: formatDateTime(),
    };
    await insertFeedback(feedback);
    return feedback;
  },
};

async function applyInviterIfNeeded(user: AppUser, inviterCode?: string) {
  const withCode = await ensureUserInviteCode(user);
  if (!inviterCode || withCode.inviterId) return withCode;
  const bound = await bindInviterForUser(withCode.id, inviterCode);
  return bound ?? withCode;
}

async function upsertLoginUser(
  existing: AppUser | null,
  create: () => AppUser,
  inviterCode?: string,
) {
  const now = formatDateTime();
  if (existing) {
    if (existing.status === "disabled") {
      throw new Error("账号已禁用");
    }
    const updated = await updateUser(existing.id, { lastLoginAt: now });
    const user = updated ?? existing;
    return applyInviterIfNeeded(user, inviterCode);
  }
  const user = create();
  user.registeredAt = now;
  user.lastLoginAt = now;
  user.inviteCode = "";
  user.inviterId = "";
  user.inviteRewardAt = "";
  await insertUser(user);
  const withInviter = await applyInviterIfNeeded(user, inviterCode);
  await grantRegisterRewardsForUser(withInviter.id);
  return withInviter;
}

function createDefaultUser(partial: Pick<AppUser, "id" | "nickname"> & Partial<AppUser>): AppUser {
  return {
    phone: "",
    avatar: avatarPathForGender("male"),
    avatarGender: "male",
    vipLevel: 0,
    balance: 0,
    totalConsume: 0,
    status: "active",
    registeredAt: "",
    lastLoginAt: "",
    inviteCode: "",
    inviterId: "",
    inviteRewardAt: "",
    ...partial,
  };
}

export const userAuthService = {
  async sendSmsCode(phone: string, scene: string) {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      throw new Error("请输入正确的 11 位手机号");
    }
    const code = DEV_SMS_CODE;
    smsCodes.set(normalized, { code, sentAt: Date.now(), scene });
    return { phone: normalized, devHint: `开发环境验证码：${code}` };
  },

  verifySmsCode(phone: string, smsCode: string) {
    const normalized = normalizePhone(phone);
    if (!normalized) throw new Error("请输入正确的手机号");
    const code = String(smsCode || "").trim();
    if (!/^\d{6}$/.test(code)) throw new Error("请输入 6 位验证码");
    const cached = smsCodes.get(normalized);
    const expected = cached?.code ?? DEV_SMS_CODE;
    if (code !== expected) throw new Error("验证码错误");
    return normalized;
  },

  async loginWithSms(phone: string, smsCode: string, inviterCode?: string) {
    const normalized = this.verifySmsCode(phone, smsCode);
    const existing = await findUserByPhone(normalized);
    const user = await upsertLoginUser(
      existing,
      () =>
        createDefaultUser({
          id: `u${Date.now()}`,
          nickname: `用户${normalized.slice(-4)}`,
          phone: normalized,
        }),
      inviterCode,
    );
    return { token: signUserToken(user.id), user: await toClientUser(user) };
  },

  async loginWithWechat(code: string, inviterCode?: string) {
    const openid = `wx_${String(code || Date.now()).slice(-12)}`;
    const existing = await findUserByWechatOpenid(openid);
    const seed = String(code || "").slice(-6) || String(Date.now()).slice(-6);
    const user = await upsertLoginUser(
      existing,
      () =>
        createDefaultUser({
          id: `u${Date.now()}`,
          nickname: `微信用户${seed}`,
          wechatOpenid: openid,
        }),
      inviterCode,
    );
    return { token: signUserToken(user.id), user: await toClientUser(user) };
  },

  async bindPhone(userId: string, phone: string, smsCode: string) {
    const normalized = this.verifySmsCode(phone, smsCode);
    const owner = await findUserByPhone(normalized);
    if (owner && owner.id !== userId) {
      throw new Error("该手机号已被其他账号绑定");
    }
    const updated = await updateUser(userId, { phone: normalized });
    if (!updated) throw new Error("用户不存在");
    return { phone: normalized, user: await toClientUser(updated) };
  },

  async getMe(userId: string) {
    const user = await getUser(userId);
    if (!user || user.status === "disabled") return null;
    const synced = await syncUserVipFromConsume(userId);
    return toClientUser(synced ?? user);
  },

  async updateProfile(
    userId: string,
    input: { nickname?: string; avatarGender?: AvatarGender },
  ) {
    const existing = await getUser(userId);
    if (!existing || existing.status === "disabled") {
      throw new Error("用户不存在");
    }

    const patch: Partial<AppUser> = {};
    if (input.nickname !== undefined) {
      const nickname = input.nickname.trim();
      if (!nickname) throw new Error("昵称不能为空");
      if (nickname.length > 20) throw new Error("昵称不超过 20 字");
      patch.nickname = nickname;
    }
    if (input.avatarGender !== undefined) {
      const avatarGender = normalizeAvatarGender(input.avatarGender, existing.avatar);
      patch.avatarGender = avatarGender;
      patch.avatar = avatarPathForGender(avatarGender);
    }

    if (!Object.keys(patch).length) {
      return toClientUser(existing);
    }

    const updated = await updateUser(userId, patch);
    if (!updated) throw new Error("用户不存在");
    return toClientUser(updated);
  },

  async recharge(userId: string, amount: number) {
    const before = await getUser(userId);
    if (!before || before.status === "disabled") {
      throw new Error("用户不存在");
    }
    const previousVipLevel = before.vipLevel;
    const updated = await rechargeMember(userId, amount);
    if (!updated) throw new Error("用户不存在");
    const user = await toClientUser(updated);
    const vipUpgraded = updated.vipLevel > previousVipLevel;
    return {
      user,
      vipUpgraded,
      vipLevel: updated.vipLevel,
      totalConsume: updated.totalConsume,
    };
  },
};
