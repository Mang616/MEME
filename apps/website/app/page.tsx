import { AboutMemeSection } from "@/components/about-meme-section";
import { CtaBanner } from "@/components/cta-banner";
import { JsonLdGraph } from "@/components/json-ld";
import { MemeLandingHero } from "@/components/meme-landing-hero";
import { MemePage, MemeSection } from "@/components/meme-page";
import { RoadmapSection } from "@/components/roadmap-section";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import {
  HOME_CTA_ACTIONS,
  HOME_FAQ,
  HOME_HERO,
  HOME_HERO_ACTIONS,
  HOME_ROADMAP,
  HOME_SERVICES,
  SITE_COPY,
} from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export default function HomePage() {
  return (
    <MemePage>
      <JsonLdGraph
        items={[
          {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_COPY.orgDescription,
          },
          {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_COPY.webSiteDescription,
          },
        ]}
      />

      <MemeLandingHero {...HOME_HERO} actions={HOME_HERO_ACTIONS} />

      <MemeSection id="roadmap">
        <RoadmapSection
          kicker={SITE_COPY.roadmapKicker}
          title={SITE_COPY.roadmapTitle}
          phases={HOME_ROADMAP}
        />
      </MemeSection>

      <MemeSection>
        <SectionHeading
          kicker={SITE_COPY.servicesKicker}
          title={SITE_COPY.servicesTitle}
          tone="meme"
        />
        <div className="card-grid card-grid-3 meme-service-grid">
          {HOME_SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </MemeSection>

      <MemeSection id="about">
        <AboutMemeSection
          title={SITE_COPY.aboutTitle}
          lead={SITE_COPY.aboutLead}
          body={SITE_COPY.aboutBody}
          faq={HOME_FAQ}
        />
      </MemeSection>

      <MemeSection>
        <CtaBanner
          title={SITE_COPY.ctaTitle}
          description={SITE_COPY.ctaDescription}
          actions={HOME_CTA_ACTIONS}
        />
      </MemeSection>

      <SiteFooter />
    </MemePage>
  );
}
