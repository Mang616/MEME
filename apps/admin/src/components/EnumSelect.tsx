import { Select } from "@arco-design/web-react";
import type { ReactNode } from "react";

type EnumSelectProps = {
  options: Record<string, string>;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function EnumSelect({ options, placeholder, value, onChange }: EnumSelectProps) {
  return (
    <Select placeholder={placeholder} value={value} onChange={onChange}>
      {Object.entries(options).map(([key, label]) => (
        <Select.Option key={key} value={key}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
}

type EnumSelectFieldProps = {
  options: Record<string, string>;
  placeholder?: string;
};

/** Form.Item 内使用：仅渲染 Select 子节点 */
export function EnumSelectField({ options, placeholder }: EnumSelectFieldProps): ReactNode {
  return <EnumSelect options={options} placeholder={placeholder} />;
}
