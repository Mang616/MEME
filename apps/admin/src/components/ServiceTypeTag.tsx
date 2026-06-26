import { Tag } from "@arco-design/web-react";
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_TAG_COLORS } from "@/constants/labels";

type ServiceType = keyof typeof SERVICE_TYPE_LABELS;

type ServiceTypeTagProps = {
  serviceType: ServiceType;
  size?: "small" | "default" | "medium" | "large";
};

export function ServiceTypeTag({ serviceType, size = "small" }: ServiceTypeTagProps) {
  return (
    <Tag color={SERVICE_TYPE_TAG_COLORS[serviceType] ?? "gray"} size={size}>
      {SERVICE_TYPE_LABELS[serviceType]}
    </Tag>
  );
}
