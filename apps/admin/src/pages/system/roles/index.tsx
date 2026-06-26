import { Button, Table, Tag, Typography } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminRoleAvatar } from "@/components/AdminRoleAvatar";
import { AdminRoleTag } from "@/components/AdminRoleTag";
import { ListFilterBar } from "@/components/ListFilterBar";
import { PageShell } from "@/components/PageShell";
import { matchKeyword } from "@/lib/list-filter";
import { api, type AdminRoleRow } from "@/lib/api";
import type { AdminRole } from "@/lib/session";

function RoleNameCell({ role, locked }: { role: AdminRole; label: string; locked: boolean }) {
  return (
    <span className="roles-table__name">
      <AdminRoleAvatar role={role} size={28} />
      <AdminRoleTag role={role} />
      {locked ? (
        <Tag color="gold" size="small">
          系统
        </Tag>
      ) : null}
    </span>
  );
}

export default function RolesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminRoleRow[]>([]);
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listAdminRoles();
      setRows(data.items);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      matchKeyword([row.id, row.label, row.description], keyword),
    );
  }, [rows, keyword]);

  function resetFilters() {
    setKeyword("");
  }

  const columns: ColumnProps<AdminRoleRow>[] = [
    {
      title: "角色",
      dataIndex: "label",
      width: 200,
      render: (label: string, record) => (
        <RoleNameCell role={record.id} label={label} locked={record.locked} />
      ),
    },
    {
      title: "标识",
      dataIndex: "id",
      width: 140,
      render: (id: string) => (
        <Typography.Text code style={{ whiteSpace: "nowrap" }}>
          {id}
        </Typography.Text>
      ),
    },
    {
      title: "说明",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "权限数",
      dataIndex: "permissionCount",
      width: 96,
      render: (count: number) => (
        <Tag color="arcoblue" style={{ whiteSpace: "nowrap" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "操作",
      width: 120,
      fixed: "right",
      render: (_value, record) =>
        record.locked ? (
          <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
            不可配置
          </Typography.Text>
        ) : (
          <Button
            type="text"
            size="small"
            style={{ padding: "0 4px" }}
            onClick={() => navigate(`/system/permissions?role=${record.id}`)}
          >
            配置权限
          </Button>
        ),
    },
  ];

  return (
    <PageShell
      title="角色管理"
      subtitle="系统预置超管、运营、客服、打手四类角色；具体权限请在「权限管理」中配置"
      loading={loading}
    >
      <ListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        keywordPlaceholder="搜索角色名称 / 标识 / 说明"
        total={rows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />
      <Table
        rowKey="id"
        columns={columns}
        data={filteredRows}
        pagination={false}
        scroll={{ x: 960 }}
      />
    </PageShell>
  );
}
