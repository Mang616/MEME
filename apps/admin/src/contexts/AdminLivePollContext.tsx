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
import { ADMIN_ORDER_POLL_MS } from "@/constants/polling";
import { useOrderSoundUnlock } from "@/hooks/useOrderSoundUnlock";
import { usePollingGuard } from "@/hooks/usePollingGuard";
import { api } from "@/lib/api";
import { sumChatUnread } from "@/lib/chat-utils";
import {
  collectFreshOrders,
  notifyMyPendingOrders,
  notifyNewOrders,
  type PendingOrderNotice,
} from "@/lib/order-notifications";
import { canViewChats, canWatchMyOrders, canWatchPendingOrders } from "@/lib/order-routing";
import { hasAnyPermission } from "@/lib/session";

type AdminLivePollState = {
  hallPendingCount: number;
  myOrdersPendingCount: number;
  chatUnreadCount: number;
  refresh: () => void;
  reportChatUnread: (count: number) => void;
  reportHallPending: (count: number) => void;
  reportMyOrdersPending: (count: number) => void;
};

const AdminLivePollContext = createContext<AdminLivePollState>({
  hallPendingCount: 0,
  myOrdersPendingCount: 0,
  chatUnreadCount: 0,
  refresh: () => {},
  reportChatUnread: () => {},
  reportHallPending: () => {},
  reportMyOrdersPending: () => {},
});

function trackFreshOrders(
  incoming: PendingOrderNotice[],
  knownIdsRef: React.MutableRefObject<Set<string> | null>,
  navigate: ReturnType<typeof useNavigate>,
  onFresh?: (fresh: PendingOrderNotice[]) => void,
) {
  const { fresh, knownIds } = collectFreshOrders(incoming, knownIdsRef.current);
  knownIdsRef.current = knownIds;
  if (fresh.length) {
    if (onFresh) onFresh(fresh);
    else notifyNewOrders(fresh, navigate);
  }
}

export function AdminLivePollProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const onChatPage = location.pathname.startsWith("/service/chats");
  const onHallPage = location.pathname.startsWith("/hall");
  const onMyOrdersPage = location.pathname.startsWith("/orders/mine");
  const runPoll = usePollingGuard();

  const [hallPendingCount, setHallPendingCount] = useState(0);
  const [myOrdersPendingCount, setMyOrdersPendingCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const knownMineOrderIdsRef = useRef<Set<string> | null>(null);

  const reportChatUnread = useCallback((count: number) => setChatUnreadCount(count), []);
  const reportHallPending = useCallback((count: number) => setHallPendingCount(count), []);
  const reportMyOrdersPending = useCallback((count: number) => setMyOrdersPendingCount(count), []);

  const poll = useCallback(
    async (force = false) => {
      await runPoll(async () => {
        const tasks: Promise<void>[] = [];

        if (hasAnyPermission(["orders.accept"]) && !onHallPage) {
          tasks.push(
            api.listOrderHall().then((data) => {
              setHallPendingCount(data.total);
              if (canWatchPendingOrders()) {
                trackFreshOrders(data.items, knownOrderIdsRef, navigate);
              }
            }),
          );
        } else if (canWatchPendingOrders() && hasAnyPermission(["orders.dispatch", "orders.write"])) {
          tasks.push(
            api.watchPendingOrders().then((data) => {
              trackFreshOrders(data.items, knownOrderIdsRef, navigate);
            }),
          );
        }

        if (canWatchMyOrders() && !onMyOrdersPage) {
          tasks.push(
            api.watchMyOrders().then((data) => {
              setMyOrdersPendingCount(data.total);
              trackFreshOrders(data.items, knownMineOrderIdsRef, navigate, (fresh) =>
                notifyMyPendingOrders(fresh, navigate),
              );
            }),
          );
        }

        if (canViewChats() && !onChatPage) {
          tasks.push(
            api.listChats().then((data) => {
              setChatUnreadCount(sumChatUnread(data.items));
            }),
          );
        }

        await Promise.allSettled(tasks);
      }, force);
    },
    [navigate, onChatPage, onHallPage, onMyOrdersPage, runPoll],
  );

  const refresh = useCallback(() => {
    void poll(true);
  }, [poll]);

  const canPollOrders = canWatchPendingOrders();
  const canPollChats = canViewChats();
  useOrderSoundUnlock(canPollOrders);

  useEffect(() => {
    if (!canPollOrders && !canPollChats) return;

    void poll();
    const timer = window.setInterval(() => void poll(), ADMIN_ORDER_POLL_MS);
    return () => {
      window.clearInterval(timer);
      knownOrderIdsRef.current = null;
      knownMineOrderIdsRef.current = null;
    };
  }, [canPollChats, canPollOrders, poll]);

  return (
    <AdminLivePollContext.Provider
      value={{
        hallPendingCount,
        myOrdersPendingCount,
        chatUnreadCount,
        refresh,
        reportChatUnread,
        reportHallPending,
        reportMyOrdersPending,
      }}
    >
      {children}
    </AdminLivePollContext.Provider>
  );
}

export function useAdminLivePoll() {
  return useContext(AdminLivePollContext);
}
