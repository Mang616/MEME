import { SmartLink } from "@/components/smart-link";
import type { EntryLinkItem } from "@/lib/types";

type EntryLinkProps = EntryLinkItem & {
  variant: "ticket" | "tile";
};

export function EntryLink({ href, label, title, description, variant }: EntryLinkProps) {
  const linkClass = `entry-link entry-link-${variant}`;

  return (
    <SmartLink href={href} className={linkClass}>
      <span>{label}</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </SmartLink>
  );
}
