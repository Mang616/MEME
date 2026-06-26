import {
  Button,
  Form,
  Input,
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
import { AdminRoleTag } from "@/components/AdminRoleTag";
import { AdminSessionAvatar } from "@/components/AdminSessionAvatar";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { matchBoolFilter, matchKeyword } from "@/lib/list-filter";
import { filterHandlersByServiceType } from "@/lib/handlers-filter";
import { serviceTypeForRoles } from "@/lib/service-provider-ui";
import { isServiceProviderRole } from "@meme/admin-rbac";
import { api, type HandlerRow, type StaffUserRow } from "@/lib/api";
import type { AdminRole } from "@/lib/session";

type StaffFormValues = {
  username: string;
  password: string;
  displayName: string;
  roles: AdminRole[];
  enabled: boolean;
  handlerId?: string;
};

const emptyForm: StaffFormValues = {
  username: "",
  password: "",
  displayName: "",
  roles: ["cs"],
  enabled: true,
};

export default function StaffUsersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StaffUserRow[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ id: string; label: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "yes" | "no">("all");
  const [handlerOptions, setHandlerOptions] = useState<HandlerRow[]>([]);
  const [form] = Form.useForm<StaffFormValues>();
  const watchedRoles = Form.useWatch("roles", form) as AdminRole[] | undefined;
  const showHandlerLink = watchedRoles?.some(isServiceProviderRole) ?? false;
  const providerServiceType = serviceTypeForRoles(watchedRoles ?? []);

  useEffect(() => {
    if (!modalOpen || !showHandlerLink) return;
    void api.listHandlers().then((data) => setHandlerOptions(data.items)).catch(() => {});
  }, [modalOpen, showHandlerLink]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [users, roles] = await Promise.all([api.listStaffUsers(), api.listStaffRoles()]);
      setRows(users.items);
      setRoleOptions(roles.items);
    } catch {
      Message.error("加载后台账号失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (roleFilter !== "all" && !row.roles.includes(roleFilter)) return false;
      if (!matchBoolFilter(row.enabled, enabledFilter)) return false;
      return matchKeyword(
        [row.username, row.displayName, ...row.roleLabels],
        keyword,
      );
    });
  }, [rows, keyword, roleFilter, enabledFilter]);

  function resetFilters() {
    setKeyword("");
    setRoleFilter("all");
    setEnabledFilter("all");
  }

  function openCreate() {
    setEditing(null);
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: StaffUserRow) {
    setEditing(row);
    form.setFieldsValue({
      username: row.username,
      password: "",
      displayName: row.displayName,
      roles: row.roles,
      enabled: row.enabled,
      handlerId: row.handlerId,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateStaffUser(editing.id, {
          displayName: values.displayName,
          roles: values.roles,
          enabled: values.enabled,
          password: values.password || undefined,
          handlerId: values.roles.some(isServiceProviderRole) ? values.handlerId || "" : "",
        });
        setRows((prev) => prev.map((row) => (row.id === editing.id ? updated : row)));
        Message.success("账号已更新");
      } else {
        const created = await api.createStaffUser({
          username: values.username,
          password: values.password,
          displayName: values.displayName,
          roles: values.roles,
          enabled: values.enabled,
          handlerId: values.roles.some(isServiceProviderRole) ? values.handlerId : undefined,
        });
        setRows((prev) => [created, ...prev]);
        Message.success("账号已创建");
      }
      setModalOpen(false);
    } catch {
      Message.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: StaffUserRow) {
    try {
      await api.deleteStaffUser(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      Message.success("已删除");
    } catch {
      Message.error("删除失败");
    }
  }

  const columns: ColumnProps<StaffUserRow>[] = [
    {
      title: "",
      dataIndex: "id",
      width: 52,
      render: (_id, row) => (
        <AdminSessionAvatar
          session={{ roles: row.roles, displayName: row.displayName, username: row.username }}
          size={32}
        />
      ),
    },
    { title: "账号", dataIndex: "username", width: 120 },
    { title: "昵称", dataIndex: "displayName", width: 120 },
    {
      title: "角色",
      dataIndex: "roles",
      render: (roles: StaffUserRow["roles"]) => (
        <Space wrap>
          {roles.map((role) => (
            <AdminRoleTag key={role} role={role} />
          ))}
        </Space>
      ),
    },
    {
      title: "启用",
      dataIndex: "enabled",
      width: 80,
      render: (enabled: boolean) => <Tag color={enabled ? "green" : "gray"}>{enabled ? "是" : "否"}</Tag>,
    },
    { title: "创建时间", dataIndex: "createdAt", width: 180 },
    {
      title: "操作",
      width: 160,
      render: (_value, record) => (
        <Space>
          <Button type="text" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该账号？" onOk={() => void handleDelete(record)}>
            <Button type="text" status="danger" size="small">
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
        title="后台用户管理"
        subtitle="创建与管理后台登录账号，并为账号分配角色（超管 / 运营 / 客服 / 打手）"
        loading={loading}
        action={
          <Button type="primary" onClick={openCreate}>
            新建账号
          </Button>
        }
      >
        <ListFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          keywordPlaceholder="搜索账号 / 显示名"
          selects={[
            {
              value: roleFilter,
              onChange: (value) => setRoleFilter(value as AdminRole | "all"),
              placeholder: "角色",
              width: 130,
              options: [
                { value: "all", label: "全部角色" },
                ...roleOptions.map((role) => ({ value: role.id, label: role.label })),
              ],
            },
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
        title={editing ? "编辑账号" : "新建账号"}
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="登录账号" field="username" rules={[{ required: !editing }]}>
            <Input disabled={Boolean(editing)} placeholder="例如 kefu01" />
          </Form.Item>
          <Form.Item
            label={editing ? "新密码（留空不改）" : "密码"}
            field="password"
            rules={editing ? [] : [{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="至少 6 位" />
          </Form.Item>
          <Form.Item label="昵称" field="displayName" rules={[{ required: true }]}>
            <Input placeholder="例如 客服小王" />
          </Form.Item>
          <Form.Item label="角色" field="roles" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="选择角色">
              {roleOptions.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {showHandlerLink ? (
            <Form.Item
              label="绑定打手档案"
              field="handlerId"
              extra="打手登录后台后将同步该档案的在线状态"
            >
              <Select
                allowClear
                placeholder="选择打手"
                showSearch
                filterOption={(input, option) => {
                  const handler = handlerOptions.find((item) => item.id === option?.value);
                  if (!handler) return false;
                  const haystack = `${handler.name} ${handler.clubName}`.toLowerCase();
                  return haystack.includes(input.trim().toLowerCase());
                }}
              >
                {filterHandlersByServiceType(handlerOptions, providerServiceType).map((handler) => (
                  <Select.Option key={handler.id} value={handler.id}>
                    {handler.name} · {handler.clubName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item label="启用" field="enabled" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
