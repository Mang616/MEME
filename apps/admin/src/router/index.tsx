import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import AdminLayout from "@/layouts/AdminLayout";
import HandlersPage from "@/pages/handlers";
import LoginPage from "@/pages/login";
import OrdersPage from "@/pages/orders";
import ProductsPage from "@/pages/products";

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
      { path: "orders", element: <OrdersPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "handlers", element: <HandlersPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/orders" replace /> },
]);
