import type { ChatRow } from "@/lib/api";

/** 后台侧未读：API 字段 unread 映射自 staffUnread */
export function sumChatUnread(rows: Pick<ChatRow, "unread">[]) {
  return rows.reduce((sum, row) => sum + (row.unread ?? 0), 0);
}

export function formatUnreadBadge(count: number) {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}
