import { Alert, Button, Table } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useMemo, useState } from "react";
import { OrderListFilterBar } from "@/components/orders/OrderListFilterBar";
import { OrderEditModal, useOrderEditor } from "@/components/orders/OrderEditModal";
import { BASE_ORDER_COLUMNS } from "@/components/OrderTableColumns";
import { PageShell, DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { useAdminList } from "@/hooks/useAdminList";
import { matchOrderRow } from "@/lib/order-list-filter";
import { api, type OrderRow } from "@/lib/api";
import { hasPermission } from "@/lib/session";

export default function OrdersPage() {
  const canWrite = hasPermission("orders.write");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderRow["status"] | "all">("all");

  const { loading, loadError, rows, setRows, load } = useAdminList({
    load: api.listOrders,
    errorMessage: "加载订单失败，请确认 API 服务已启动",
  });

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
      title="订单列表"
      subtitle="全部订单查询与状态维护：待接单 → 履约 → 待确认 → 已完成 / 售后"
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
      />

      <OrderEditModal
        editing={editing}
        saving={saving}
        form={form}
        onSave={() => void handleSave()}
        onCancel={closeEdit}
      />
    </PageShell>
  );
}
