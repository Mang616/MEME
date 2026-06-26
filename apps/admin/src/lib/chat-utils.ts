import type { ChatRow } from "@/lib/api";
import { matchKeyword } from "@/lib/list-filter";

/** 后台侧未读：API 字段 unread 映射自 staffUnread */
export function sumChatUnread(rows: Pick<ChatRow, "unread">[]) {
  return rows.reduce((sum, row) => sum + (row.unread ?? 0), 0);
}

/** 角标数字：超过 99 显示 99+ */
export function formatBadgeCount(count: number, options?: { hideZero?: boolean }) {
  if (options?.hideZero && count <= 0) return "";
  if (count <= 0) return "0";
  return count > 99 ? "99+" : String(count);
}

/** @deprecated 使用 formatBadgeCount({ hideZero: true }) */
export function formatUnreadBadge(count: number) {
  return formatBadgeCount(count, { hideZero: true });
}

export function chatDisplayName(row: Pick<ChatRow, "name" | "ownerNickname">) {
  return row.ownerNickname?.trim() || row.name;
}

export function isPlayerChat(chat: Pick<ChatRow, "type">) {
  return chat.type === "player";
}

export function isChatTerminated(chat: Pick<ChatRow, "closedAt">) {
  return Boolean(chat.closedAt);
}

export function matchChatRow(row: ChatRow, keyword: string) {
  return matchKeyword(
    [
      row.name,
      row.ownerNickname,
      row.ownerPhone,
      row.ownerUserId,
      row.handlerName,
      row.lastMessage,
      row.linkedOrderId,
      row.typeLabel,
    ],
    keyword,
  );
}

function buildChatHeaderMeta(chat: ChatRow) {
  if (isPlayerChat(chat) && chat.handlerName) {
    return `打手 ${chat.handlerName}`;
  }
  return "";
}

export { buildChatHeaderMeta };
