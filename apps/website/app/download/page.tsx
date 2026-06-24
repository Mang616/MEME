import type { Metadata } from "next";
import Link from "next/link";
import { EntryLink } from "@/components/entry-link";
import { StepList } from "@/components/step-list";
import { SiteFooter } from "@/components/site-footer";
import { DOWNLOAD_OPTIONS, DOWNLOAD_STEPS } from "@/lib/content";
import { ORDER_SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "下载方式",
  description:
    "迷因电竞下载与入口说明：安卓、iPhone、电脑端、微信小程序。",
  openGraph: {
    title: "下载方式 | 迷因电竞",
    description: "安卓、iPhone、电脑端、微信小程序。",
  },
};

export default function DownloadPage() {
  return (
    <main>
      <section className="hero hero-compact">
        <div className="hero-fade" />
        <div className="hero-copy">
          <span className="eyebrow">DOWNLOAD</span>
          <h1>怎么下单<br />怎么下载</h1>
          <p className="hero-lead">
            安卓、iPhone、电脑端、小程序，选你顺手的。
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={ORDER_SITE_URL}>打开下单站</Link>
            <Link className="btn btn-secondary" href="/mini-program">微信小程序</Link>
            <Link className="btn btn-secondary" href="/">返回首页</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card-grid card-grid-2">
          <div>
            <p className="section-kicker">INSTALL</p>
            <h2 className="section-title">安装步骤</h2>
            <StepList steps={DOWNLOAD_STEPS} />
            <p className="section-note note-spaced">
              打开下单网站后，按设备提示安装。
            </p>
          </div>
          <div className="card card-pad-lg">
            <p className="section-kicker">ORDER</p>
            <h3 className="card-title">下载方案</h3>
            <p className="muted-copy">
              手机、电脑、微信，都能进。
            </p>
            <div className="download-option-list">
              {DOWNLOAD_OPTIONS.map((option) => (
                <EntryLink key={option.title} variant="compact" {...option} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="compliance compliance-narrow">
          <span className="compliance-mark">!</span>
          <span>未成年人禁止下单。</span>
        </div>
      </section>

      <SiteFooter ctaHref={ORDER_SITE_URL} ctaLabel="打开下单站" />
    </main>
  );
}
