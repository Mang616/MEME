import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useMemo } from "react";
import { BoolTag } from "@/components/BoolTag";
import { EditDeleteActions } from "@/components/EditDeleteActions";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { BANNER_LINK_TYPE_MAP } from "@/constants/labels";
import { useCrudResource } from "@/hooks/useCrudResource";
import { api, type BannerRow } from "@/lib/api";

type BannerFormValues = Omit<BannerRow, "id">;

const emptyForm: BannerFormValues = {
  title: "",
  subtitle: "",
  image: "",
  bgColor: "#2d4a35",
  linkType: "none",
  linkValue: "",
  sortOrder: 0,
  published: true,
};

export default function BannersPage() {
  const [form] = Form.useForm<BannerFormValues>();
  const linkType = Form.useWatch("linkType", form) as BannerRow["linkType"] | undefined;

  const crud = useCrudResource<BannerRow, BannerFormValues>({
    list: api.listBanners,
    create: api.createBanner,
    update: api.updateBanner,
    remove: api.deleteBanner,
    messages: {
      loadError: "加载 Banner 失败，请确认 API 服务已启动",
      createOk: "Banner 已创建",
      updateOk: "Banner 已更新",
    },
  });

  const columns: ColumnProps<BannerRow>[] = useMemo(
    () => [
      { title: "标题", dataIndex: "title" },
      { title: "副标题", dataIndex: "subtitle", ellipsis: true },
      {
        title: "跳转",
        render: (_value, record) =>
          record.linkType === "none"
            ? "无"
            : `${BANNER_LINK_TYPE_MAP[record.linkType]}：${record.linkValue}`,
      },
      { title: "排序", dataIndex: "sortOrder", width: 80 },
      {
        title: "上架",
        dataIndex: "published",
        width: 80,
        render: (value: boolean) => <BoolTag value={value} />,
      },
      {
        title: "操作",
        width: 160,
        render: (_value, record) => (
          <EditDeleteActions
            onEdit={() => crud.openEdit(form, record, (row) => ({ ...row }))}
            onDelete={() => void crud.handleDelete(record.id)}
          />
        ),
      },
    ],
    [crud, form],
  );

  return (
    <>
      <PageShell
        title="Banner 管理"
        loading={crud.loading}
        action={
          <Button type="primary" onClick={() => crud.openCreate(form, emptyForm)}>
            新建 Banner
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          data={crud.rows}
          pagination={DEFAULT_TABLE_PAGINATION}
        />
      </PageShell>

      <Modal
        title={crud.editing ? "编辑 Banner" : "新建 Banner"}
        visible={crud.modalOpen}
        confirmLoading={crud.saving}
        onOk={() => void crud.handleSave(form)}
        onCancel={() => crud.setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标题" field="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="副标题" field="subtitle">
            <Input />
          </Form.Item>
          <Form.Item label="图片 URL" field="image">
            <Input placeholder="留空则显示纯色占位" />
          </Form.Item>
          <Form.Item label="占位色" field="bgColor">
            <Input placeholder="#2d4a35" />
          </Form.Item>
          <Form.Item label="跳转类型" field="linkType">
            <Select>
              {Object.entries(BANNER_LINK_TYPE_MAP).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {linkType !== "none" ? (
            <Form.Item
              label={linkType === "products" ? "分类 ID（escort / companion）" : "页面路径"}
              field="linkValue"
            >
              <Input
                placeholder={
                  linkType === "products" ? "escort 或 companion" : "/pages/products/index"
                }
              />
            </Form.Item>
          ) : null}
          <Form.Item label="排序" field="sortOrder">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="上架" field="published" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
