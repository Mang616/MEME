import {
  Button,
  Card,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useState } from "react";
import {
  ESCORT_LEVEL_MAP,
  SERVICE_TYPE_LABELS,
  REGION_MAP,
} from "@/constants/labels";
import { api, type HandlerRow } from "@/lib/api";

type HandlerFormValues = Omit<HandlerRow, "id">;

const emptyForm: HandlerFormValues = {
  name: "",
  level: "rookie",
  region: "pc",
  serviceType: "escort",
  gender: "male",
  online: false,
};

export default function HandlersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<HandlerRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HandlerRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<HandlerFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listHandlers();
      setRows(data.items);
    } catch {
      Message.error("加载打手失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: HandlerRow) {
    setEditing(row);
    form.setFieldsValue({
      name: row.name,
      level: row.level,
      region: row.region,
      serviceType: row.serviceType,
      gender: row.gender,
      online: row.online,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateHandler(editing.id, values);
        setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        Message.success("打手资料已更新");
      } else {
        const created = await api.createHandler(values);
        setRows((prev) => [created, ...prev]);
        Message.success("打手已创建");
      }
      setModalOpen(false);
    } catch {
      Message.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteHandler(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      Message.success("已删除");
    } catch {
      Message.error("删除失败");
    }
  }

  async function toggleOnline(row: HandlerRow, online: boolean) {
    try {
      const updated = await api.setHandlerOnline(row.id, online);
      setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      Message.error("更新在线状态失败");
    }
  }

  const columns: ColumnProps<HandlerRow>[] = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "昵称", dataIndex: "name", width: 140 },
    {
      title: "等级",
      dataIndex: "level",
      width: 90,
      render: (level: HandlerRow["level"]) => (
        <Tag color="arcoblue">{ESCORT_LEVEL_MAP[level]}</Tag>
      ),
    },
    {
      title: "大区",
      dataIndex: "region",
      width: 80,
      render: (region: HandlerRow["region"]) => REGION_MAP[region],
    },
    {
      title: "服务",
      dataIndex: "serviceType",
      width: 90,
      render: (type: HandlerRow["serviceType"]) => SERVICE_TYPE_LABELS[type],
    },
    {
      title: "性别",
      dataIndex: "gender",
      width: 70,
      render: (gender: HandlerRow["gender"]) => (gender === "male" ? "男" : "女"),
    },
    {
      title: "在线",
      dataIndex: "online",
      width: 100,
      render: (online: boolean, row: HandlerRow) => (
        <Switch checked={online} onChange={(checked) => void toggleOnline(row, checked)} />
      ),
    },
    {
      title: "操作",
      width: 140,
      fixed: "right",
      render: (_: unknown, row: HandlerRow) => (
        <Space>
          <Button type="text" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该打手？" onOk={() => void handleDelete(row.id)}>
            <Button type="text" status="danger" size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Typography.Title heading={5} style={{ margin: 0 }}>
            打手管理
          </Typography.Title>
          <Typography.Text type="secondary">
            派单与选打手页数据模型，含等级、大区、在线状态
          </Typography.Text>
        </div>
        <Button type="primary" onClick={openCreate}>
          新建打手
        </Button>
      </div>
      <Card bordered={false}>
        <Spin loading={loading} style={{ width: "100%" }}>
          <Table
            rowKey="id"
            columns={columns}
            data={rows}
            pagination={{ pageSize: 10, showTotal: true }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editing ? `编辑打手 ${editing.name}` : "新建打手"}
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="昵称" field="name" rules={[{ required: true, message: "请输入昵称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="等级" field="level" rules={[{ required: true }]}>
            <Select>
              {Object.entries(ESCORT_LEVEL_MAP).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="大区" field="region" rules={[{ required: true }]}>
            <Select>
              {Object.entries(REGION_MAP).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="服务类型" field="serviceType" rules={[{ required: true }]}>
            <Select>
              {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="性别" field="gender" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="male">男</Select.Option>
              <Select.Option value="female">女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="在线" field="online" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
