import type { FeatureItem } from "@/lib/types";

type FeaturePillRowProps = {
  items: readonly FeatureItem[];
};

export function FeaturePillRow({ items }: FeaturePillRowProps) {
  return (
    <div className="feature-row">
      {items.map((item) => (
        <div className="feature-pill" key={item.title}>
          <strong>{item.title}</strong>
          <span>{item.description}</span>
        </div>
      ))}
    </div>
  );
}
