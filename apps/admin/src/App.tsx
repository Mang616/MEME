import type { ReactNode } from "react";
import { ConfigProvider } from "@arco-design/web-react";
import zhCN from "@arco-design/web-react/es/locale/zh-CN";
import { memeArcoTheme } from "@/theme/arco-theme";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider locale={zhCN} theme={memeArcoTheme}>
      {children}
    </ConfigProvider>
  );
}
