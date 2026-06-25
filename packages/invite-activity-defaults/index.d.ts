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
};

export type InviteBannerPayload = Pick<
  InviteActivityPayload,
  "tag" | "title" | "subtitle" | "cta" | "navTag" | "navTitle" | "rules"
>;

export declare const INVITE_ACTIVITY_DEFAULTS: InviteActivityPayload;

export declare function normalizeInviteActivityPayload(
  raw?: Partial<InviteActivityPayload> | null,
): InviteActivityPayload;

export declare function toInviteBannerPayload(
  raw?: Partial<InviteActivityPayload> | null,
): InviteBannerPayload;
