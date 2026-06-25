import "@/lib/arco-react19";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/App";
import { normalizeStoredToken } from "@/lib/api";
import { router } from "@/router";
import "@arco-design/web-react/dist/css/arco.css";
import "@/styles/global.css";

normalizeStoredToken();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
