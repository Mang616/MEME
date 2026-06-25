import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { sumChatUnread } from "@/lib/chat-utils";
import {
  collectFreshOrders,
  notifyNewOrders,
  type PendingOrderNotice,
} from "@/lib/order-notifications";
import { canWatchPendingOrders } from "@/lib/order-routing";
import { unlockOrderNotificationSound } from "@/lib/order-notification-sound";
import { hasAnyPermission } from "@/lib/session";

const POLL_INTERVAL_MS = 12_000;

type AdminLivePollState = {
  hallPendingCount: number;
  chatUnreadCount: number;
  refresh: () => void;
  /** 会话页本地列表更新时同步侧栏未读，避免重复轮询 */
  reportChatUnread: (count: number) => void;
};

const AdminLivePollContext = createContext<AdminLivePollState>({
  hallPendingCount: 0,
  chatUnreadCount: 0,
  refresh: () => {},
  reportChatUnread: () => {},
});

function trackFreshOrders(
  incoming: PendingOrderNotice[],
  knownIdsRef: React.MutableRefObject<Set<string> | null>,
  navigate: ReturnType<typeof useNavigate>,
) {
  const { fresh, knownIds } = collectFreshOrders(incoming, knownIdsRef.current);
  knownIdsRef.current = knownIds;
  if (fresh.length) notifyNewOrders(fresh, navigate);
}

export function AdminLivePollProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const onChatPage = location.pathname.startsWith("/service/chats");

  const [hallPendingCount, setHallPendingCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const pollingRef = useRef(false);

  const reportChatUnread = useCallback((count: number) => {
    setChatUnreadCount(count);
  }, []);

  const poll = useCallback(
    async (force = false) => {
      if (!force && pollingRef.current) return;
      pollingRef.current = true;

      const tasks: Promise<void>[] = [];

      if (hasAnyPermission(["orders.accept"])) {
        tasks.push(
          api.listOrderHall().then((data) => {
            setHallPendingCount(data.total);
            if (canWatchPendingOrders()) {
              trackFreshOrders(data.items, knownOrderIdsRef, navigate);
            }
          }),
        );
      } else if (canWatchPendingOrders()) {
        tasks.push(
          api.watchPendingOrders().then((data) => {
            trackFreshOrders(data.items, knownOrderIdsRef, navigate);
          }),
        );
      }

      const canPollChats = hasAnyPermission(["chats.service", "chats.player"]);
      if (canPollChats && !onChatPage) {
        tasks.push(
          api.listChats().then((data) => {
            setChatUnreadCount(sumChatUnread(data.items));
          }),
        );
      }

      try {
        await Promise.allSettled(tasks);
      } finally {
        pollingRef.current = false;
      }
    },
    [navigate, onChatPage],
  );

  const refresh = useCallback(() => {
    void poll(true);
  }, [poll]);

  useEffect(() => {
    const canPollOrders = canWatchPendingOrders();
    const canPollChats = hasAnyPermission(["chats.service", "chats.player"]);
    if (!canPollOrders && !canPollChats) return;

    if (canPollOrders) {
      const unlock = () => unlockOrderNotificationSound();
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }

    void poll();
    const timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      knownOrderIdsRef.current = null;
    };
  }, [poll]);

  return (
    <AdminLivePollContext.Provider
      value={{ hallPendingCount, chatUnreadCount, refresh, reportChatUnread }}
    >
      {children}
    </AdminLivePollContext.Provider>
  );
}

export function useAdminLivePoll() {
  return useContext(AdminLivePollContext);
}
