import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CtaBanner } from "@/components/cta-banner";
import { StepList } from "@/components/step-list";
import { SiteFooter } from "@/components/site-footer";
import { MINI_PROGRAM_STEPS } from "@/lib/content";
import { ASSETS, ORDER_SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "小程序下单",
  description:
    "迷因电竞微信小程序入口：微信里打开，微信里下单。",
  openGraph: {
    title: "微信小程序 | 迷因电竞",
    description: "微信里打开，微信里下单。",
    images: [{ url: ASSETS.logo }],
  },
};

export default function MiniProgramPage() {
  return (
    <main>
      <section className="hero hero-compact">
        <div className="hero-fade" />
        <div className="hero-copy">
          <span className="eyebrow">微信小程序</span>
          <h1>微信里<br />也能下单</h1>
          <p className="hero-lead">
            习惯微信，就走小程序。
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={ORDER_SITE_URL}>打开下单站</Link>
            <Link className="btn btn-secondary" href="/download">下载方式</Link>
            <Link className="btn btn-secondary" href="/">返回首页</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card-grid card-grid-2">
          <div>
            <p className="section-kicker">WECHAT</p>
            <h2 className="section-title">怎么进</h2>
            <StepList steps={MINI_PROGRAM_STEPS} />
          </div>
          <div className="card card-pad-lg card-center">
            <Image
              src={ASSETS.logo}
              alt="迷因电竞"
              width={72}
              height={72}
              className="card-logo"
            />
            <h3 className="card-title">迷因电竞小程序</h3>
            <p className="muted-copy muted-copy-sm">
              微信扫码，直接进入
            </p>
            <div className="qr-placeholder">小程序码</div>
            <p className="muted-copy muted-copy-xs note-spaced">
              也可以在微信里搜索迷因电竞
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <CtaBanner
          title="习惯哪个就用哪个"
          description="网站下单，或者微信小程序。"
          actions={[
            { href: ORDER_SITE_URL, label: "打开下单站" },
            { href: "/download", label: "下载方式", variant: "secondary" },
          ]}
        />
      </section>

      <SiteFooter ctaHref={ORDER_SITE_URL} ctaLabel="打开下单站" />
    </main>
  );
}
