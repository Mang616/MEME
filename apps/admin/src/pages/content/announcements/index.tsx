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
import { ANNOUNCEMENT_PLACEMENT_MAP } from "@/constants/labels";
import { useCrudResource } from "@/hooks/useCrudResource";
import { api, type AnnouncementRow } from "@/lib/api";

type AnnouncementFormValues = Omit<AnnouncementRow, "id">;

const emptyForm: AnnouncementFormValues = {
  title: "",
  content: "",
  placement: "home_bar",
  enabled: true,
  sortOrder: 0,
  startAt: "",
  endAt: "",
};

export default function AnnouncementsPage() {
  const [form] = Form.useForm<AnnouncementFormValues>();

  const crud = useCrudResource<AnnouncementRow, AnnouncementFormValues>({
    list: api.listAnnouncements,
    create: api.createAnnouncement,
    update: api.updateAnnouncement,
    remove: api.deleteAnnouncement,
    messages: {
      loadError: "加载公告失败，请确认 API 服务已启动",
      createOk: "公告已创建",
      updateOk: "公告已更新",
    },
  });

  const columns: ColumnProps<AnnouncementRow>[] = useMemo(
    () => [
      { title: "标题", dataIndex: "title" },
      { title: "内容", dataIndex: "content", ellipsis: true },
      {
        title: "位置",
        dataIndex: "placement",
        width: 120,
        render: (value: AnnouncementRow["placement"]) => ANNOUNCEMENT_PLACEMENT_MAP[value],
      },
      { title: "排序", dataIndex: "sortOrder", width: 80 },
      {
        title: "启用",
        dataIndex: "enabled",
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
        title="公告管理"
        loading={crud.loading}
        action={
          <Button type="primary" onClick={() => crud.openCreate(form, emptyForm)}>
            新建公告
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
        title={crud.editing ? "编辑公告" : "新建公告"}
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
          <Form.Item label="内容" field="content" rules={[{ required: true }]}>
            <Input.TextArea autoSize={{ minRows: 3 }} />
          </Form.Item>
          <Form.Item label="展示位置" field="placement">
            <Select>
              {Object.entries(ANNOUNCEMENT_PLACEMENT_MAP).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="排序" field="sortOrder">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="开始时间"
            field="startAt"
            extra="留空表示立即生效，格式 2026-05-01 00:00:00"
          >
            <Input />
          </Form.Item>
          <Form.Item label="结束时间" field="endAt" extra="留空表示长期有效">
            <Input />
          </Form.Item>
          <Form.Item label="启用" field="enabled" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
