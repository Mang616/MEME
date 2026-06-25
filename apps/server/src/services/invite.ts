import QRCode from "qrcode";
import {
  INVITE_ACTIVITY_DEFAULTS,
  normalizeInviteActivityPayload,
  type InviteActivityPayload,
} from "@meme/invite-activity-defaults";
import { getContentPageBySlug } from "../db/index.js";
import {
  buildInviteQrText,
  buildInviteSharePath,
  resolveInviteCode,
} from "../lib/invite-code.js";
import { platformDomains } from "../lib/platform-domains.js";
import { buildInvitePosterDataUrl } from "../lib/invite-poster.js";
import { ensureUserInviteCode } from "./invite-user.js";
import type { AppUser } from "../types.js";

export type { InviteActivityPayload };

const INVITE_ACTIVITY_SLUGS = ["invite-activity", "invite-banner"] as const;

export async function loadInviteActivityPayload(): Promise<InviteActivityPayload> {
  for (const slug of INVITE_ACTIVITY_SLUGS) {
    const page = await getContentPageBySlug(slug);
    if (page?.payload) {
      return normalizeInviteActivityPayload(page.payload as Partial<InviteActivityPayload>);
    }
  }
  return INVITE_ACTIVITY_DEFAULTS;
}

export async function getUserInvitePayload(user: AppUser) {
  const synced = await ensureUserInviteCode(user);
  const inviteCode = resolveInviteCode(synced);
  const brandName = platformDomains.brand.name;
  const qrText = buildInviteQrText(inviteCode, brandName);
  const qrPngBuffer = await QRCode.toBuffer(qrText, {
    width: 360,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const qrDataUrl = `data:image/png;base64,${qrPngBuffer.toString("base64")}`;

  const activity = await loadInviteActivityPayload();

  const posterDataUrl = await buildInvitePosterDataUrl({
    brandName,
    title: activity.title,
    subtitle: activity.subtitle,
    inviteCode,
    nickname: synced.nickname,
    posterHeadline: activity.poster.headline,
    posterFootnote: activity.poster.footnote,
    qrPngBuffer,
  });

  return {
    inviteCode,
    qrText,
    qrDataUrl,
    posterDataUrl,
    sharePath: buildInviteSharePath(inviteCode),
    shareTitle: activity.title,
    tag: activity.tag,
    title: activity.title,
    subtitle: activity.subtitle,
    cta: activity.cta,
    navTag: activity.navTag,
    navTitle: activity.navTitle,
    rules: activity.rules,
    enabled: activity.enabled,
  };
}
