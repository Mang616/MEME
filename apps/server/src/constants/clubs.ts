import { formatDateTime } from "../lib/format-time.js";

export const PLATFORM_CLUB_ID = "club_platform";

export type ClubKind = "platform" | "partner";

export function buildDefaultPlatformClub() {
  return {
    id: PLATFORM_CLUB_ID,
    name: "迷因电竞自营",
    kind: "platform" as const,
    contactName: "平台运营",
    contactPhone: "",
    description: "平台直属车队，优先承接系统派单",
    enabled: true,
    joinedAt: "2026-01-01 00:00:00",
  };
}

export const CLUB_KIND_LABELS: Record<ClubKind, string> = {
  platform: "平台自营",
  partner: "入驻俱乐部",
};

export function defaultClubJoinedAt() {
  return formatDateTime();
}
