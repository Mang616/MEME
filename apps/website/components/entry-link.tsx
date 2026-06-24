import Link from "next/link";
import type { EntryLinkItem } from "@/lib/content";
import { isExternalHref } from "@/lib/site";

type EntryLinkProps = EntryLinkItem & {
  variant: "ticket" | "tile";
};

export function EntryLink({ href, label, title, description, variant }: EntryLinkProps) {
  const className = `entry-link entry-link-${variant}`;
  const body = (
    <>
      <span>{label}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </>
  );

  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {body}
    </Link>
  );
}
