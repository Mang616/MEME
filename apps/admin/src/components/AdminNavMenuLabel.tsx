import { useAdminLivePoll } from "@/contexts/AdminLivePollContext";

export type NavMenuBadge = "hall" | "chatUnread";

type AdminNavMenuLabelProps = {
  label: string;
  badge?: NavMenuBadge;
};

function formatCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function AdminNavMenuLabel({ label, badge }: AdminNavMenuLabelProps) {
  const { hallPendingCount, chatUnreadCount } = useAdminLivePoll();

  const showHallBadge = badge === "hall" && hallPendingCount > 0;
  const showChatDot = badge === "chatUnread" && chatUnreadCount > 0;

  return (
    <span className="admin-menu-item__label">
      <span className="admin-menu-item__text">{label}</span>
      {showHallBadge ? (
        <span className="admin-menu-badge admin-menu-badge--count" aria-label={`${hallPendingCount} 单待抢`}>
          {formatCount(hallPendingCount)}
        </span>
      ) : null}
      {showChatDot ? (
        <span className="admin-menu-badge admin-menu-badge--dot" aria-label="有新会话消息" />
      ) : null}
    </span>
  );
}

export function AdminNavSubMenuTitle({
  label,
  showChatDot,
}: {
  label: string;
  showChatDot?: boolean;
}) {
  const { chatUnreadCount } = useAdminLivePoll();
  const visible = showChatDot && chatUnreadCount > 0;

  return (
    <span className="admin-menu-item__label admin-menu-item__label--submenu">
      <span className="admin-menu-item__text">{label}</span>
      {visible ? (
        <span className="admin-menu-badge admin-menu-badge--dot" aria-label="有新会话消息" />
      ) : null}
    </span>
  );
}
