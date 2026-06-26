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
import { IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageUrlField } from "@/components/ImageUrlField";
import { BoolTag } from "@/components/BoolTag";
import { ProductCoverThumb } from "@/components/ProductCoverThumb";
import { ServiceTypeTag } from "@/components/ServiceTypeTag";
import { api, type CategoriesMap, type ProductRow, type ProductTagRow } from "@/lib/api";

type ProductFormValues = {
  title: string;
  serviceType: ProductRow["serviceType"];
  categoryId: string;
  price: number;
  tag: string;
  cover: string;
  coverColor: string;
  limitPerUser: number;
  couponAllowed: boolean;
  published: boolean;
};

type PublishedFilter = "all" | "published" | "draft";

const emptyForm: ProductFormValues = {
  title: "",
  serviceType: "escort",
  categoryId: "",
  price: 0,
  tag: "",
  cover: "",
  coverColor: "#2a3530",
  limitPerUser: 0,
  couponAllowed: true,
  published: true,
};

function matchProductRow(row: ProductRow, keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return [row.id, row.title, row.categoryName, row.tag]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(q));
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoriesMap | null>(null);
  const [productTags, setProductTags] = useState<ProductTagRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<ProductFormValues>();

  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState<"all" | ProductRow["serviceType"]>("all");
  const [filterCategoryId, setFilterCategoryId] = useState("all");
  const [filterPublished, setFilterPublished] = useState<PublishedFilter>("all");

  const serviceType = Form.useWatch("serviceType", form) as ProductRow["serviceType"] | undefined;

  const categoryOptions = useMemo(() => {
    if (!categories || !serviceType) return [];
    return categories[serviceType] ?? [];
  }, [categories, serviceType]);

  const enabledTagOptions = useMemo(
    () => productTags.filter((tag) => tag.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    [productTags],
  );

  const filterCategoryOptions = useMemo(() => {
    if (!categories) return [];
    if (filterType === "escort") return categories.escort;
    if (filterType === "companion") return categories.companion;
    return [
      ...categories.escort.map((item) => ({ ...item, name: `护航 · ${item.name}` })),
      ...categories.companion.map((item) => ({ ...item, name: `陪玩 · ${item.name}` })),
    ];
  }, [categories, filterType]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filterType !== "all" && row.serviceType !== filterType) return false;
      if (filterCategoryId !== "all" && row.categoryId !== filterCategoryId) return false;
      if (filterPublished === "published" && !row.published) return false;
      if (filterPublished === "draft" && row.published) return false;
      return matchProductRow(row, keyword);
    });
  }, [rows, keyword, filterType, filterCategoryId, filterPublished]);

  const loadCategories = useCallback(async () => {
    const cats = await api.listCategories();
    setCategories(cats);
    return cats;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [products, , tags] = await Promise.all([
        api.listProducts(),
        loadCategories(),
        api.listProductTagRows(),
      ]);
      setRows(products.items);
      setProductTags(tags.items);
    } catch {
      Message.error("加载商品失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetFilters() {
    setKeyword("");
    setFilterType("all");
    setFilterCategoryId("all");
    setFilterPublished("all");
  }

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
      cover: row.cover ?? "",
      coverColor: row.coverColor ?? "#2a3530",
      limitPerUser: row.limitPerUser,
      couponAllowed: row.couponAllowed !== false,
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

  async function togglePublished(row: ProductRow, published: boolean) {
    try {
      const updated = await api.updateProduct(row.id, { published });
      setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      Message.error("更新上架状态失败");
    }
  }

  const columns: ColumnProps<ProductRow>[] = [
    { title: "ID", dataIndex: "id", width: 80 },
    {
      title: "广告图",
      dataIndex: "cover",
      width: 80,
      render: (_cover: string, row: ProductRow) => (
        <ProductCoverThumb cover={row.cover} coverColor={row.coverColor} />
      ),
    },
    { title: "商品名", dataIndex: "title", ellipsis: true },
    {
      title: "类型",
      dataIndex: "serviceType",
      width: 100,
      render: (type: ProductRow["serviceType"]) => <ServiceTypeTag serviceType={type} />,
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
      title: "用券",
      dataIndex: "couponAllowed",
      width: 72,
      render: (allowed: boolean) => (
        <BoolTag value={allowed !== false} trueLabel="可用" falseLabel="不可用" />
      ),
    },
    {
      title: "上架",
      dataIndex: "published",
      width: 88,
      render: (published: boolean, row: ProductRow) => (
        <Switch
          checked={published}
          onChange={(checked) => void togglePublished(row, checked)}
        />
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
            护航 / 陪玩商品，含分类、广告图、价格、限购与上下架；分类请在「分类管理」维护
          </Typography.Text>
        </div>
        <Button type="primary" onClick={openCreate}>
          新建商品
        </Button>
      </div>

      <Card bordered={false}>
        <Space wrap style={{ marginBottom: 16, width: "100%" }}>
          <Input
            allowClear
            prefix={<IconSearch />}
            placeholder="搜索 ID / 名称 / 分类 / 标签"
            value={keyword}
            onChange={setKeyword}
            style={{ width: 280 }}
          />
          <Select
            placeholder="类型"
            value={filterType}
            onChange={(value) => {
              setFilterType(value);
              setFilterCategoryId("all");
            }}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="escort">护航</Select.Option>
            <Select.Option value="companion">陪玩</Select.Option>
          </Select>
          <Select
            placeholder="分类"
            value={filterCategoryId}
            onChange={setFilterCategoryId}
            style={{ width: 160 }}
            disabled={filterCategoryOptions.length === 0}
          >
            <Select.Option value="all">全部分类</Select.Option>
            {filterCategoryOptions.map((item) => (
              <Select.Option key={`${item.id}`} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="上架状态"
            value={filterPublished}
            onChange={setFilterPublished}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="published">已上架</Select.Option>
            <Select.Option value="draft">已下架</Select.Option>
          </Select>
          <Button icon={<IconRefresh />} onClick={resetFilters}>
            重置
          </Button>
          <Typography.Text type="secondary" style={{ lineHeight: "32px" }}>
            共 {filteredRows.length} / {rows.length} 条
          </Typography.Text>
        </Space>

        <Spin loading={loading} style={{ width: "100%" }}>
          <Table
            rowKey="id"
            columns={columns}
            data={filteredRows}
            pagination={{ pageSize: 10, showTotal: true }}
            scroll={{ x: 1180 }}
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
        style={{ width: 560 }}
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
            <Select placeholder={categoryOptions.length ? "选择分类" : "请先在分类管理中添加"}>
              {categoryOptions.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="广告图" field="cover">
            <ImageUrlField
              folder="products"
              entityId={editing?.id}
              placeholder="上传商品广告图，留空则显示占位色"
            />
          </Form.Item>
          <Form.Item label="占位色" field="coverColor">
            <Input placeholder="#2a3530" />
          </Form.Item>
          <Form.Item label="价格" field="price" rules={[{ required: true, message: "请输入价格" }]}>
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="标签" field="tag">
            <Select allowClear placeholder="无标签">
              {enabledTagOptions.map((tag) => (
                <Select.Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="每人限购" field="limitPerUser">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="允许使用优惠券"
            field="couponAllowed"
            triggerPropName="checked"
            extra="关闭后，小程序下单页不可选券，服务端也会拒绝用券"
          >
            <Switch />
          </Form.Item>
          <Form.Item label="上架" field="published" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
