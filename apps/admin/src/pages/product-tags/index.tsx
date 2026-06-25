import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { PRODUCT_TAG_STYLE_MAP } from "@/constants/labels";
import { matchBoolFilter, matchKeyword } from "@/lib/list-filter";
import { api, type ProductTagRow } from "@/lib/api";

type TagFormValues = {
  id: string;
  name: string;
  style: ProductTagRow["style"];
  sortOrder: number;
  enabled: boolean;
};

const emptyForm: TagFormValues = {
  id: "",
  name: "",
  style: "recommend",
  sortOrder: 0,
  enabled: true,
};

export default function ProductTagsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductTagRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductTagRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "yes" | "no">("all");
  const [form] = Form.useForm<TagFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listProductTagRows();
      setRows(data.items);
    } catch {
      Message.error("加载标签失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchBoolFilter(row.enabled, enabledFilter)) return false;
      return matchKeyword(
        [row.id, row.name, PRODUCT_TAG_STYLE_MAP[row.style]],
        keyword,
      );
    });
  }, [rows, keyword, enabledFilter]);

  function resetFilters() {
    setKeyword("");
    setEnabledFilter("all");
  }

  function openCreate() {
    setEditing(null);
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: ProductTagRow) {
    setEditing(row);
    form.setFieldsValue({
      id: row.id,
      name: row.name,
      style: row.style,
      sortOrder: row.sortOrder,
      enabled: row.enabled,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateProductTag(editing.id, {
          name: values.name,
          style: values.style,
          sortOrder: values.sortOrder,
          enabled: values.enabled,
        });
        setRows((prev) => prev.map((row) => (row.id === editing.id ? updated : row)));
        Message.success("标签已更新");
      } else {
        const created = await api.createProductTag(values);
        setRows((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
        Message.success("标签已创建");
      }
      setModalOpen(false);
    } catch {
      Message.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: ProductTagRow) {
    try {
      await api.deleteProductTag(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      Message.success("已删除");
    } catch {
      Message.error("删除失败，请确认没有商品使用该标签");
    }
  }

  const columns: ColumnProps<ProductTagRow>[] = [
    { title: "标签 ID", dataIndex: "id", width: 120 },
    { title: "名称", dataIndex: "name", width: 120 },
    {
      title: "样式",
      dataIndex: "style",
      width: 110,
      render: (style: ProductTagRow["style"]) => PRODUCT_TAG_STYLE_MAP[style],
    },
    { title: "排序", dataIndex: "sortOrder", width: 80 },
    {
      title: "启用",
      dataIndex: "enabled",
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? "green" : "gray"}>{enabled ? "是" : "否"}</Tag>
      ),
    },
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
            title="确认删除该标签？"
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
        title="标签管理"
        subtitle="商品角标标签（推荐、新品、限购等）；有商品的标签不可删除"
        loading={loading}
        action={
          <Button type="primary" onClick={openCreate}>
            新建标签
          </Button>
        }
      >
        <ListFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          keywordPlaceholder="搜索标签 ID / 名称"
          selects={[
            {
              value: enabledFilter,
              onChange: (value) => setEnabledFilter(value as "all" | "yes" | "no"),
              placeholder: "启用状态",
              width: 120,
              options: [
                { value: "all", label: "全部状态" },
                { value: "yes", label: "已启用" },
                { value: "no", label: "已禁用" },
              ],
            },
          ]}
          total={rows.length}
          filtered={filteredRows.length}
          onReset={resetFilters}
        />
        <Table rowKey="id" columns={columns} data={filteredRows} pagination={DEFAULT_TABLE_PAGINATION} />
      </PageShell>

      <Modal
        title={editing ? "编辑标签" : "新建标签"}
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标签 ID"
            field="id"
            rules={[{ required: true, message: "请输入标签 ID" }]}
            extra="小写字母开头，仅含字母、数字、下划线与连字符"
          >
            <Input disabled={Boolean(editing)} placeholder="例如 limited" />
          </Form.Item>
          <Form.Item label="名称" field="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="例如 限购" />
          </Form.Item>
          <Form.Item label="样式" field="style" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="recommend">{PRODUCT_TAG_STYLE_MAP.recommend}</Select.Option>
              <Select.Option value="new">{PRODUCT_TAG_STYLE_MAP.new}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="排序" field="sortOrder">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="启用" field="enabled" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
