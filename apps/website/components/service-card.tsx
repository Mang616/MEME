import Image from "next/image";
import type { ServiceCardData } from "@/lib/types";

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
