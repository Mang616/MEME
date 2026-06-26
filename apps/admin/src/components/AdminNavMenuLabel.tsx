import { useAdminLivePoll } from "@/contexts/AdminLivePollContext";
import type { NavMenuBadge } from "@/config/navigation";
import { formatBadgeCount } from "@/lib/chat-utils";

type AdminNavMenuLabelProps = {
  label: string;
  badge?: NavMenuBadge;
};

export function AdminNavMenuLabel({ label, badge }: AdminNavMenuLabelProps) {
  const { hallPendingCount, myOrdersPendingCount, chatUnreadCount } = useAdminLivePoll();

  const showHallBadge = badge === "hall" && hallPendingCount > 0;
  const showMyOrdersBadge = badge === "myOrders" && myOrdersPendingCount > 0;
  const showChatDot = badge === "chatUnread" && chatUnreadCount > 0;

  return (
    <span className="admin-menu-item__label">
      <span className="admin-menu-item__text">{label}</span>
      {showHallBadge ? (
        <span className="admin-menu-badge admin-menu-badge--count" aria-label={`${hallPendingCount} 单待抢`}>
          {formatBadgeCount(hallPendingCount)}
        </span>
      ) : null}
      {showMyOrdersBadge ? (
        <span className="admin-menu-badge admin-menu-badge--count" aria-label={`${myOrdersPendingCount} 单待处理`}>
          {formatBadgeCount(myOrdersPendingCount)}
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
