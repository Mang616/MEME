import {
  Button,
  Drawer,
  Empty,
  Input,
  Message,
  Space,
  Spin,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EscortLevelWithLabel } from "@/components/EscortLevelBadge";
import { HandlerOnlineStatus } from "@/components/handlers/HandlerOnlineStatus";
import { AUTO_ASSIGN_LABEL } from "@/constants/orders";
import { ESCORT_LEVEL_DEFS } from "@/constants/escort-level";
import { ServiceTypeTag } from "@/components/ServiceTypeTag";
import { REGION_MAP, SERVICE_TYPE_LABELS } from "@/constants/labels";
import { filterHandlersByServiceType } from "@/lib/handlers-filter";
import { formatClubTag } from "@/lib/club-labels";
import { matchKeyword } from "@/lib/list-filter";
import { ApiError, api, type HandlerRow, type OrderRow } from "@/lib/api";

const DRAWER_WIDTH = 420;

type OrderDispatchDrawerProps = {
  order: OrderRow | null;
  visible: boolean;
  onClose: () => void;
  onAssigned: (updated: OrderRow) => void;
};

function matchHandlerRow(row: HandlerRow, keyword: string) {
  const levelLabel = ESCORT_LEVEL_DEFS[row.level]?.label ?? row.level;
  return matchKeyword(
    [
      row.name,
      row.clubName,
      levelLabel,
      REGION_MAP[row.region],
      SERVICE_TYPE_LABELS[row.serviceType],
      formatClubTag({ name: row.clubName, isOwnClub: row.isOwnClub }),
    ],
    keyword,
  );
}

export function OrderDispatchDrawer({
  order,
  visible,
  onClose,
  onAssigned,
}: OrderDispatchDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [handlers, setHandlers] = useState<HandlerRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const loadHandlers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listDispatchableHandlers();
      setHandlers(data.items);
    } catch {
      Message.error("加载打手列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible || !order) return;
    setKeyword("");
    setSelectedId("");
    void loadHandlers();
  }, [visible, order, loadHandlers]);

  useEffect(() => {
    if (!visible || !order || !handlers.length) return;
    if (order.assignedPlayer && order.assignedPlayer !== AUTO_ASSIGN_LABEL) {
      const matched = handlers.find((handler) => handler.name === order.assignedPlayer);
      if (matched) setSelectedId(matched.id);
    }
  }, [visible, order, handlers]);

  const filteredHandlers = useMemo(
    () =>
      filterHandlersByServiceType(handlers, order?.serviceType).filter((row) =>
        matchHandlerRow(row, keyword),
      ),
    [handlers, keyword, order?.serviceType],
  );

  async function handleAssign() {
    if (!order || !selectedId) {
      Message.warning("请选择打手");
      return;
    }

    setAssigning(true);
    try {
      const updated = await api.assignOrder(order.id, { handlerId: selectedId });
      Message.success(`已派单给 ${updated.servicePlayer}`);
      onAssigned(updated);
      onClose();
    } catch (err) {
      Message.error(err instanceof ApiError ? err.message : "派单失败");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <Drawer
      width={DRAWER_WIDTH}
      title={order ? `派单 · ${order.id}` : "派单"}
      visible={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={assigning} disabled={!selectedId} onClick={() => void handleAssign()}>
            确认派单
          </Button>
        </Space>
      }
      unmountOnExit
    >
      {order ? (
        <div className="order-dispatch-drawer">
          <section className="order-dispatch-drawer__order">
            <Typography.Text bold>{order.productTitle}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: "8px 0 0" }}>
              {order.region} · ¥{order.totalPaid}
            </Typography.Paragraph>
            {order.assignedPlayer !== AUTO_ASSIGN_LABEL ? (
              <Tag color="arcoblue" style={{ marginTop: 8 }}>
                用户指定：{order.assignedPlayer}
              </Tag>
            ) : (
              <Tag style={{ marginTop: 8 }}>系统自动分配</Tag>
            )}
          </section>

          <Input.Search
            allowClear
            placeholder="搜索打手 / 俱乐部 / 等级"
            value={keyword}
            onChange={setKeyword}
            style={{ marginBottom: 12 }}
          />

          <Spin loading={loading} style={{ width: "100%" }}>
            {filteredHandlers.length ? (
              <ul className="order-dispatch-drawer__list">
                {filteredHandlers.map((handler) => {
                  const active = selectedId === handler.id;
                  return (
                    <li key={handler.id}>
                      <button
                        type="button"
                        className={`order-dispatch-drawer__item${active ? " order-dispatch-drawer__item--active" : ""}`}
                        onClick={() => setSelectedId(handler.id)}
                      >
                        <div className="order-dispatch-drawer__item-head">
                          <EscortLevelWithLabel
                            level={handler.level}
                            label={handler.name}
                            size="sm"
                          />
                          <HandlerOnlineStatus online={handler.online} compact />
                        </div>
                        <div className="order-dispatch-drawer__item-meta">
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {formatClubTag(handler)} · {REGION_MAP[handler.region]}
                          </Typography.Text>
                          <ServiceTypeTag serviceType={handler.serviceType} size="small" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty description={loading ? "加载中…" : "没有匹配的打手"} />
            )}
          </Spin>
        </div>
      ) : null}
    </Drawer>
  );
}
