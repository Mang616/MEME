import { ActionLinks } from "@/components/action-links";
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
      <ActionLinks actions={actions} />
    </div>
  );
}
