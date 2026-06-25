import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { PermissionGuard } from "@/components/PermissionGuard";
import AdminLayout from "@/layouts/AdminLayout";
import LoginPage from "@/pages/login";
import { NAV_ITEMS, resolveDefaultNavPath } from "@/config/navigation";
import { hasAnyPermission } from "@/lib/session";

function DefaultHomeRedirect() {
  return <Navigate to={resolveDefaultNavPath(hasAnyPermission)} replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DefaultHomeRedirect /> },
      { path: "orders/hall", element: <Navigate to="/hall" replace /> },
      ...NAV_ITEMS.map((item) => ({
        path: item.path,
        element: (
          <PermissionGuard>
            <item.element />
          </PermissionGuard>
        ),
      })),
    ],
  },
  { path: "*", element: <DefaultHomeRedirect /> },
]);
