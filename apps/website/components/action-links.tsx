import { SmartLink } from "@/components/smart-link";
import type { LinkAction } from "@/lib/types";

type ActionLinksProps = {
  actions: LinkAction[];
  className?: string;
};

export function ActionLinks({ actions, className = "action-row" }: ActionLinksProps) {
  return (
    <div className={className}>
      {actions.map(({ href, label, variant = "primary" }) => (
        <SmartLink key={`${href}-${label}`} href={href} className={`btn btn-${variant}`}>
          {label}
        </SmartLink>
      ))}
    </div>
  );
}
