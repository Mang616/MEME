import { formatPriceDisplay } from "@/lib/format-price";

type PriceBadgeProps = {
  value: number;
  size?: "sm" | "lg";
  thin?: boolean;
};

export function PriceBadge({ value, size = "sm", thin = false }: PriceBadgeProps) {
  const display = formatPriceDisplay(value);
  return (
    <span
      className={`price-badge price-badge--${size}${thin ? " price-badge--thin" : ""}`}
    >
      <span className="price-badge__inner">
        <span className="price-badge__symbol">¥</span>
        <span className="price-badge__value">{display}</span>
      </span>
    </span>
  );
}
