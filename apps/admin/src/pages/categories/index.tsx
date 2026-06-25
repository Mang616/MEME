import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { SERVICE_TYPE_LABELS } from "@/constants/labels";
import { matchKeyword, matchSelect } from "@/lib/list-filter";
import { api, type CategoryRow } from "@/lib/api";

type CategoryFormValues = {
  serviceType: CategoryRow["serviceType"];
  id: string;
  name: string;
};

const emptyForm: CategoryFormValues = {
  serviceType: "escort",
  id: "",
  name: "",
};

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [serviceFilter, setServiceFilter] = useState<CategoryRow["serviceType"] | "all">("all");
  const [form] = Form.useForm<CategoryFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listCategoryRows();
      setRows(data.items);
    } catch {
      Message.error("加载分类失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchSelect(row.serviceType, serviceFilter)) return false;
      return matchKeyword(
        [row.id, row.name, SERVICE_TYPE_LABELS[row.serviceType]],
        keyword,
      );
    });
  }, [rows, keyword, serviceFilter]);

  function resetFilters() {
    setKeyword("");
    setServiceFilter("all");
  }

  function openCreate() {
    setEditing(null);
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: CategoryRow) {
    setEditing(row);
    form.setFieldsValue({
      serviceType: row.serviceType,
      id: row.id,
      name: row.name,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateCategory(editing.serviceType, editing.id, {
          name: values.name,
        });
        setRows((prev) =>
          prev.map((row) =>
            row.serviceType === editing.serviceType && row.id === editing.id ? updated : row,
          ),
        );
        Message.success("分类已更新");
      } else {
        const created = await api.createCategory(values);
        setRows((prev) => [created, ...prev]);
        Message.success("分类已创建");
      }
      setModalOpen(false);
    } catch {
      Message.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: CategoryRow) {
    try {
      await api.deleteCategory(row.serviceType, row.id);
      setRows((prev) =>
        prev.filter((item) => !(item.serviceType === row.serviceType && item.id === row.id)),
      );
      Message.success("已删除");
    } catch {
      Message.error("删除失败，请确认该分类下没有商品");
    }
  }

  const columns: ColumnProps<CategoryRow>[] = [
    {
      title: "类型",
      dataIndex: "serviceType",
      width: 100,
      render: (type: CategoryRow["serviceType"]) => SERVICE_TYPE_LABELS[type],
    },
    { title: "分类 ID", dataIndex: "id", width: 140 },
    { title: "名称", dataIndex: "name" },
    {
      title: "商品数",
      dataIndex: "productCount",
      width: 90,
      render: (count: number) => <Tag color={count > 0 ? "arcoblue" : "gray"}>{count}</Tag>,
    },
    {
      title: "操作",
      width: 160,
      render: (_value, record) => (
        <Space>
          <Button type="text" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该分类？"
            disabled={record.productCount > 0}
            onOk={() => void handleDelete(record)}
          >
            <Button type="text" status="danger" size="small" disabled={record.productCount > 0}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title="分类管理"
        subtitle="护航 / 陪玩商品分类；有商品的分类不可删除"
        loading={loading}
        action={
          <Button type="primary" onClick={openCreate}>
            新建分类
          </Button>
        }
      >
        <ListFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          keywordPlaceholder="搜索分类 ID / 名称"
          selects={[
            {
              value: serviceFilter,
              onChange: (value) => setServiceFilter(value as CategoryRow["serviceType"] | "all"),
              placeholder: "服务类型",
              width: 120,
              options: [
                { value: "all", label: "全部类型" },
                ...Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
              ],
            },
          ]}
          total={rows.length}
          filtered={filteredRows.length}
          onReset={resetFilters}
        />
        <Table
          rowKey={(row) => `${row.serviceType}:${row.id}`}
          columns={columns}
          data={filteredRows}
          pagination={DEFAULT_TABLE_PAGINATION}
        />
      </PageShell>

      <Modal
        title={editing ? "编辑分类" : "新建分类"}
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="类型" field="serviceType" rules={[{ required: true }]}>
            <Select disabled={Boolean(editing)}>
              <Select.Option value="escort">护航</Select.Option>
              <Select.Option value="companion">陪玩</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="分类 ID"
            field="id"
            rules={[{ required: true, message: "请输入分类 ID" }]}
            extra="小写字母开头，仅含字母、数字、下划线与连字符"
          >
            <Input disabled={Boolean(editing)} placeholder="例如 mayday" />
          </Form.Item>
          <Form.Item label="名称" field="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="例如 五一活动" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
