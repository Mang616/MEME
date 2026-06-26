import { Select, Tag } from "@arco-design/web-react";
import type { SelectProps } from "@arco-design/web-react";
import { useMemo } from "react";
import { formatCouponValue, type CouponItem } from "@/lib/coupons";

type CouponTemplateMultiSelectProps = {
  coupons: CouponItem[];
  value: string[];
  onChange: (templateIds: string[]) => void;
  placeholder?: string;
};

function couponDisplayLabel(item: CouponItem) {
  const suffix = item.enabled ? "" : " · 已停用";
  return `${item.name}（${formatCouponValue(item)}）${suffix}`;
}

function couponNameById(coupons: CouponItem[], id: string) {
  const item = coupons.find((row) => row.id === id);
  if (!item) return "已下架优惠券";
  return item.name;
}

export function CouponTemplateMultiSelect({
  coupons,
  value,
  onChange,
  placeholder = "选择优惠券",
}: CouponTemplateMultiSelectProps) {
  const couponMap = useMemo(() => new Map(coupons.map((item) => [item.id, item])), [coupons]);

  const renderTag: SelectProps["renderTag"] = (props) => {
    const { value: tagValue, closable, onClose } = props;
    const id = String(tagValue ?? "");
    const name = couponNameById(coupons, id);
    const item = couponMap.get(id);
    return (
      <Tag
        closable={closable}
        onClose={onClose}
        color={item && !item.enabled ? "gray" : undefined}
        style={{ margin: "2px 6px 2px 0" }}
      >
        {name}
      </Tag>
    );
  };

  return (
    <Select
      mode="multiple"
      allowClear
      showSearch
      placeholder={placeholder}
      value={value}
      onChange={(next) => onChange(next as string[])}
      renderTag={renderTag}
      filterOption={(input, option) => {
        const id = String(option.props.value ?? "");
        const item = couponMap.get(id);
        if (!item) return false;
        const q = input.trim().toLowerCase();
        if (!q) return true;
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }}
    >
      {coupons.map((item) => (
        <Select.Option key={item.id} value={item.id} disabled={!item.enabled}>
          {couponDisplayLabel(item)}
        </Select.Option>
      ))}
    </Select>
  );
}
