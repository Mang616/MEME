import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_COPY } from "@/lib/content";
import { ASSETS, SITE_NAME, SITE_NAME_SHORT, SITE_URL } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_COPY.tagline}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_COPY.metaDescription,
  keywords: [
    "迷因电竞",
    "MEME",
    "陪玩",
    "陪玩店",
    "组队陪玩",
    "网站下单",
    "客户端下载",
    "小程序下单",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
    images: [{ url: ASSETS.logo }],
  },
  icons: {
    icon: [
      { url: ASSETS.logo, sizes: "96x96", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ASSETS.logo,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME_SHORT,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" data-theme-mode="auto" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <div className="site-shell">
            <SiteHeader />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
