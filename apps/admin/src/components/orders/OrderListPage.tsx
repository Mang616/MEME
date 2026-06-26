import { Alert, Button, Table } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OrderListFilterBar } from "@/components/orders/OrderListFilterBar";
import { OrderEditModal, useOrderEditor } from "@/components/orders/OrderEditModal";
import { BASE_ORDER_COLUMNS } from "@/components/OrderTableColumns";
import { PageShell, DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { ADMIN_ORDER_POLL_MS } from "@/constants/polling";
import { useAdminLivePoll } from "@/contexts/AdminLivePollContext";
import { useAdminList } from "@/hooks/useAdminList";
import { matchOrderRow } from "@/lib/order-list-filter";
import { collectFreshById, notifyFreshOrdersToast } from "@/lib/order-notifications";
import { api, type OrderRow } from "@/lib/api";
import { hasPermission } from "@/lib/session";

type OrderListPageProps = {
  mode: "all" | "mine";
};

const PAGE_META = {
  all: {
    title: "订单列表",
    subtitle: "全部订单查询与状态维护：待接单 → 履约 → 待确认 → 已完成 / 售后",
    load: () => api.listOrders(),
    errorMessage: "加载订单失败，请确认 API 服务已启动",
  },
  mine: {
    title: "我的订单",
    subtitle: "查看指派给你的订单，含用户指定打手与接单大厅抢到的订单",
    load: () => api.listMyOrders(),
    errorMessage: "加载我的订单失败，请确认账号已绑定打手档案",
  },
} as const;

export function OrderListPage({ mode }: OrderListPageProps) {
  const meta = PAGE_META[mode];
  const canWrite = mode === "all" && hasPermission("orders.write");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderRow["status"] | "all">("all");

  const { loading, loadError, rows, setRows, load } = useAdminList({
    load: meta.load,
    errorMessage: meta.errorMessage,
  });
  const { reportMyOrdersPending } = useAdminLivePoll();
  const knownPendingIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (mode !== "mine") return;
    reportMyOrdersPending(rows.filter((row) => row.status === "pending_accept").length);
  }, [mode, rows, reportMyOrdersPending]);

  useEffect(() => {
    if (mode !== "mine") return;

    const poll = async () => {
      try {
        const data = await api.listMyOrders();
        const pending = data.items.filter((row) => row.status === "pending_accept");
        const { fresh, knownIds } = collectFreshById(pending, knownPendingIdsRef.current);

        if (fresh.length) {
          notifyFreshOrdersToast(fresh);
          setRows(data.items);
        }

        knownPendingIdsRef.current = knownIds;
        reportMyOrdersPending(pending.length);
      } catch {
        // 静默轮询，不打断当前页
      }
    };

    const timer = window.setInterval(() => void poll(), ADMIN_ORDER_POLL_MS);
    return () => {
      window.clearInterval(timer);
      knownPendingIdsRef.current = null;
    };
  }, [mode, reportMyOrdersPending, setRows]);

  const { editing, saving, form, openEdit, closeEdit, handleSave } = useOrderEditor({
    onUpdated: useCallback(
      (updated: OrderRow) => {
        setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      },
      [setRows],
    ),
  });

  const filteredRows = useMemo(
    () => rows.filter((row) => matchOrderRow(row, keyword, statusFilter)),
    [rows, keyword, statusFilter],
  );

  function resetFilters() {
    setKeyword("");
    setStatusFilter("all");
  }

  const columns: ColumnProps<OrderRow>[] = [
    ...BASE_ORDER_COLUMNS,
    ...(canWrite
      ? [
          {
            title: "操作",
            width: 100,
            fixed: "right" as const,
            render: (_: unknown, row: OrderRow) => (
              <Button type="text" size="small" onClick={() => openEdit(row)}>
                编辑
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <PageShell
      title={meta.title}
      subtitle={meta.subtitle}
      loading={loading}
      action={
        <Button type="outline" onClick={() => void load()}>
          刷新
        </Button>
      }
    >
      {loadError ? <Alert type="error" content={loadError} style={{ marginBottom: 12 }} /> : null}
      <OrderListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        total={rows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />
      <Table
        rowKey="id"
        columns={columns}
        data={filteredRows}
        pagination={DEFAULT_TABLE_PAGINATION}
        scroll={{ x: 1320 }}
        noDataElement={mode === "mine" ? "暂无指派给你的订单" : undefined}
      />

      {canWrite ? (
        <OrderEditModal
          editing={editing}
          saving={saving}
          form={form}
          onSave={() => void handleSave()}
          onCancel={closeEdit}
        />
      ) : null}
    </PageShell>
  );
}
