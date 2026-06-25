import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import AdminLayout from "@/layouts/AdminLayout";
import LoginPage from "@/pages/login";
import { NAV_ITEMS } from "@/config/navigation";

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
      { index: true, element: <Navigate to="/orders" replace /> },
      ...NAV_ITEMS.map((item) => ({
        path: item.path,
        element: <item.element />,
      })),
    ],
  },
  { path: "*", element: <Navigate to="/orders" replace /> },
]);
