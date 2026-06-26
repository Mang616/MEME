import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageUrlField } from "@/components/ImageUrlField";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { VipLevelWithLabel } from "@/components/VipLevelIcon";
import { UserBalanceAdjustModal } from "@/components/users/UserBalanceAdjustModal";
import { UserDetailDrawer } from "@/components/users/UserDetailDrawer";
import { USER_STATUS_MAP } from "@/constants/labels";
import { useVipConfig } from "@/contexts/VipConfigContext";
import { matchKeyword, matchNumberFilter, matchSelect } from "@/lib/list-filter";
import { api, type UserRow } from "@/lib/api";
import { formatMoney } from "@/lib/format-price";

type UserFormValues = {
  nickname: string;
  phone: string;
  avatar: string;
  status: UserRow["status"];
  inviterId: string;
};

export default function UsersPage() {
  const { levelOptions } = useVipConfig();
  const vipFilterOptions = useMemo(
    () => [
      { value: "all", label: "全部 VIP" },
      ...levelOptions.map((item) => ({
        value: String(item.value),
        label: item.label.split(" · ")[0] ?? item.label,
      })),
    ],
    [levelOptions],
  );
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [balanceUser, setBalanceUser] = useState<UserRow | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserRow["status"] | "all">("all");
  const [vipFilter, setVipFilter] = useState("all");
  const [form] = Form.useForm<UserFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setRows(data.items);
    } catch {
      Message.error("加载用户失败，请确认 API 服务已启动");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchSelect(row.status, statusFilter)) return false;
      if (!matchNumberFilter(row.vipLevel, vipFilter)) return false;
      return matchKeyword([row.id, row.nickname, row.phone], keyword);
    });
  }, [rows, keyword, statusFilter, vipFilter]);

  function resetFilters() {
    setKeyword("");
    setStatusFilter("all");
    setVipFilter("all");
  }

  function openEdit(row: UserRow) {
    setEditing(row);
    form.setFieldsValue({
      nickname: row.nickname,
      phone: row.phone,
      avatar: row.avatar,
      status: row.status,
      inviterId: row.inviterId || "",
    });
    setModalOpen(true);
  }

  function handleUserUpdated(updated: UserRow) {
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  async function handleSave() {
    if (!editing) return;
    const values = await form.validate();
    setSaving(true);
    try {
      const updated = await api.updateUser(editing.id, values);
      handleUserUpdated(updated);
      Message.success("用户资料已更新");
      setModalOpen(false);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "更新失败");
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnProps<UserRow>[] = [
    {
      title: "昵称",
      dataIndex: "nickname",
      width: 200,
      ellipsis: true,
      render: (value: string, record) => (
        <Button
          type="text"
          size="small"
          className="users-table__nickname-btn"
          onClick={() => setDetailUserId(record.id)}
        >
          <VipLevelWithLabel level={record.vipLevel} label={value} size="sm" />
        </Button>
      ),
    },
    {
      title: "累计消费",
      dataIndex: "totalConsume",
      width: 100,
      render: (value: number) => (
        <span className="users-table__cell users-table__money">{formatMoney(value ?? 0)}</span>
      ),
    },
    {
      title: "余额",
      dataIndex: "balance",
      width: 96,
      render: (value: number) => (
        <span className="users-table__cell users-table__money">{formatMoney(value)}</span>
      ),
    },
    {
      title: "邀请码",
      dataIndex: "inviteCode",
      width: 112,
      render: (value: string) => <span className="users-table__cell">{value || "—"}</span>,
    },
    {
      title: "上级",
      dataIndex: "inviterNickname",
      width: 140,
      ellipsis: true,
      render: (_value: string, record: UserRow) => (
        <span className="users-table__cell">{record.inviterNickname || (record.inviterId ? record.inviterId : "—")}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 88,
      render: (value: UserRow["status"]) => {
        const meta = USER_STATUS_MAP[value];
        return (
          <Tag color={meta.color} style={{ whiteSpace: "nowrap" }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: "注册时间",
      dataIndex: "registeredAt",
      width: 168,
      render: (value: string) => <span className="users-table__cell">{value}</span>,
    },
    {
      title: "最近登录",
      dataIndex: "lastLoginAt",
      width: 168,
      render: (value: string) => <span className="users-table__cell">{value || "—"}</span>,
    },
    {
      title: "操作",
      width: 148,
      fixed: "right",
      render: (_value, record) => (
        <Space size={4} className="users-table__actions">
          <Button type="text" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="text" size="small" onClick={() => setBalanceUser(record)}>
            变更余额
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title="用户管理"
        subtitle="点击昵称查看详情；余额变更需验证管理员密码"
        loading={loading}
      >
        <ListFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          keywordPlaceholder="搜索昵称 / 手机号 / ID"
          selects={[
            {
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as UserRow["status"] | "all"),
              placeholder: "账号状态",
              width: 120,
              options: [
                { value: "all", label: "全部状态" },
                ...Object.entries(USER_STATUS_MAP).map(([value, meta]) => ({
                  value,
                  label: meta.label,
                })),
              ],
            },
            {
              value: vipFilter,
              onChange: setVipFilter,
              placeholder: "VIP 等级",
              width: 140,
              options: vipFilterOptions,
            },
          ]}
          total={rows.length}
          filtered={filteredRows.length}
          onReset={resetFilters}
        />
        <Table
          rowKey="id"
          className="users-table"
          columns={columns}
          data={filteredRows}
          pagination={DEFAULT_TABLE_PAGINATION}
          scroll={{ x: 1320 }}
        />
      </PageShell>

      <Modal
        title="编辑用户"
        visible={modalOpen}
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <Form.Item label="昵称" field="nickname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="手机号" field="phone">
            <Input />
          </Form.Item>
          <Form.Item label="头像" field="avatar">
            <ImageUrlField folder="avatars" entityId={editing?.id} />
          </Form.Item>
          <Form.Item label="VIP 等级">
            <VipLevelWithLabel level={editing?.vipLevel ?? 0} label="由累计消费自动计算" size="sm" />
          </Form.Item>
          <Form.Item label="邀请码">
            <Input value={editing?.inviteCode || "—"} disabled />
          </Form.Item>
          <Form.Item label="上级用户 ID" field="inviterId" extra="留空表示无上级">
            <Input placeholder="如 u1" allowClear />
          </Form.Item>
          <Form.Item label="状态" field="status">
            <Select>
              {Object.entries(USER_STATUS_MAP).map(([value, meta]) => (
                <Select.Option key={value} value={value}>
                  {meta.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <UserDetailDrawer
        userId={detailUserId}
        visible={detailUserId != null}
        onClose={() => setDetailUserId(null)}
        onUserUpdated={handleUserUpdated}
      />

      <UserBalanceAdjustModal
        user={balanceUser}
        visible={Boolean(balanceUser)}
        onClose={() => setBalanceUser(null)}
        onUpdated={handleUserUpdated}
      />
    </>
  );
}
