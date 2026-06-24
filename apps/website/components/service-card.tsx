import Image from "next/image";
import type { ServiceCard as ServiceCardData } from "@/lib/content";

export function ServiceCard({ title, badge, description, image }: ServiceCardData) {
  return (
    <article className="card service-card">
      <div className="service-visual">
        <span className="sticker">{badge}</span>
        {image ? <Image src={image} alt="" width={120} height={72} /> : null}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
