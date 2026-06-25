import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListFilterBar } from "@/components/ListFilterBar";
import { PageShell, DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { matchBoolFilter, matchKeyword, matchSelect } from "@/lib/list-filter";
import { api, type ClubRow } from "@/lib/api";

type ClubFormValues = {
  name: string;
  contactName: string;
  contactPhone: string;
  description: string;
  enabled: boolean;
};

const emptyForm: ClubFormValues = {
  name: "",
  contactName: "",
  contactPhone: "",
  description: "",
  enabled: true,
};

export default function ClubsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ClubRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClubRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [kindFilter, setKindFilter] = useState<ClubRow["kind"] | "all">("all");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "yes" | "no">("all");
  const [form] = Form.useForm<ClubFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listClubs();
      setRows(data.items);
    } catch {
      Message.error("加载俱乐部失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchSelect(row.kind, kindFilter)) return false;
      if (!matchBoolFilter(row.enabled, enabledFilter)) return false;
      return matchKeyword(
        [row.id, row.name, row.contactName, row.contactPhone, row.kindLabel],
        keyword,
      );
    });
  }, [rows, keyword, kindFilter, enabledFilter]);

  function resetFilters() {
    setKeyword("");
    setKindFilter("all");
    setEnabledFilter("all");
  }

  function openCreate() {
    setEditing(null);
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: ClubRow) {
    setEditing(row);
    form.setFieldsValue({
      name: row.name,
      contactName: row.contactName,
      contactPhone: row.contactPhone,
      description: row.description,
      enabled: row.enabled,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateClub(editing.id, values);
        setRows((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
        Message.success("俱乐部已更新");
      } else {
        const created = await api.createClub({ ...values, kind: "partner" });
        setRows((prev) => [created, ...prev]);
        Message.success("入驻俱乐部已创建");
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
      await api.deleteClub(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      Message.success("已删除");
    } catch {
      Message.error("删除失败，请确认俱乐部下无打手");
    }
  }

  async function toggleEnabled(row: ClubRow, enabled: boolean) {
    try {
      const updated = await api.setClubEnabled(row.id, enabled);
      setRows((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    } catch {
      Message.error("更新状态失败");
    }
  }

  const columns: ColumnProps<ClubRow>[] = [
    { title: "俱乐部", dataIndex: "name", width: 180 },
    {
      title: "类型",
      dataIndex: "kind",
      width: 120,
      render: (_: ClubRow["kind"], row: ClubRow) => (
        <Tag color={row.isPlatform ? "green" : "arcoblue"}>{row.kindLabel}</Tag>
      ),
    },
    { title: "联系人", dataIndex: "contactName", width: 100 },
    { title: "电话", dataIndex: "contactPhone", width: 130 },
    {
      title: "打手数",
      dataIndex: "handlerCount",
      width: 80,
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: "接单",
      dataIndex: "enabled",
      width: 100,
      render: (enabled: boolean, row: ClubRow) => (
        <Switch
          checked={enabled}
          disabled={row.isPlatform}
          onChange={(checked) => void toggleEnabled(row, checked)}
        />
      ),
    },
    { title: "入驻时间", dataIndex: "joinedAt", width: 170 },
    {
      title: "操作",
      width: 140,
      fixed: "right",
      render: (_: unknown, row: ClubRow) => (
        <Space>
          <Button type="text" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          {!row.isPlatform ? (
            <Popconfirm title="确认删除该俱乐部？" onOk={() => void handleDelete(row.id)}>
              <Button type="text" status="danger" size="small">
                删除
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      title="俱乐部管理"
      subtitle="平台自营与入驻俱乐部；启用后可参与接单派单"
      loading={loading}
      action={
        <Button type="primary" onClick={openCreate}>
          新增入驻俱乐部
        </Button>
      }
    >
      <ListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        keywordPlaceholder="搜索俱乐部 / 联系人 / 电话"
        selects={[
          {
            value: kindFilter,
            onChange: (value) => setKindFilter(value as ClubRow["kind"] | "all"),
            placeholder: "俱乐部类型",
            width: 130,
            options: [
              { value: "all", label: "全部类型" },
              { value: "platform", label: "平台自营" },
              { value: "partner", label: "入驻俱乐部" },
            ],
          },
          {
            value: enabledFilter,
            onChange: (value) => setEnabledFilter(value as "all" | "yes" | "no"),
            placeholder: "接单状态",
            width: 120,
            options: [
              { value: "all", label: "全部状态" },
              { value: "yes", label: "可接单" },
              { value: "no", label: "已停用" },
            ],
          },
        ]}
        total={rows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />
      <Table
        rowKey="id"
        columns={columns}
        data={filteredRows}
        pagination={DEFAULT_TABLE_PAGINATION}
        scroll={{ x: 1100 }}
      />

      <Modal
        title={editing ? `编辑 ${editing.name}` : "新增入驻俱乐部"}
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="俱乐部名称" field="name" rules={[{ required: true }]}>
            <Input placeholder="如 Alpha 电竞俱乐部" />
          </Form.Item>
          <Form.Item label="联系人" field="contactName">
            <Input />
          </Form.Item>
          <Form.Item label="联系电话" field="contactPhone">
            <Input />
          </Form.Item>
          <Form.Item label="简介" field="description">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
          {!editing?.isPlatform ? (
            <Form.Item label="启用接单" field="enabled" triggerPropName="checked">
              <Switch />
            </Form.Item>
          ) : (
            <Typography.Text type="secondary">平台自营俱乐部始终启用</Typography.Text>
          )}
        </Form>
      </Modal>
    </PageShell>
  );
}
