import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useState } from "react";
import { ORDER_STATUS_MAP } from "@/constants/labels";
import { ApiError, api, type OrderRow, type OrderStatus } from "@/lib/api";

const columns: ColumnProps<OrderRow>[] = [
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
  { title: "服务打手", dataIndex: "servicePlayer", width: 120 },
  { title: "下单时间", dataIndex: "orderTime", width: 180 },
];

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.listOrders();
      setRows(data.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setLoadError(
        err instanceof ApiError ? err.message : "加载订单失败，请确认 API 服务已启动",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(row: OrderRow) {
    setEditing(row);
    form.setFieldsValue({
      status: row.status,
      servicePlayer: row.servicePlayer === "—" ? "" : row.servicePlayer,
    });
  }

  async function handleSave() {
    if (!editing) return;
    const values = await form.validate();
    setSaving(true);
    try {
      const updated = await api.updateOrder(editing.id, {
        status: values.status as OrderStatus,
        servicePlayer: values.servicePlayer?.trim() || "—",
      });
      setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      Message.success("订单已更新");
      setEditing(null);
    } catch {
      Message.error("更新失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Typography.Title heading={5} style={{ margin: 0 }}>
          订单管理
        </Typography.Title>
        <Typography.Text type="secondary">
          对接小程序订单流程：待接单 → 履约 → 待确认 → 已完成 / 售后
        </Typography.Text>
      </div>
      {loadError ? <Alert type="error" content={loadError} /> : null}
      <Card bordered={false}>
        <Spin loading={loading} style={{ width: "100%" }}>
          <Table
            rowKey="id"
            columns={[
              ...columns,
              {
                title: "操作",
                width: 100,
                fixed: "right",
                render: (_: unknown, row: OrderRow) => (
                  <Button type="text" size="small" onClick={() => openEdit(row)}>
                    编辑
                  </Button>
                ),
              },
            ]}
            data={rows}
            pagination={{ pageSize: 10, showTotal: true }}
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>

      <Modal
        title={`编辑订单 ${editing?.id ?? ""}`}
        visible={Boolean(editing)}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setEditing(null)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="状态" field="status" rules={[{ required: true }]}>
            <Select>
              {Object.entries(ORDER_STATUS_MAP).map(([value, meta]) => (
                <Select.Option key={value} value={value}>
                  {meta.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="服务打手" field="servicePlayer">
            <Input placeholder="留空则显示 —" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
