import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Message,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BASE_ORDER_COLUMNS } from "@/components/OrderTableColumns";
import { DEFAULT_TABLE_PAGINATION } from "@/components/PageShell";
import { VipLevelBadge } from "@/components/VipLevelIcon";
import { UserBalanceAdjustModal } from "@/components/users/UserBalanceAdjustModal";
import { USER_LEDGER_TYPE_MAP } from "@/constants/user-ledger";
import { USER_STATUS_MAP } from "@/constants/labels";
import { useVipConfig } from "@/contexts/VipConfigContext";
import {
  api,
  type OrderRow,
  type UserDetailPayload,
  type UserLedgerEntry,
  type UserRow,
} from "@/lib/api";
import { formatMoney } from "@/lib/format-price";

const DRAWER_WIDTH = "50%";

type UserDetailDrawerProps = {
  userId: string | null;
  visible: boolean;
  onClose: () => void;
  onUserUpdated?: (user: UserRow) => void;
};

export function UserDetailDrawer({
  userId,
  visible,
  onClose,
  onUserUpdated,
}: UserDetailDrawerProps) {
  const { getLevelDef } = useVipConfig();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserRow | null>(null);
  const [ledger, setLedger] = useState<UserLedgerEntry[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [inviter, setInviter] = useState<UserDetailPayload["inviter"]>(null);
  const [balanceOpen, setBalanceOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const detail = await api.getUserDetail(userId);
      setUser(detail.user);
      setLedger(detail.ledger);
      setOrders(detail.orders);
      setInviter(detail.inviter);
    } catch {
      Message.error("加载用户详情失败");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible && userId) {
      void load();
    } else if (!visible) {
      setUser(null);
      setLedger([]);
      setOrders([]);
      setInviter(null);
    }
  }, [visible, userId, load]);

  const ledgerColumns: ColumnProps<UserLedgerEntry>[] = useMemo(
    () => [
      {
        title: "时间",
        dataIndex: "createdAt",
        width: 168,
      },
      {
        title: "类型",
        dataIndex: "type",
        width: 108,
        render: (value: UserLedgerEntry["type"]) => {
          const meta = USER_LEDGER_TYPE_MAP[value] ?? { label: value, color: "gray" };
          return (
            <Tag color={meta.color} style={{ whiteSpace: "nowrap" }}>
              {meta.label}
            </Tag>
          );
        },
      },
      {
        title: "计入消费",
        dataIndex: "consumeAmount",
        width: 96,
        render: (value: number) =>
          value > 0 ? (
            <Typography.Text type="success">+{formatMoney(value)}</Typography.Text>
          ) : (
            "—"
          ),
      },
      {
        title: "余额变动",
        dataIndex: "balanceDelta",
        width: 96,
        render: (value: number) => {
          const prefix = value > 0 ? "+" : "";
          return (
            <Typography.Text type={value >= 0 ? "success" : "error"}>
              {prefix}
              {formatMoney(value)}
            </Typography.Text>
          );
        },
      },
      {
        title: "余额",
        dataIndex: "balanceAfter",
        width: 88,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "累计消费",
        dataIndex: "totalConsumeAfter",
        width: 96,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "备注",
        dataIndex: "remark",
        ellipsis: true,
        render: (value: string, record) => value || record.refId || "—",
      },
    ],
    [],
  );

  const orderColumns = useMemo(() => BASE_ORDER_COLUMNS, []);
  const vipDef = user ? getLevelDef(user.vipLevel) : null;

  return (
    <>
      <Drawer
        width={DRAWER_WIDTH}
        className="user-detail-drawer"
        title={
          user ? (
            <span className="user-detail-drawer__title">
              {vipDef ? <VipLevelBadge def={vipDef} size="sm" /> : null}
              <span>{user.nickname}</span>
              <Typography.Text type="secondary" className="user-detail-drawer__id">
                {user.id}
              </Typography.Text>
            </span>
          ) : (
            "用户详情"
          )
        }
        visible={visible}
        onCancel={onClose}
        footer={null}
        unmountOnExit
      >
        <Spin loading={loading} style={{ width: "100%" }}>
          {user ? (
            <Tabs defaultActiveTab="basic" className="user-detail-drawer__tabs">
              <Tabs.TabPane key="basic" title="基础信息">
                <Descriptions
                  column={1}
                  border
                  size="small"
                  className="user-detail-drawer__desc"
                  data={[
                    { label: "用户 ID", value: user.id },
                    { label: "昵称", value: user.nickname },
                    { label: "手机号", value: user.phone || "—" },
                    {
                      label: "VIP 等级",
                      value: vipDef ? `${vipDef.label} · ${vipDef.title}` : `V${user.vipLevel}`,
                    },
                    { label: "账户余额", value: formatMoney(user.balance) },
                    { label: "累计消费", value: formatMoney(user.totalConsume ?? 0) },
                    { label: "邀请码", value: user.inviteCode || "—" },
                    {
                      label: "上级",
                      value: inviter
                        ? `${inviter.nickname}（${inviter.inviteCode || inviter.id}）`
                        : user.inviterId || "—",
                    },
                    {
                      label: "账号状态",
                      value: (
                        <Tag color={USER_STATUS_MAP[user.status].color}>
                          {USER_STATUS_MAP[user.status].label}
                        </Tag>
                      ),
                    },
                    { label: "注册时间", value: user.registeredAt },
                    { label: "最近登录", value: user.lastLoginAt || "—" },
                  ]}
                />
                <Space style={{ marginTop: 16 }}>
                  <Button type="primary" size="small" onClick={() => setBalanceOpen(true)}>
                    变更余额
                  </Button>
                  <Button size="small" onClick={() => void load()}>
                    刷新
                  </Button>
                </Space>
              </Tabs.TabPane>

              <Tabs.TabPane key="ledger" title={`消费流水 (${ledger.length})`}>
                {ledger.length ? (
                  <Table
                    rowKey="id"
                    size="small"
                    columns={ledgerColumns}
                    data={ledger}
                    pagination={{ ...DEFAULT_TABLE_PAGINATION, pageSize: 10 }}
                    scroll={{ x: 820 }}
                  />
                ) : (
                  <Empty description="暂无流水记录（充值/下单/后台变更后将自动记录）" />
                )}
              </Tabs.TabPane>

              <Tabs.TabPane key="orders" title={`订单 (${orders.length})`}>
                {orders.length ? (
                  <Table
                    rowKey="id"
                    size="small"
                    columns={orderColumns}
                    data={orders}
                    pagination={{ ...DEFAULT_TABLE_PAGINATION, pageSize: 10 }}
                    scroll={{ x: 960 }}
                  />
                ) : (
                  <Empty description="该用户暂无关联订单" />
                )}
              </Tabs.TabPane>
            </Tabs>
          ) : null}
        </Spin>
      </Drawer>

      <UserBalanceAdjustModal
        user={balanceOpen ? user : null}
        visible={balanceOpen}
        onClose={() => setBalanceOpen(false)}
        onUpdated={(updated) => {
          setUser(updated);
          onUserUpdated?.(updated);
          void load();
        }}
      />
    </>
  );
}
