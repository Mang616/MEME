import {
  Button,
  Empty,
  Message,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { PermissionRoleSidebar } from "@/components/PermissionRoleSidebar";
import { RolePermissionEditor } from "@/components/RolePermissionEditor";
import {
  ADMIN_ROLE_LABELS,
  isEditableRole,
  permissionsEqual,
} from "@/constants/admin-rbac";
import { api, type AdminRoleRow, type RolePermissionMatrix } from "@/lib/api";
import {
  clonePermissionMatrix,
  syncMatrixFromResponse,
  type PermissionMatrixState,
} from "@/lib/rbac-ui";
import { hasPermission, type AdminPermission, type AdminRole } from "@/lib/session";

export default function PermissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrixState | null>(null);
  const [saved, setSaved] = useState<PermissionMatrixState | null>(null);
  const [groups, setGroups] = useState<RolePermissionMatrix["groups"]>([]);
  const canWrite = hasPermission("admin_users.write");

  const activeRole = useMemo(() => {
    const fromQuery = searchParams.get("role") as AdminRole | null;
    if (fromQuery && roles.some((row) => row.id === fromQuery)) {
      return fromQuery;
    }
    const firstEditable = roles.find((row) => !row.locked);
    return firstEditable?.id ?? roles[0]?.id ?? null;
  }, [roles, searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roleData, permData] = await Promise.all([
        api.listAdminRoles(),
        api.getRolePermissions(),
      ]);
      setRoles(roleData.items);
      const next = clonePermissionMatrix(permData.matrix);
      setMatrix(next);
      setSaved(next);
      setGroups(permData.groups);
    } catch {
      Message.error("加载权限配置失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isDirty = useMemo(() => {
    if (!matrix || !saved || !activeRole) return false;
    return !permissionsEqual(matrix[activeRole], saved[activeRole]);
  }, [matrix, saved, activeRole]);

  function selectRole(role: AdminRole) {
    setSearchParams({ role }, { replace: true });
  }

  function togglePermission(permission: AdminPermission, checked: boolean) {
    if (!matrix || !activeRole || !canWrite || !isEditableRole(activeRole)) return;
    setMatrix((prev) => {
      if (!prev) return prev;
      const next = new Set(prev[activeRole]);
      if (checked) next.add(permission);
      else next.delete(permission);
      return { ...prev, [activeRole]: [...next] };
    });
  }

  async function applyRoleMatrixUpdate(
    request: () => Promise<RolePermissionMatrix>,
    successMessage: string,
    errorMessage: string,
  ) {
    if (!activeRole || !isEditableRole(activeRole)) return;
    setSaving(true);
    try {
      const data = await request();
      const { matrix: next, roles: updateRoles } = syncMatrixFromResponse(data, activeRole);
      setMatrix(next);
      setSaved(next);
      setRoles(updateRoles);
      Message.success(successMessage);
    } catch {
      Message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function saveActiveRole() {
    if (!matrix || !activeRole) return;
    await applyRoleMatrixUpdate(
      () => api.updateRolePermissions(activeRole, matrix[activeRole]),
      `${ADMIN_ROLE_LABELS[activeRole]} 权限已保存`,
      "保存失败",
    );
  }

  async function resetActiveRole() {
    if (!activeRole) return;
    await applyRoleMatrixUpdate(
      () => api.resetRolePermissions(activeRole),
      `${ADMIN_ROLE_LABELS[activeRole]} 已恢复默认`,
      "恢复失败",
    );
  }

  const activeRow = roles.find((row) => row.id === activeRole);

  return (
    <PageShell
      title="权限管理"
      subtitle="左侧选择角色，右侧勾选该角色可访问的菜单与操作"
      loading={loading}
      action={canWrite ? <Button onClick={() => void load()}>刷新</Button> : <Tag color="gray">只读</Tag>}
    >
      <div className="permission-workspace">
        <PermissionRoleSidebar
          roles={roles}
          activeRole={activeRole}
          matrix={matrix}
          saved={saved}
          onSelect={selectRole}
        />

        <section className="permission-workspace__panel">
          {!activeRole || !matrix || !activeRow ? (
            <div className="permission-workspace__empty">
              <Empty description="请从左侧选择一个角色" />
            </div>
          ) : (
            <>
              <RolePermissionEditor
                role={activeRole}
                roleLabel={activeRow.label}
                locked={activeRow.locked}
                groups={groups}
                permissions={matrix[activeRole]}
                canWrite={canWrite && !activeRow.locked}
                onToggle={togglePermission}
              />

              {!activeRow.locked && canWrite ? (
                <footer className="permission-workspace__footer">
                  <Space>
                    <Button
                      type="primary"
                      loading={saving}
                      disabled={!isDirty}
                      onClick={() => void saveActiveRole()}
                    >
                      保存 {activeRow.label} 权限
                    </Button>
                    <Popconfirm
                      title={`恢复 ${activeRow.label} 的默认权限？`}
                      onOk={() => void resetActiveRole()}
                    >
                      <Button loading={saving}>恢复默认</Button>
                    </Popconfirm>
                  </Space>
                  {isDirty ? (
                    <Typography.Text type="warning">有未保存的修改</Typography.Text>
                  ) : null}
                </footer>
              ) : null}
            </>
          )}
        </section>
      </div>
    </PageShell>
  );
}
