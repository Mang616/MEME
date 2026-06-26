import { Alert, Button, Table, Typography } from "@arco-design/web-react";
import { useMemo, useState } from "react";
import { OrderDispatchDrawer } from "@/components/orders/OrderDispatchDrawer";
import { OrderListFilterBar } from "@/components/orders/OrderListFilterBar";
import { BASE_ORDER_COLUMNS, orderActionColumn } from "@/components/OrderTableColumns";
import { PageShell, DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { AUTO_ASSIGN_LABEL } from "@/constants/orders";
import { useAdminList } from "@/hooks/useAdminList";
import { matchOrderRow } from "@/lib/order-list-filter";
import { api, type OrderRow } from "@/lib/api";

export default function OrderDispatchPage() {
  const [keyword, setKeyword] = useState("");
  const [dispatchOrder, setDispatchOrder] = useState<OrderRow | null>(null);

  const { loading, loadError, rows, setRows, load } = useAdminList({
    load: api.listOrderDispatch,
    errorMessage: "加载派单列表失败",
  });

  const filteredRows = useMemo(
    () => rows.filter((row) => matchOrderRow(row, keyword, "all")),
    [rows, keyword],
  );

  function resetFilters() {
    setKeyword("");
  }

  function handleAssigned(updated: OrderRow) {
    setRows((prev) => prev.filter((item) => item.id !== updated.id));
  }

  return (
    <PageShell
      title="订单派单"
      subtitle="为「系统自动分配」且尚未接单的订单指定打手"
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
        statusFilter="all"
        onStatusFilterChange={() => {}}
        showStatusFilter={false}
        total={rows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />
      <Table
        rowKey="id"
        columns={[
          ...BASE_ORDER_COLUMNS,
          orderActionColumn((row) => (
            <div className="order-dispatch-actions">
              <Button type="primary" size="small" onClick={() => setDispatchOrder(row)}>
                派单
              </Button>
              {row.assignedPlayer !== AUTO_ASSIGN_LABEL ? (
                <Typography.Text type="secondary" className="order-dispatch-actions__hint">
                  指定：{row.assignedPlayer}
                </Typography.Text>
              ) : null}
            </div>
          ), 120),
        ]}
        data={filteredRows}
        pagination={DEFAULT_TABLE_PAGINATION}
        scroll={{ x: 1280 }}
        noDataElement="暂无待派单订单"
      />

      <OrderDispatchDrawer
        order={dispatchOrder}
        visible={Boolean(dispatchOrder)}
        onClose={() => setDispatchOrder(null)}
        onAssigned={handleAssigned}
      />
    </PageShell>
  );
}
