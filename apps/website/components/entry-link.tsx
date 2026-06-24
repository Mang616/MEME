import Link from "next/link";
import type { EntryLinkItem } from "@/lib/content";

type EntryLinkProps = EntryLinkItem & {
  variant: "ticket" | "tile" | "compact";
};

export function EntryLink({ href, label, title, description, variant }: EntryLinkProps) {
  return (
    <Link className={`entry-link entry-link-${variant}`} href={href}>
      <span>{label}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </Link>
  );
}
