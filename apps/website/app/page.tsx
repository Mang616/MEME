import { CtaBanner } from "@/components/cta-banner";
import { FaqList } from "@/components/faq-list";
import { JsonLdGraph } from "@/components/json-ld";
import { MemeHeroPoster } from "@/components/meme-hero-poster";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import {
  HOME_CTA_ACTIONS,
  HOME_FAQ,
  HOME_FEATURES,
  HOME_HERO_ACTIONS,
  HOME_SERVICES,
  SITE_COPY,
} from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
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

      <PageHero
        variant="meme"
        eyebrow="MEME PLAY"
        title={SITE_COPY.tagline}
        lead={SITE_COPY.heroLead}
        actions={HOME_HERO_ACTIONS}
        poster={<MemeHeroPoster />}
      />

      <PageSection className="section section-tight">
        <div className="feature-row">
          {HOME_FEATURES.map((feature) => (
            <div className="feature-pill" key={feature.title}>
              <strong>{feature.title}</strong>
              <span>{feature.description}</span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="card-grid card-grid-3">
          {HOME_SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </PageSection>

      <PageSection id="about">
        <SectionHeading title={SITE_COPY.aboutTitle} />
        <div className="about-copy">
          <p className="about-lead">{SITE_COPY.aboutLead}</p>
          <p>{SITE_COPY.aboutBody}</p>
        </div>
        <div className="about-faq">
          <FaqList items={HOME_FAQ} />
        </div>
      </PageSection>

      <PageSection>
        <CtaBanner
          title={SITE_COPY.ctaTitle}
          description={SITE_COPY.ctaDescription}
          actions={HOME_CTA_ACTIONS}
        />
      </PageSection>

      <SiteFooter />
    </main>
  );
}
