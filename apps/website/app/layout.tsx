import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { ASSETS, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 陪你玩`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "迷因电竞 MEME 官网：陪你玩、陪你聊、陪你组队。支持网站下单、下载安装到手机和电脑、微信小程序。",
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
};

export const viewport: Viewport = {
  themeColor: "#d1ffbd",
};

const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('meme-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="site-shell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
