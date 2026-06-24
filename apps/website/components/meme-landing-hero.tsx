import Image from "next/image";
import { ActionLinks } from "@/components/action-links";
import type { LinkAction, MemeHeroCopy } from "@/lib/types";
import { ASSETS } from "@/lib/site";

type MemeLandingHeroProps = MemeHeroCopy & {
  actions: LinkAction[];
  /** 是否展示两侧 Pepe 插画 */
  showCharacters?: boolean;
};

type HeroCharacterProps = {
  className: string;
  src: string;
  width: number;
  height: number;
};

function HeroCharacter({ className, src, width, height }: HeroCharacterProps) {
  return (
    <Image
      className={className}
      src={src}
      alt=""
      width={width}
      height={height}
      priority
    />
  );
}

export function MemeLandingHero({
  actions,
  showCharacters = true,
  ...copy
}: MemeLandingHeroProps) {
  return (
    <section className="meme-landing-hero" aria-labelledby="meme-hero-title">
      {showCharacters ? (
        <>
          <HeroCharacter
            className="hero-character hero-character-left hero-character-pepe"
            src={ASSETS.pepeThinking}
            width={296}
            height={300}
          />
          <HeroCharacter
            className="hero-character hero-character-right hero-character-pepe"
            src={ASSETS.pepeHero}
            width={296}
            height={300}
          />
        </>
      ) : null}

      <div className="meme-landing-hero-inner">
        <span className="hero-badge">{copy.eyebrow}</span>
        <h1 className="hero-display" id="meme-hero-title">
          <span className="hero-display-top">{copy.titleTop}</span>
          <span className="hero-display-accent">{copy.titleAccent}</span>
          <span className="hero-display-cn">{copy.titleCn}</span>
        </h1>
        <p className="hero-display-lead">{copy.lead}</p>
        <ActionLinks actions={actions} className="hero-display-actions" />
      </div>
    </section>
  );
}
