import type { ReactNode } from "react";
import { useEffect } from "react";
import { ConfigProvider } from "@arco-design/web-react";
import zhCN from "@arco-design/web-react/es/locale/zh-CN";
import { memeArcoTheme } from "@/theme/arco-theme";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    document.body.removeAttribute("arco-theme");
    document.documentElement.removeAttribute("data-theme");
  }, []);

  return (
    <ConfigProvider locale={zhCN} theme={memeArcoTheme}>
      {children}
    </ConfigProvider>
  );
}
