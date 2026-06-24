import Link from "next/link";
import type { LinkAction } from "@/lib/content";
import { isExternalHref } from "@/lib/site";

type ActionLinksProps = {
  actions: LinkAction[];
  className?: string;
};

export function ActionLinks({ actions, className = "action-row" }: ActionLinksProps) {
  return (
    <div className={className}>
      {actions.map(({ href, label, variant = "primary" }) => {
        const className = `btn btn-${variant}`;
        if (isExternalHref(href)) {
          return (
            <a key={`${href}-${label}`} className={className} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          );
        }
        return (
          <Link key={`${href}-${label}`} className={className} href={href}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}
