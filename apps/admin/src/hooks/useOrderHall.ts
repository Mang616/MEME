import { Message } from "@arco-design/web-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_ORDER_POLL_MS } from "@/constants/polling";
import { useAdminLivePoll } from "@/contexts/AdminLivePollContext";
import { usePollingGuard } from "@/hooks/usePollingGuard";
import { playNewOrderSound } from "@/lib/order-notification-sound";
import { ApiError, api, type HallOrderRow } from "@/lib/api";

export function useOrderHall() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [rows, setRows] = useState<HallOrderRow[]>([]);
  const [acceptingId, setAcceptingId] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const knownCountRef = useRef<number | null>(null);
  const runPoll = usePollingGuard();
  const hasLoadedRef = useRef(false);
  const { reportHallPending } = useAdminLivePoll();

  const load = useCallback(async (silent = false) => {
    await runPoll(async () => {
      if (!silent) {
        if (!hasLoadedRef.current) setLoading(true);
        else setRefreshing(true);
      }
      if (!silent) setLoadError("");

      try {
        const data = await api.listOrderHall();
        const incoming = data.items;

        if (silent && knownCountRef.current !== null && incoming.length > knownCountRef.current) {
          playNewOrderSound();
          Message.info(`有 ${incoming.length - knownCountRef.current} 笔新订单可抢`);
        }
        knownCountRef.current = incoming.length;
        setRows(incoming);
        hasLoadedRef.current = true;
        reportHallPending(data.total);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return;
        if (!silent) {
          setLoadError(err instanceof ApiError ? err.message : "加载接单大厅失败");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, !silent);
  }, [reportHallPending, runPoll]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => void load(true), ADMIN_ORDER_POLL_MS);
    return () => window.clearInterval(timer);
  }, [autoRefresh, load]);

  async function handleAccept(row: HallOrderRow) {
    setAcceptingId(row.id);
    try {
      const updated = await api.acceptOrder(row.id);
      setRows((prev) => prev.filter((item) => item.id !== updated.id));
      knownCountRef.current = Math.max(0, (knownCountRef.current ?? 1) - 1);
      reportHallPending(knownCountRef.current);
      Message.success(`接单成功：${updated.productTitle}`);
    } catch (err) {
      Message.error(err instanceof ApiError ? err.message : "接单失败，可能已被其他打手抢走");
      void load(true);
    } finally {
      setAcceptingId("");
    }
  }

  return {
    loading,
    refreshing,
    loadError,
    rows,
    acceptingId,
    autoRefresh,
    setAutoRefresh,
    load,
    handleAccept,
  };
}
