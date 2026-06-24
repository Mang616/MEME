import type { Metadata } from "next";
import { CtaBanner } from "@/components/cta-banner";
import { EntryLink } from "@/components/entry-link";
import { MemeHeroPoster } from "@/components/meme-hero-poster";
import { MiniProgramCard } from "@/components/mini-program-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import {
  DOWNLOAD_OPTIONS,
  ORDER_CTA_ACTIONS,
  ORDER_FEATURES,
  ORDER_PAGE_ACTIONS,
  ORDER_WAYS,
  SITE_COPY,
} from "@/lib/content";
import { ASSETS } from "@/lib/site";

export const metadata: Metadata = {
  title: "去下单",
  description: "迷因电竞下单指引：打开下单网站，或下载应用、使用微信小程序。",
  openGraph: {
    title: "去下单 | 迷因电竞",
    description: "打开下单网站，或下载应用、使用微信小程序。",
    images: [{ url: ASSETS.logo }],
  },
};

export default function OrderPage() {
  return (
    <main>
      <PageHero
        variant="meme"
        eyebrow="ORDER"
        title={SITE_COPY.orderTitle}
        lead={SITE_COPY.orderLead}
        actions={ORDER_PAGE_ACTIONS}
        poster={<MemeHeroPoster chip="ORDER?" lines={["GO", "ORDER", "NOW"]} pill="PICK YOUR WAY" />}
      />

      <PageSection className="section section-tight">
        <div className="feature-row">
          {ORDER_FEATURES.map((feature) => (
            <div className="feature-pill" key={feature.title}>
              <strong>{feature.title}</strong>
              <span>{feature.description}</span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="order-lane">
          {ORDER_WAYS.map((way) => (
            <EntryLink key={way.title} variant="ticket" {...way} />
          ))}
        </div>
      </PageSection>

      <PageSection id="install">
        <SectionHeading title={SITE_COPY.orderInstallTitle} note={SITE_COPY.orderInstallNote} />
        <div className="card-grid card-grid-3">
          {DOWNLOAD_OPTIONS.map((option) => (
            <EntryLink key={option.title} variant="tile" {...option} />
          ))}
        </div>
      </PageSection>

      <PageSection id="wechat">
        <SectionHeading title={SITE_COPY.orderWechatTitle} note={SITE_COPY.orderWechatNote} />
        <MiniProgramCard />
      </PageSection>

      <PageSection>
        <CtaBanner
          title={SITE_COPY.orderCtaTitle}
          description={SITE_COPY.orderCtaDescription}
          actions={ORDER_CTA_ACTIONS}
        />
      </PageSection>

      <SiteFooter />
    </main>
  );
}
