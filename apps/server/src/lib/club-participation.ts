import { getClub } from "../db/index.js";

/** 校验俱乐部存在且已启用，否则抛出 CLUB_NOT_FOUND / CLUB_DISABLED */
export async function assertClubParticipating(clubId: string) {
  const club = await getClub(clubId);
  if (!club) throw new Error("CLUB_NOT_FOUND");
  if (!club.enabled) throw new Error("CLUB_DISABLED");
  return club;
}
