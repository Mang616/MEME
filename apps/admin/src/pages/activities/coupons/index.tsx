import {
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoolTag } from "@/components/BoolTag";
import { EditDeleteActions } from "@/components/EditDeleteActions";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { matchBoolFilter, matchKeyword, matchSelect } from "@/lib/list-filter";
import { api } from "@/lib/api";
import {
  COUPON_DEFAULTS,
  createEmptyCoupon,
  formatCouponValue,
  normalizeCouponsPayload,
  type CouponItem,
  type CouponScope,
  type CouponType,
  type CouponsPayload,
} from "@/lib/coupons";

const TYPE_OPTIONS: { value: CouponType; label: string }[] = [
  { value: "fixed", label: "满减券" },
  { value: "percent", label: "折扣券" },
];

const SCOPE_OPTIONS: { value: CouponScope; label: string }[] = [
  { value: "all", label: "全场通用" },
  { value: "escort", label: "护航专属" },
  { value: "companion", label: "陪玩专属" },
];

type CouponFormValues = Omit<CouponItem, "id"> & { id?: string };

export default function CouponsPage() {
  const [items, setItems] = useState<CouponItem[]>(() => [...COUPON_DEFAULTS.items]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CouponItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "yes" | "no">("all");
  const [typeFilter, setTypeFilter] = useState<CouponType | "all">("all");
  const [form] = Form.useForm<CouponFormValues>();
  const couponType = Form.useWatch("type", form) as CouponType | undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await api.getCoupons();
      setItems(normalizeCouponsPayload(page.payload).items);
      setDirty(false);
    } catch {
      Message.error("加载优惠券配置失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return items.filter((row) => {
      if (!matchBoolFilter(row.enabled, enabledFilter)) return false;
      if (!matchSelect(row.type, typeFilter)) return false;
      return matchKeyword(
        [row.id, row.name, row.description, SCOPE_OPTIONS.find((o) => o.value === row.scope)?.label],
        keyword,
      );
    });
  }, [items, keyword, enabledFilter, typeFilter]);

  function resetFilters() {
    setKeyword("");
    setEnabledFilter("all");
    setTypeFilter("all");
  }

  function openCreate() {
    const nextOrder = items.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1;
    const empty = createEmptyCoupon(nextOrder);
    setEditing(null);
    form.setFieldsValue(empty);
    setModalOpen(true);
  }

  function openEdit(row: CouponItem) {
    setEditing(row);
    form.setFieldsValue({ ...row });
    setModalOpen(true);
  }

  function patchItems(next: CouponItem[]) {
    setItems(next.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)));
    setDirty(true);
  }

  function handleModalSave() {
    void (async () => {
      const values = await form.validate();
      const normalized = normalizeCouponsPayload({
        items: [
          {
            ...values,
            id: editing?.id ?? values.id ?? `cp_${Date.now()}`,
          },
        ],
      }).items[0]!;

      if (editing) {
        patchItems(items.map((row) => (row.id === editing.id ? normalized : row)));
      } else {
        patchItems([...items, normalized]);
      }
      setModalOpen(false);
    })();
  }

  function handleDelete(row: CouponItem) {
    patchItems(items.filter((item) => item.id !== row.id));
  }

  async function handleSaveAll() {
    const payload: CouponsPayload = normalizeCouponsPayload({ items });
    setSaving(true);
    try {
      const page = await api.updateCoupons(payload);
      setItems(normalizeCouponsPayload(page.payload).items);
      setDirty(false);
      Message.success("优惠券配置已保存");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnProps<CouponItem>[] = [
    { title: "名称", dataIndex: "name", width: 140, ellipsis: true },
    {
      title: "类型",
      dataIndex: "type",
      width: 88,
      render: (value: CouponType) => (
        <Tag color={value === "percent" ? "arcoblue" : "green"}>
          {TYPE_OPTIONS.find((o) => o.value === value)?.label}
        </Tag>
      ),
    },
    {
      title: "面值",
      dataIndex: "value",
      width: 88,
      render: (_value, record) => formatCouponValue(record),
    },
    {
      title: "门槛",
      dataIndex: "minSpend",
      width: 88,
      render: (value: number) => (value > 0 ? `满 ¥${value}` : "无门槛"),
    },
    {
      title: "封顶",
      dataIndex: "maxDiscount",
      width: 80,
      render: (value: number, record) =>
        record.type === "percent" ? (value > 0 ? `¥${value}` : "—") : "—",
    },
    {
      title: "有效天数",
      dataIndex: "validDays",
      width: 88,
      render: (value: number) => `${value} 天`,
    },
    {
      title: "范围",
      dataIndex: "scope",
      width: 96,
      render: (value: CouponScope) =>
        SCOPE_OPTIONS.find((o) => o.value === value)?.label ?? value,
    },
    {
      title: "状态",
      dataIndex: "enabled",
      width: 80,
      render: (value: boolean) => <BoolTag value={value} />,
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      width: 64,
    },
    {
      title: "操作",
      width: 120,
      fixed: "right",
      render: (_value, record) => (
        <EditDeleteActions onEdit={() => openEdit(record)} onDelete={() => handleDelete(record)} />
      ),
    },
  ];

  return (
    <>
      <PageShell
        title="优惠券管理"
        subtitle="配置可发放/领取的优惠券模板；用户领券与核销待后续接入"
        loading={loading && !dirty}
        action={
          <Space>
            <Button onClick={() => void load()}>重新加载</Button>
            <Button type="primary" loading={saving} disabled={!dirty} onClick={() => void handleSaveAll()}>
              保存配置
            </Button>
            <Button type="primary" onClick={openCreate}>
              新建优惠券
            </Button>
          </Space>
        }
      >
        <ListFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          keywordPlaceholder="搜索名称 / 说明 / ID"
          selects={[
            {
              value: typeFilter,
              onChange: (value) => setTypeFilter(value as CouponType | "all"),
              placeholder: "类型",
              width: 120,
              options: [{ value: "all", label: "全部类型" }, ...TYPE_OPTIONS],
            },
            {
              value: enabledFilter,
              onChange: (value) => setEnabledFilter(value as "all" | "yes" | "no"),
              placeholder: "状态",
              width: 120,
              options: [
                { value: "all", label: "全部状态" },
                { value: "yes", label: "已启用" },
                { value: "no", label: "已停用" },
              ],
            },
          ]}
          total={items.length}
          filtered={filteredRows.length}
          onReset={resetFilters}
        />
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          data={filteredRows}
          pagination={DEFAULT_TABLE_PAGINATION}
          scroll={{ x: 1100 }}
        />
      </PageShell>

      <Modal
        title={editing ? "编辑优惠券" : "新建优惠券"}
        visible={modalOpen}
        onOk={handleModalSave}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="名称" field="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="如：新人满减券" />
          </Form.Item>
          <Form.Item label="说明" field="description">
            <Input.TextArea placeholder="展示给用户的简短说明" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
          <Form.Item label="类型" field="type" rules={[{ required: true }]}>
            <Select options={TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            label={couponType === "percent" ? "折扣（折）" : "减免金额（元）"}
            field="value"
            rules={[{ required: true, message: "请输入面值" }]}
          >
            <InputNumber min={0} precision={couponType === "percent" ? 1 : 2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="最低消费（元）" field="minSpend">
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          {couponType === "percent" ? (
            <Form.Item label="最高减免（元）" field="maxDiscount" extra="0 表示不限制">
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
          ) : null}
          <Form.Item label="有效天数" field="validDays" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="适用范围" field="scope" rules={[{ required: true }]}>
            <Select options={SCOPE_OPTIONS} />
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
