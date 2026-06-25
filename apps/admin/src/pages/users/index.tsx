import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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
import { USER_STATUS_MAP } from "@/constants/labels";
import { api, type UserRow } from "@/lib/api";

type UserFormValues = {
  nickname: string;
  phone: string;
  avatar: string;
  vipLevel: number;
  balance: number;
  status: UserRow["status"];
};

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<UserFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setRows(data.items);
    } catch {
      Message.error("加载用户失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(row: UserRow) {
    setEditing(row);
    form.setFieldsValue({
      nickname: row.nickname,
      phone: row.phone,
      avatar: row.avatar,
      vipLevel: row.vipLevel,
      balance: row.balance,
      status: row.status,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    const values = await form.validate();
    setSaving(true);
    try {
      const updated = await api.updateUser(editing.id, values);
      setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      Message.success("用户资料已更新");
      setModalOpen(false);
    } catch {
      Message.error("更新失败");
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnProps<UserRow>[] = [
    { title: "昵称", dataIndex: "nickname" },
    { title: "手机号", dataIndex: "phone" },
    {
      title: "VIP",
      dataIndex: "vipLevel",
      width: 80,
      render: (value: number) => `Lv.${value}`,
    },
    {
      title: "余额",
      dataIndex: "balance",
      width: 100,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: UserRow["status"]) => {
        const meta = USER_STATUS_MAP[value];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: "注册时间", dataIndex: "registeredAt", width: 180 },
    { title: "最近登录", dataIndex: "lastLoginAt", width: 180 },
    {
      title: "操作",
      width: 100,
      render: (_value, record) => (
        <Button type="text" onClick={() => openEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Title heading={5} style={{ margin: 0 }}>
          用户管理
        </Typography.Title>
        <Spin loading={loading} style={{ width: "100%" }}>
          <Table rowKey="id" columns={columns} data={rows} pagination={{ pageSize: 10 }} />
        </Spin>
      </Space>

      <Modal
        title="编辑用户"
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="昵称" field="nickname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="手机号" field="phone">
            <Input />
          </Form.Item>
          <Form.Item label="头像 URL" field="avatar">
            <Input />
          </Form.Item>
          <Form.Item label="VIP 等级" field="vipLevel">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="余额" field="balance">
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="状态" field="status">
            <Select>
              {Object.entries(USER_STATUS_MAP).map(([value, meta]) => (
                <Select.Option key={value} value={value}>
                  {meta.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
