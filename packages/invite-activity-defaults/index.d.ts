export type InviteActivityRewards = {
  /** 邀请人获得的优惠券模板 ID（每成功邀请 1 人发放 1 次） */
  inviterTemplateIds: string[];
  /** 被邀请人获得的优惠券模板 ID（每人仅 1 次，被邀请人完成首单后） */
  inviteeTemplateIds: string[];
};

export type InviteActivityPayload = {
  enabled: boolean;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  navTag: string;
  navTitle: string;
  rules: string[];
  poster: {
    headline: string;
    footnote: string;
  };
  rewards: InviteActivityRewards;
};

export type InviteBannerPayload = Pick<
  InviteActivityPayload,
  "tag" | "title" | "subtitle" | "cta" | "navTag" | "navTitle" | "rules"
>;

export declare const INVITE_ACTIVITY_DEFAULTS: InviteActivityPayload;
export declare const INVITE_REWARD_DEFAULTS: InviteActivityRewards;

export declare function normalizeInviteActivityPayload(
  raw?: Partial<InviteActivityPayload> | null,
): InviteActivityPayload;

export declare function toInviteBannerPayload(
  raw?: Partial<InviteActivityPayload> | null,
): InviteBannerPayload;
