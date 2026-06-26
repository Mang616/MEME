import {
  Button,
  Form,
  Message,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EscortLevelWithLabel } from "@/components/EscortLevelBadge";
import {
  emptyHandlerForm,
  HandlerFormDrawer,
  handlerRowToForm,
  type HandlerFormValues,
} from "@/components/handlers/HandlerFormDrawer";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { ESCORT_LEVELS, ESCORT_LEVEL_MAP } from "@/constants/escort-level";
import { REGION_MAP } from "@/constants/labels";
import { matchBoolFilter, matchKeyword, matchSelect } from "@/lib/list-filter";
import { formatClubTag } from "@/lib/club-labels";
import { ApiError, api, type ClubRow, type HandlerRow } from "@/lib/api";

export type HandlersManageConfig = {
  serviceType: HandlerRow["serviceType"];
  title: string;
  subtitle: string;
  entityLabel: string;
  levelFieldLabel: string;
  createButtonLabel: string;
};

type HandlersManagePageProps = {
  config: HandlersManageConfig;
};

export function HandlersManagePage({ config }: HandlersManagePageProps) {
  const { serviceType, title, subtitle, entityLabel, levelFieldLabel, createButtonLabel } = config;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<HandlerRow[]>([]);
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<HandlerRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState<HandlerRow["level"] | "all">("all");
  const [regionFilter, setRegionFilter] = useState<HandlerRow["region"] | "all">("all");
  const [onlineFilter, setOnlineFilter] = useState<"all" | "yes" | "no">("all");
  const [form] = Form.useForm<HandlerFormValues>();

  const scopedRows = useMemo(
    () => rows.filter((row) => row.serviceType === serviceType),
    [rows, serviceType],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [handlerData, clubData] = await Promise.all([api.listHandlers(), api.listClubs()]);
      setRows(handlerData.items);
      setClubs(clubData.items);
    } catch {
      Message.error(`加载${entityLabel}失败，请确认 API 服务已启动`);
    } finally {
      setLoading(false);
    }
  }, [entityLabel]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return scopedRows.filter((row) => {
      if (!matchSelect(row.level, levelFilter)) return false;
      if (!matchSelect(row.region, regionFilter)) return false;
      if (!matchBoolFilter(row.online, onlineFilter)) return false;
      return matchKeyword(
        [
          row.id,
          row.name,
          row.realName,
          row.adminUsername,
          row.clubName,
          ESCORT_LEVEL_MAP[row.level],
          REGION_MAP[row.region],
        ],
        keyword,
      );
    });
  }, [scopedRows, keyword, levelFilter, regionFilter, onlineFilter]);

  function resetFilters() {
    setKeyword("");
    setLevelFilter("all");
    setRegionFilter("all");
    setOnlineFilter("all");
  }

  function openCreate() {
    setEditing(null);
    form.setFieldsValue(emptyHandlerForm(serviceType));
    setDrawerOpen(true);
  }

  function openEdit(row: HandlerRow) {
    setEditing(row);
    form.setFieldsValue(handlerRowToForm(row));
    setDrawerOpen(true);
  }

  async function handleSave() {
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing) {
        const {
          username: _username,
          password: _password,
          displayName: _displayName,
          ...payload
        } = values;
        const updated = await api.updateHandler(editing.id, { ...payload, serviceType });
        setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        Message.success(`${entityLabel}资料已更新`);
      } else {
        const { username, password, displayName, ...handlerFields } = values;
        const created = await api.createHandlerWithAccount({
          ...handlerFields,
          serviceType,
          username,
          password,
          displayName: displayName.trim() || undefined,
        });
        setRows((prev) => [created, ...prev]);
        Message.success(`${entityLabel}已创建，后台账号 ${created.adminUsername || username} 已开通`);
      }
      setDrawerOpen(false);
    } catch (err) {
      Message.error(err instanceof ApiError ? err.message : editing ? "更新失败" : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteHandler(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      Message.success("已删除");
    } catch {
      Message.error("删除失败");
    }
  }

  async function toggleOnline(row: HandlerRow, online: boolean) {
    try {
      const updated = await api.setHandlerOnline(row.id, online);
      setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      Message.error("更新在线状态失败");
    }
  }

  const columns: ColumnProps<HandlerRow>[] = [
    { title: "ID", dataIndex: "id", width: 80 },
    {
      title: "昵称",
      dataIndex: "name",
      width: 140,
      ellipsis: true,
      render: (name: string, row: HandlerRow) => (
        <EscortLevelWithLabel level={row.level} label={name} size="sm" />
      ),
    },
    {
      title: "所属俱乐部",
      dataIndex: "clubName",
      width: 140,
      render: (_: string, row: HandlerRow) => (
        <Tag color={row.isOwnClub ? "green" : "arcoblue"}>{formatClubTag({ ...row, name: row.clubName })}</Tag>
      ),
    },
    {
      title: "大区",
      dataIndex: "region",
      width: 80,
      render: (region: HandlerRow["region"]) => REGION_MAP[region],
    },
    {
      title: "性别",
      dataIndex: "gender",
      width: 70,
      render: (gender: HandlerRow["gender"]) => (gender === "male" ? "男" : "女"),
    },
    {
      title: "在线",
      dataIndex: "online",
      width: 100,
      render: (online: boolean, row: HandlerRow) => (
        <Switch checked={online} onChange={(checked) => void toggleOnline(row, checked)} />
      ),
    },
    {
      title: "操作",
      width: 140,
      fixed: "right",
      render: (_: unknown, row: HandlerRow) => (
        <Space>
          <Button type="text" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title={`确认删除该${entityLabel}？`} onOk={() => void handleDelete(row.id)}>
            <Button type="text" status="danger" size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      action={
        <Button type="primary" onClick={openCreate}>
          {createButtonLabel}
        </Button>
      }
    >
      <ListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        keywordPlaceholder="搜索 ID / 昵称 / 姓名 / 后台账号 / 俱乐部"
        selects={[
          {
            value: levelFilter,
            onChange: (value) => setLevelFilter(value as HandlerRow["level"] | "all"),
            placeholder: levelFieldLabel,
            width: 120,
            options: [
              { value: "all", label: "全部等级" },
              ...ESCORT_LEVELS.map((level) => ({ value: level, label: ESCORT_LEVEL_MAP[level] })),
            ],
          },
          {
            value: regionFilter,
            onChange: (value) => setRegionFilter(value as HandlerRow["region"] | "all"),
            placeholder: "大区",
            width: 110,
            options: [
              { value: "all", label: "全部大区" },
              ...Object.entries(REGION_MAP).map(([value, label]) => ({ value, label })),
            ],
          },
          {
            value: onlineFilter,
            onChange: (value) => setOnlineFilter(value as "all" | "yes" | "no"),
            placeholder: "在线状态",
            width: 120,
            options: [
              { value: "all", label: "全部在线" },
              { value: "yes", label: "在线" },
              { value: "no", label: "离线" },
            ],
          },
        ]}
        total={scopedRows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />
      <Table
        rowKey="id"
        columns={columns}
        data={filteredRows}
        pagination={DEFAULT_TABLE_PAGINATION}
        scroll={{ x: 1100 }}
      />

      <HandlerFormDrawer
        visible={drawerOpen}
        editing={editing}
        entityLabel={entityLabel}
        levelFieldLabel={levelFieldLabel}
        serviceType={serviceType}
        clubs={clubs}
        saving={saving}
        form={form}
        onClose={() => setDrawerOpen(false)}
        onSave={() => void handleSave()}
      />
    </PageShell>
  );
}
