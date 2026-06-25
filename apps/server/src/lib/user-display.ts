/**
 * 用户展示名与手机号脱敏（后台会话等场景）
 */
import type { AppUser } from "../types.js";

export function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function formatUserDisplayName(user: AppUser | undefined, ownerUserId: string) {
  if (user?.nickname?.trim()) return user.nickname.trim();
  if (user?.phone) return `用户 ${maskPhone(user.phone)}`;
  return ownerUserId ? `用户 ${ownerUserId}` : "未知用户";
}
