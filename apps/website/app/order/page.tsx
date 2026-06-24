import type { Metadata } from "next";
import { CtaBanner } from "@/components/cta-banner";
import { EntryLink } from "@/components/entry-link";
import { FeaturePillRow } from "@/components/feature-pill-row";
import { MemeLandingHero } from "@/components/meme-landing-hero";
import { MemePage, MemeSection } from "@/components/meme-page";
import { MiniProgramCard } from "@/components/mini-program-card";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import {
  DOWNLOAD_OPTIONS,
  ORDER_CTA_ACTIONS,
  ORDER_FEATURES,
  ORDER_HERO,
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
    <MemePage>
      <MemeLandingHero {...ORDER_HERO} actions={ORDER_PAGE_ACTIONS} showCharacters={false} />

      <MemeSection tight>
        <FeaturePillRow items={ORDER_FEATURES} />
      </MemeSection>

      <MemeSection>
        <div className="order-lane">
          {ORDER_WAYS.map((way) => (
            <EntryLink key={way.title} variant="ticket" {...way} />
          ))}
        </div>
      </MemeSection>

      <MemeSection id="install">
        <SectionHeading title={SITE_COPY.orderInstallTitle} note={SITE_COPY.orderInstallNote} />
        <div className="card-grid card-grid-3">
          {DOWNLOAD_OPTIONS.map((option) => (
            <EntryLink key={option.title} variant="tile" {...option} />
          ))}
        </div>
      </MemeSection>

      <MemeSection id="wechat">
        <SectionHeading title={SITE_COPY.orderWechatTitle} note={SITE_COPY.orderWechatNote} />
        <MiniProgramCard />
      </MemeSection>

      <MemeSection>
        <CtaBanner
          title={SITE_COPY.orderCtaTitle}
          description={SITE_COPY.orderCtaDescription}
          actions={ORDER_CTA_ACTIONS}
        />
      </MemeSection>

      <SiteFooter />
    </MemePage>
  );
}
