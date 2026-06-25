import { Tag } from "@arco-design/web-react";

type BoolTagProps = {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: string;
  falseColor?: string;
};

export function BoolTag({
  value,
  trueLabel = "是",
  falseLabel = "否",
  trueColor = "green",
  falseColor = "gray",
}: BoolTagProps) {
  return <Tag color={value ? trueColor : falseColor}>{value ? trueLabel : falseLabel}</Tag>;
}
