import Link from "next/link";
import type { LinkAction } from "@/lib/content";

type CtaBannerProps = {
  title: string;
  description: string;
  actions: LinkAction[];
};

export function CtaBanner({ title, description, actions }: CtaBannerProps) {
  return (
    <div className="promo-banner">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="action-row">
        {actions.map(({ href, label, variant = "primary" }) => (
          <Link key={`${href}-${label}`} className={`btn btn-${variant}`} href={href}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
