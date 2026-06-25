import type { AdminPermission, AdminRole } from "@meme/admin-rbac";
import type { AdminRoleRow, RolePermissionMatrix } from "@/lib/api";

export type PermissionMatrixState = Record<AdminRole, AdminPermission[]>;

export function clonePermissionMatrix(
  matrix: RolePermissionMatrix["matrix"],
): PermissionMatrixState {
  return Object.fromEntries(
    Object.entries(matrix).map(([role, perms]) => [role, [...perms]]),
  ) as PermissionMatrixState;
}

export function updateRoleCounts(
  roles: AdminRoleRow[],
  matrix: PermissionMatrixState,
  roleId: AdminRole,
) {
  return roles.map((row) =>
    row.id === roleId ? { ...row, permissionCount: matrix[roleId].length } : row,
  );
}

/** 保存/恢复默认后，同步本地矩阵与角色计数 */
export function syncMatrixFromResponse(data: RolePermissionMatrix, roleId: AdminRole) {
  const matrix = clonePermissionMatrix(data.matrix);
  return {
    matrix,
    roles: (prev: AdminRoleRow[]) => updateRoleCounts(prev, matrix, roleId),
  };
}
