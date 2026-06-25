import {
  findUserByInviteCode,
  getUser,
  listUsers,
  updateUser,
} from "../db/index.js";
import {
  generateInviteCodeCandidate,
  normalizeInviteCode,
  resolveInviteCode,
} from "../lib/invite-code.js";
import type { AppUser } from "../types.js";

export async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const code = generateInviteCodeCandidate();
    const existing = await findUserByInviteCode(code);
    if (!existing) return code;
  }
  throw new Error("邀请码生成失败，请重试");
}

export async function ensureUserInviteCode(user: AppUser): Promise<AppUser> {
  const current = normalizeInviteCode(user.inviteCode);
  if (current) {
    if (current !== user.inviteCode) {
      const updated = await updateUser(user.id, { inviteCode: current });
      return updated ?? { ...user, inviteCode: current };
    }
    return user;
  }

  const fallback = normalizeInviteCode(resolveInviteCode(user));
  const owner = fallback ? await findUserByInviteCode(fallback) : null;
  const inviteCode =
    !owner || owner.id === user.id ? fallback || (await generateUniqueInviteCode()) : await generateUniqueInviteCode();

  const updated = await updateUser(user.id, { inviteCode });
  return updated ?? { ...user, inviteCode };
}

export async function bindInviterForUser(userId: string, inviterCodeRaw: string): Promise<AppUser | null> {
  const inviterCode = normalizeInviteCode(inviterCodeRaw);
  if (!inviterCode) return getUser(userId);

  const user = await getUser(userId);
  if (!user) return null;
  if (user.inviterId) return user;

  const inviter = await findUserByInviteCode(inviterCode);
  if (!inviter || inviter.id === userId) return user;

  const updated = await updateUser(userId, { inviterId: inviter.id });
  return updated;
}

export async function ensureAllUsersInviteCodes(): Promise<number> {
  const users = await listUsers();
  let fixed = 0;
  for (const user of users) {
    const before = normalizeInviteCode(user.inviteCode);
    const next = await ensureUserInviteCode(user);
    if (!before && normalizeInviteCode(next.inviteCode)) {
      fixed += 1;
    }
  }
  return fixed;
}

export async function resolveInviterSummary(inviterId: string) {
  const id = String(inviterId || "").trim();
  if (!id) return null;
  const inviter = await getUser(id);
  if (!inviter) return { id, nickname: "—", inviteCode: "" };
  const withCode = await ensureUserInviteCode(inviter);
  return {
    id: withCode.id,
    nickname: withCode.nickname,
    inviteCode: resolveInviteCode(withCode),
  };
}

export async function toAdminUserRow(user: AppUser) {
  const withCode = await ensureUserInviteCode(user);
  const inviter = withCode.inviterId ? await resolveInviterSummary(withCode.inviterId) : null;
  return {
    ...withCode,
    inviteCode: resolveInviteCode(withCode),
    inviterNickname: inviter?.nickname ?? "",
  };
}

export async function mapAdminUserRows(users: AppUser[]) {
  return Promise.all(users.map((user) => toAdminUserRow(user)));
}
