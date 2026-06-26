/**
 * 邀请活动默认数据与归一化（Admin / 小程序 mock / seed 单一数据源）
 *
 * 运行时配置来自 CMS slug `invite-activity`（兼容旧 `invite-banner`）。
 */

/** @typedef {{ inviterTemplateIds: string[], inviteeTemplateIds: string[] }} InviteActivityRewards */
/** @typedef {{ enabled: boolean, tag: string, title: string, subtitle: string, cta: string, navTag: string, navTitle: string, rules: string[], poster: { headline: string, footnote: string }, rewards: InviteActivityRewards }} InviteActivityPayload */

const INVITE_REWARD_DEFAULTS = {
  inviterTemplateIds: ["cp_invite_inviter"],
  inviteeTemplateIds: ["cp_invite_invitee"],
};

const INVITE_ACTIVITY_DEFAULTS = {
  enabled: true,
  tag: "限时活动",
  title: "邀请好友 · 领取奖励",
  subtitle: "好友完成首单，双方均可获得优惠券",
  cta: "去邀请",
  navTag: "邀请",
  navTitle: "邀请好友有礼",
  rules: [
    "分享邀请码或二维码给好友",
    "好友通过链接进入小程序并完成注册",
    "好友完成首单后，双方各得优惠券奖励",
  ],
  poster: {
    headline: "邀请好友 · 领取奖励",
    footnote: "扫码或输入邀请码，一起领优惠券",
  },
  rewards: INVITE_REWARD_DEFAULTS,
};

function normalizeTemplateIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeRewards(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const inviterTemplateIds = normalizeTemplateIds(input.inviterTemplateIds);
  const inviteeTemplateIds = normalizeTemplateIds(input.inviteeTemplateIds);

  return {
    inviterTemplateIds: inviterTemplateIds.length
      ? inviterTemplateIds
      : [...INVITE_REWARD_DEFAULTS.inviterTemplateIds],
    inviteeTemplateIds: inviteeTemplateIds.length
      ? inviteeTemplateIds
      : [...INVITE_REWARD_DEFAULTS.inviteeTemplateIds],
  };
}

function normalizeRules(rules) {
  if (!Array.isArray(rules) || !rules.length) {
    return [...INVITE_ACTIVITY_DEFAULTS.rules];
  }
  return rules.map((item) => String(item).trim()).filter(Boolean);
}

/**
 * 整理 CMS / 本地编辑态 payload，补齐缺省文案与规则。
 * @param {Partial<InviteActivityPayload> | null | undefined} raw
 * @returns {InviteActivityPayload}
 */
function normalizeInviteActivityPayload(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const title = input.title?.trim() || INVITE_ACTIVITY_DEFAULTS.title;

  return {
    enabled: input.enabled !== false,
    tag: input.tag?.trim() || INVITE_ACTIVITY_DEFAULTS.tag,
    title,
    subtitle: input.subtitle?.trim() || INVITE_ACTIVITY_DEFAULTS.subtitle,
    cta: input.cta?.trim() || INVITE_ACTIVITY_DEFAULTS.cta,
    navTag: input.navTag?.trim() || INVITE_ACTIVITY_DEFAULTS.navTag,
    navTitle: input.navTitle?.trim() || INVITE_ACTIVITY_DEFAULTS.navTitle,
    rules: normalizeRules(input.rules),
    poster: {
      headline:
        input.poster?.headline?.trim() || title || INVITE_ACTIVITY_DEFAULTS.poster.headline,
      footnote: input.poster?.footnote?.trim() || INVITE_ACTIVITY_DEFAULTS.poster.footnote,
    },
    rewards: normalizeRewards(input.rewards),
  };
}

/** 邀请条 / 旧 invite-banner CMS 使用的字段投影 */
function toInviteBannerPayload(raw) {
  const activity = normalizeInviteActivityPayload(raw);
  return {
    tag: activity.tag,
    title: activity.title,
    subtitle: activity.subtitle,
    cta: activity.cta,
    navTag: activity.navTag,
    navTitle: activity.navTitle,
    rules: activity.rules,
  };
}

export {
  INVITE_ACTIVITY_DEFAULTS,
  INVITE_REWARD_DEFAULTS,
  normalizeInviteActivityPayload,
  toInviteBannerPayload,
};
