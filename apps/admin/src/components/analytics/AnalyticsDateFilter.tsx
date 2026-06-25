import { Button, DatePicker, Radio, Space } from "@arco-design/web-react";
import {
  DATE_PRESET_OPTIONS,
  type DatePreset,
  type DateRangeValue,
} from "@/lib/analytics-date";

const { RangePicker } = DatePicker;

type AnalyticsDateFilterProps = {
  value: DateRangeValue;
  onPresetChange: (preset: DatePreset) => void;
  onCustomChange: (from: string, to: string) => void;
  onSearch: () => void;
  loading?: boolean;
};

export function AnalyticsDateFilter({
  value,
  onPresetChange,
  onCustomChange,
  onSearch,
  loading,
}: AnalyticsDateFilterProps) {
  return (
    <div className="analytics-filter">
      <Radio.Group
        type="button"
        value={value.preset}
        onChange={(preset) => onPresetChange(preset as DatePreset)}
      >
        {DATE_PRESET_OPTIONS.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>

      <Space size={12} wrap>
        <RangePicker
          style={{ width: 280 }}
          value={[value.from, value.to]}
          disabled={value.preset !== "custom"}
          onChange={(_dates, dateStrings) => {
            const from = dateStrings?.[0];
            const to = dateStrings?.[1];
            if (!from || !to) return;
            onCustomChange(String(from), String(to));
          }}
        />
        <Button type="primary" loading={loading} onClick={onSearch}>
          查询
        </Button>
      </Space>
    </div>
  );
}
