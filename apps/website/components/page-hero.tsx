import type { ReactNode } from "react";
import { ActionLinks } from "@/components/action-links";
import type { LinkAction } from "@/lib/content";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  lead: string;
  actions: LinkAction[];
  variant?: "meme" | "compact";
  poster?: ReactNode;
  afterActions?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  variant = "compact",
  poster,
  afterActions,
}: PageHeroProps) {
  const heroClass = variant === "meme" ? "hero meme-hero" : "hero hero-compact";

  return (
    <section className={heroClass}>
      {variant === "compact" ? <div className="hero-fade" aria-hidden="true" /> : null}
      <div className="hero-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p className="hero-lead">{lead}</p>
        <ActionLinks actions={actions} className="hero-actions" />
        {afterActions}
      </div>
      {poster}
    </section>
  );
}
