import type { ReactNode } from "react";
import { Button, Space, Tag, Typography } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { AUTO_ASSIGN_LABEL } from "@/constants/orders";
import { ORDER_STATUS_MAP } from "@/constants/labels";
import type { OrderRow } from "@/lib/api";

export const BASE_ORDER_COLUMNS: ColumnProps<OrderRow>[] = [
  { title: "订单号", dataIndex: "id", width: 220 },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    render: (status: OrderRow["status"]) => {
      const meta = ORDER_STATUS_MAP[status];
      return <Tag color={meta.color}>{meta.label}</Tag>;
    },
  },
  { title: "商品", dataIndex: "productTitle", ellipsis: true },
  {
    title: "金额",
    dataIndex: "totalPaid",
    width: 100,
    render: (v: number) => `¥${v}`,
  },
  { title: "大区", dataIndex: "region", width: 80 },
  { title: "游戏 ID", dataIndex: "gameId", width: 120 },
  {
    title: "指派方式",
    dataIndex: "assignedPlayer",
    width: 140,
    ellipsis: true,
    render: (value: string) => (
      <Typography.Text type={value === AUTO_ASSIGN_LABEL ? "secondary" : undefined}>
        {value}
      </Typography.Text>
    ),
  },
  { title: "服务打手", dataIndex: "servicePlayer", width: 120 },
  { title: "下单时间", dataIndex: "orderTime", width: 180 },
];

export function orderActionColumn(
  render: (row: OrderRow) => ReactNode,
  width = 120,
): ColumnProps<OrderRow> {
  return {
    title: "操作",
    width,
    fixed: "right",
    render: (_: unknown, row: OrderRow) => <Space size={4}>{render(row)}</Space>,
  };
}

export function AcceptOrderButton({
  loading,
  onAccept,
}: {
  loading: boolean;
  onAccept: () => void;
}) {
  return (
    <Button type="primary" size="small" loading={loading} onClick={onAccept}>
      接单
    </Button>
  );
}
