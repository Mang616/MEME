import { Alert, Button, Message, Select, Space, Table, Typography } from "@arco-design/web-react";
import { useCallback, useMemo, useState } from "react";
import { EscortLevelWithLabel } from "@/components/EscortLevelBadge";
import { OrderListFilterBar } from "@/components/orders/OrderListFilterBar";
import { BASE_ORDER_COLUMNS, orderActionColumn } from "@/components/OrderTableColumns";
import { PageShell, DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { AUTO_ASSIGN_LABEL } from "@/constants/orders";
import { useAdminList } from "@/hooks/useAdminList";
import { formatHandlerOptionLabel } from "@/lib/club-labels";
import { matchOrderRow } from "@/lib/order-list-filter";
import { ApiError, api, type HandlerRow, type OrderRow } from "@/lib/api";

export default function OrderDispatchPage() {
  const [handlers, setHandlers] = useState<HandlerRow[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState("");
  const [keyword, setKeyword] = useState("");

  const loadPage = useCallback(async () => {
    const [orderData, handlerData] = await Promise.all([
      api.listOrderDispatch(),
      api.listDispatchableHandlers(),
    ]);
    setHandlers(handlerData.items);
    return orderData;
  }, []);

  const { loading, loadError, rows, setRows, load } = useAdminList({
    load: loadPage,
    errorMessage: "加载派单列表失败",
  });

  const filteredRows = useMemo(
    () => rows.filter((row) => matchOrderRow(row, keyword, "all")),
    [rows, keyword],
  );

  function resetFilters() {
    setKeyword("");
  }

  function pickDefaultHandler(row: OrderRow) {
    if (row.assignedPlayer === AUTO_ASSIGN_LABEL) return "";
    const matched = handlers.find((handler) => handler.name === row.assignedPlayer);
    return matched?.id ?? "";
  }

  function renderHandlerOption(handler: HandlerRow) {
    return (
      <EscortLevelWithLabel
        level={handler.level}
        label={formatHandlerOptionLabel(handler)}
        size="sm"
      />
    );
  }

  async function handleAssign(row: OrderRow) {
    const handlerId = assignments[row.id] ?? pickDefaultHandler(row);
    if (!handlerId) {
      Message.warning("请先选择打手");
      return;
    }

    setAssigningId(row.id);
    try {
      const updated = await api.assignOrder(row.id, { handlerId });
      setRows((prev) => prev.filter((item) => item.id !== updated.id));
      Message.success(`已派单给 ${updated.servicePlayer}`);
    } catch (err) {
      Message.error(err instanceof ApiError ? err.message : "派单失败");
      void load();
    } finally {
      setAssigningId("");
    }
  }

  return (
    <PageShell
      title="订单派单"
      subtitle="客服为待接单订单指定打手，含用户指定选手与系统自动分配"
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
          ...BASE_ORDER_COLUMNS.filter((col) => col.dataIndex !== "servicePlayer"),
          orderActionColumn((row) => (
            <Space direction="vertical" size={8} style={{ minWidth: 180 }}>
              <Select
                size="small"
                placeholder="选择打手"
                value={(assignments[row.id] ?? pickDefaultHandler(row)) || undefined}
                onChange={(value) =>
                  setAssignments((prev) => ({ ...prev, [row.id]: value }))
                }
                triggerProps={{ autoAlignPopupWidth: false, autoAlignPopupMinWidth: true }}
              >
                {handlers.map((handler) => (
                  <Select.Option key={handler.id} value={handler.id}>
                    {renderHandlerOption(handler)}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                size="small"
                loading={assigningId === row.id}
                onClick={() => void handleAssign(row)}
              >
                确认派单
              </Button>
              {row.assignedPlayer !== AUTO_ASSIGN_LABEL ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  用户指定：{row.assignedPlayer}
                </Typography.Text>
              ) : null}
            </Space>
          ), 220),
        ]}
        data={filteredRows}
        pagination={DEFAULT_TABLE_PAGINATION}
        scroll={{ x: 1280 }}
        noDataElement="暂无待派单订单"
      />
    </PageShell>
  );
}
