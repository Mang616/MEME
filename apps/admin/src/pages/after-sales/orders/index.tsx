import { Alert, Button, Table } from "@arco-design/web-react";
import { useCallback, useMemo, useState } from "react";
import { OrderListFilterBar } from "@/components/orders/OrderListFilterBar";
import { OrderEditModal, useOrderEditor } from "@/components/orders/OrderEditModal";
import { BASE_ORDER_COLUMNS, orderActionColumn } from "@/components/OrderTableColumns";
import { PageShell, DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { useAdminList } from "@/hooks/useAdminList";
import { matchOrderRow } from "@/lib/order-list-filter";
import { api, type OrderRow } from "@/lib/api";
import { hasAnyPermission } from "@/lib/session";

export default function AfterSalesOrdersPage() {
  const canWrite = hasAnyPermission(["after_sales.write", "orders.write"]);
  const [keyword, setKeyword] = useState("");

  const { loading, loadError, rows, setRows, load } = useAdminList({
    load: api.listAfterSaleOrders,
    errorMessage: "加载售后订单失败",
  });

  const filteredRows = useMemo(
    () => rows.filter((row) => matchOrderRow(row, keyword, "after_sale")),
    [rows, keyword],
  );

  function resetFilters() {
    setKeyword("");
  }

  const { editing, saving, form, openEdit, closeEdit, handleSave } = useOrderEditor({
    mode: "afterSale",
    onUpdated: useCallback(
      (updated: OrderRow) => {
        setRows((prev) => {
          if (updated.status !== "after_sale") {
            return prev.filter((row) => row.id !== updated.id);
          }
          return prev.map((row) => (row.id === updated.id ? updated : row));
        });
      },
      [setRows],
    ),
  });

  const columns = [
    ...BASE_ORDER_COLUMNS,
    ...(canWrite
      ? [
          orderActionColumn((row) => (
            <Button type="text" size="small" onClick={() => openEdit(row)}>
              处理
            </Button>
          )),
        ]
      : []),
  ];

  return (
    <PageShell
      title="售后工单"
      subtitle="处理状态为「售后中」的订单，完结后可标记为已完成"
      loading={loading}
      action={
        <Button type="outline" onClick={() => void load()}>
          刷新
        </Button>
      }
    >
      {loadError ? <Alert type="error" content={loadError} style={{ marginBottom: 16 }} /> : null}
      <OrderListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter="after_sale"
        onStatusFilterChange={() => {}}
        showStatusFilter={false}
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
        noDataElement="暂无售后中的订单"
      />

      <OrderEditModal
        mode="afterSale"
        editing={editing}
        saving={saving}
        form={form}
        onSave={() => void handleSave()}
        onCancel={closeEdit}
      />
    </PageShell>
  );
}
