import type { ReactNode } from "react";
import { Input, InputNumber, Typography } from "@arco-design/web-react";

type DrawerFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function DrawerField({ label, hint, children }: DrawerFieldProps) {
  return (
    <div className="vip-activity-form-row">
      <div className="vip-activity-form-row__label-wrap">
        <Typography.Text className="vip-activity-form-row__label">{label}</Typography.Text>
        {hint ? (
          <Typography.Text type="secondary" className="vip-activity-form-row__hint">
            {hint}
          </Typography.Text>
        ) : null}
      </div>
      <div className="vip-activity-form-row__control">{children}</div>
    </div>
  );
}

export function DrawerTextField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <DrawerField label={label} hint={hint}>
      <Input size="small" value={value} onChange={onChange} />
    </DrawerField>
  );
}

export function DrawerNumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <DrawerField label={label} hint={hint}>
      <InputNumber size="small" min={0} value={value} onChange={(next) => onChange(Number(next ?? 0))} />
    </DrawerField>
  );
}

/** VIP 活动抽屉宽度（视口 50%，小屏不低于 520px） */
export const VIP_ACTIVITY_DRAWER_WIDTH = "50%";
