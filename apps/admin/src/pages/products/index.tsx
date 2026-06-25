import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { SERVICE_TYPE_MAP } from "@/constants/labels";
import { api, type CategoriesMap, type ProductRow } from "@/lib/api";

type ProductFormValues = {
  title: string;
  serviceType: ProductRow["serviceType"];
  categoryId: string;
  price: number;
  tag: string;
  limitPerUser: number;
  published: boolean;
};

const emptyForm: ProductFormValues = {
  title: "",
  serviceType: "escort",
  categoryId: "",
  price: 0,
  tag: "",
  limitPerUser: 0,
  published: true,
};

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoriesMap | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<ProductFormValues>();

  const serviceType = Form.useWatch("serviceType", form) as ProductRow["serviceType"] | undefined;

  const categoryOptions = useMemo(() => {
    if (!categories || !serviceType) return [];
    return categories[serviceType] ?? [];
  }, [categories, serviceType]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [products, cats] = await Promise.all([api.listProducts(), api.listCategories()]);
      setRows(products.items);
      setCategories(cats);
    } catch {
      Message.error("加载商品失败，请确认 API 服务已启动");
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

  function openEdit(row: ProductRow) {
    setEditing(row);
    form.setFieldsValue({
      title: row.title,
      serviceType: row.serviceType,
      categoryId: row.categoryId,
      price: row.price,
      tag: row.tag,
      limitPerUser: row.limitPerUser,
      published: row.published,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateProduct(editing.id, values);
        setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        Message.success("商品已更新");
      } else {
        const created = await api.createProduct(values);
        setRows((prev) => [created, ...prev]);
        Message.success("商品已创建");
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
      await api.deleteProduct(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      Message.success("已删除");
    } catch {
      Message.error("删除失败");
    }
  }

  const columns: ColumnProps<ProductRow>[] = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "商品名", dataIndex: "title", ellipsis: true },
    {
      title: "类型",
      dataIndex: "serviceType",
      width: 100,
      render: (type: ProductRow["serviceType"]) => SERVICE_TYPE_MAP[type],
    },
    { title: "分类", dataIndex: "categoryName", width: 120 },
    {
      title: "价格",
      dataIndex: "price",
      width: 100,
      render: (v: number) => `¥${v}`,
    },
    { title: "销量", dataIndex: "sold", width: 90 },
    {
      title: "标签",
      dataIndex: "tag",
      width: 90,
      render: (tag: string) => (tag ? <Tag color="green">{tag}</Tag> : "—"),
    },
    {
      title: "限购",
      dataIndex: "limitPerUser",
      width: 80,
      render: (v: number) => (v > 0 ? `${v} 件/人` : "不限"),
    },
    {
      title: "上架",
      dataIndex: "published",
      width: 80,
      render: (published: boolean) => (
        <Tag color={published ? "green" : "gray"}>{published ? "上架" : "下架"}</Tag>
      ),
    },
    {
      title: "操作",
      width: 140,
      fixed: "right",
      render: (_: unknown, row: ProductRow) => (
        <Space>
          <Button type="text" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该商品？" onOk={() => void handleDelete(row.id)}>
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
            商品管理
          </Typography.Title>
          <Typography.Text type="secondary">
            护航 / 陪玩商品，含分类、价格、限购与上下架
          </Typography.Text>
        </div>
        <Button type="primary" onClick={openCreate}>
          新建商品
        </Button>
      </div>
      <Card bordered={false}>
        <Spin loading={loading} style={{ width: "100%" }}>
          <Table
            rowKey="id"
            columns={columns}
            data={rows}
            pagination={{ pageSize: 10, showTotal: true }}
            scroll={{ x: 1100 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editing ? `编辑商品 ${editing.id}` : "新建商品"}
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="商品名" field="title" rules={[{ required: true, message: "请输入商品名" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="类型" field="serviceType" rules={[{ required: true }]}>
            <Select
              onChange={() => {
                form.setFieldValue("categoryId", "");
              }}
            >
              <Select.Option value="escort">护航</Select.Option>
              <Select.Option value="companion">陪玩</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="分类" field="categoryId" rules={[{ required: true, message: "请选择分类" }]}>
            <Select placeholder="选择分类">
              {categoryOptions.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="价格" field="price" rules={[{ required: true, message: "请输入价格" }]}>
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="标签" field="tag">
            <Input placeholder="推荐 / 新品" />
          </Form.Item>
          <Form.Item label="每人限购" field="limitPerUser">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="上架" field="published" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
