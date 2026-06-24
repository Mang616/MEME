import Link from "next/link";
import { CtaBanner } from "@/components/cta-banner";
import { EntryLink } from "@/components/entry-link";
import { FaqList } from "@/components/faq-list";
import { JsonLdGraph } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import { DOWNLOAD_OPTIONS, HOME_FAQ, HOME_FEATURES, HOME_SERVICES, ORDER_CHANNELS } from "@/lib/content";
import { ORDER_SITE_URL, SITE_NAME, SITE_URL } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <JsonLdGraph
        items={[
          {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            description: "陪你玩、陪你聊、陪你上车。",
          },
          {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: "迷因电竞官网，下单网站、下载方式和小程序入口。",
          },
        ]}
      />

      <section className="hero meme-hero">
        <div className="hero-copy">
          <span className="eyebrow">MEME PLAY</span>
          <h1>
            陪你玩
          </h1>
          <p className="hero-lead">
            想玩就来。有人陪你开麦、组队、上车。
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={ORDER_SITE_URL}>去下单</Link>
            <Link className="btn btn-secondary" href="/download">下载方式</Link>
            <Link className="btn btn-ghost" href="/mini-program">小程序</Link>
          </div>
          <div className="compliance">
            <span className="compliance-mark">!</span>
            <span>未成年人禁止下单。</span>
          </div>
        </div>
        <div className="hero-poster" aria-hidden="true">
          <span className="poster-chip">READY?</span>
          <strong>PLAY<br />WITH<br />MEME</strong>
          <span className="poster-pill">NO SOLO TODAY</span>
          <span className="poster-face">M</span>
        </div>
      </section>

      <section className="section section-tight">
        <div className="feature-row">
          {HOME_FEATURES.map((feature) => (
            <div className="feature-pill" key={feature.title}>
              <strong>{feature.title}</strong>
              <span>{feature.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="section">
        <SectionHeading
          kicker="HOW"
          title="怎么玩"
          note="下单，开麦，开始玩。"
        />
        <div className="card-grid card-grid-3">
          {HOME_SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          kicker="ORDER"
          title="怎么下单"
          note="官网只负责带路。真正下单去下单网站，或者进小程序。"
        />
        <div className="order-lane">
          {ORDER_CHANNELS.map((channel) => (
            <EntryLink key={channel.title} variant="ticket" {...channel} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          kicker="DOWNLOAD"
          title="下载方式"
          note="安卓、iPhone、电脑、小程序，都给你入口。"
        />
        <div className="card-grid card-grid-4">
          {DOWNLOAD_OPTIONS.map((option) => (
            <EntryLink key={option.title} variant="tile" {...option} />
          ))}
        </div>
      </section>

      <section className="section">
        <CtaBanner
          title="别一个人玩"
          description="去下单网站，或者微信小程序。"
          actions={[
            { href: ORDER_SITE_URL, label: "去下单" },
            { href: "/mini-program", label: "小程序", variant: "secondary" },
          ]}
        />
      </section>

      <section className="section">
        <SectionHeading kicker="FAQ" title="常见问题" />
        <FaqList items={HOME_FAQ} />
      </section>

      <section className="section">
        <CtaBanner
          title="READY TO PLAY?"
          description="点一下，去找人陪你玩。"
          actions={[
            { href: ORDER_SITE_URL, label: "打开下单站" },
            { href: "/download", label: "下载方式", variant: "secondary" },
          ]}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
