import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { canAccessNav } from "@/config/navigation";
import { resolveDefaultNavPath, resolveNavPath } from "@/config/navigation";
import { hasAnyPermission } from "@/lib/session";

type PermissionGuardProps = {
  children: ReactNode;
};

/** 拦截无权限的直链 URL 访问 */
export function PermissionGuard({ children }: PermissionGuardProps) {
  const location = useLocation();
  const navKey = resolveNavPath(location.pathname).replace(/^\//, "");

  if (!canAccessNav(navKey, hasAnyPermission)) {
    return <Navigate to={resolveDefaultNavPath(hasAnyPermission)} replace />;
  }

  return children;
}
