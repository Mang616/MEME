import Image from "next/image";
import { FaqList } from "@/components/faq-list";
import type { FaqItem } from "@/lib/types";
import { ASSETS, SITE_NAME_SHORT } from "@/lib/site";

type AboutMemeSectionProps = {
  title: string;
  lead: string;
  body: string;
  faq: FaqItem[];
};

export function AboutMemeSection({ title, lead, body, faq }: AboutMemeSectionProps) {
  return (
    <div className="about-meme-section">
      <div className="about-meme-copy">
        <p className="about-meme-kicker">ABOUT</p>
        <h2 className="about-meme-title">
          {title}
          <span className="about-meme-script">{SITE_NAME_SHORT}</span>
        </h2>
        <p className="about-meme-lead">{lead}</p>
        <p className="about-meme-body">{body}</p>
      </div>
      <div className="about-meme-visual">
        <div className="about-meme-seal">
          PLAY
          <br />
          WITH
          <br />
          MEME
        </div>
        <Image className="about-meme-logo" src={ASSETS.logo} alt="" width={160} height={160} />
      </div>
      <div className="about-meme-faq">
        <FaqList items={faq} />
      </div>
    </div>
  );
}
