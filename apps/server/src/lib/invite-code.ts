const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 8;

/** 规范化邀请码输入 */
export function normalizeInviteCode(input: string): string {
  return String(input || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/** 由用户 ID 生成兜底邀请码（历史数据迁移用） */
export function buildInviteCodeFallback(userId: string): string {
  const raw = String(userId || "").replace(/^u/i, "");
  if (!raw) return "";
  return raw.slice(-INVITE_CODE_LENGTH).toUpperCase().padStart(INVITE_CODE_LENGTH, "0");
}

export function resolveInviteCode(user: { id: string; inviteCode?: string }): string {
  const stored = normalizeInviteCode(user.inviteCode || "");
  if (stored) return stored;
  return buildInviteCodeFallback(user.id);
}

/** 生成随机邀请码候选 */
export function generateInviteCodeCandidate(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }
  return code;
}

export function buildInviteQrText(code: string, brandName: string): string {
  return `${brandName}邀请码:${code}`;
}

export function buildInviteSharePath(code: string): string {
  return `/pages/home/index?inviter=${encodeURIComponent(code)}`;
}

export function escapeXml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
