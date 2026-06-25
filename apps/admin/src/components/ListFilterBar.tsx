import { Button, Input, Select, Space, Typography } from "@arco-design/web-react";
import { IconRefresh, IconSearch } from "@arco-design/web-react/icon";

export type ListFilterSelectOption = {
  value: string;
  label: string;
};

export type ListFilterSelectConfig = {
  value: string;
  onChange: (value: string) => void;
  options: ListFilterSelectOption[];
  placeholder?: string;
  width?: number;
};

export type ListFilterBarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  keywordPlaceholder?: string;
  keywordWidth?: number;
  selects?: ListFilterSelectConfig[];
  total: number;
  filtered: number;
  onReset: () => void;
};

export function ListFilterBar({
  keyword,
  onKeywordChange,
  keywordPlaceholder = "搜索…",
  keywordWidth = 280,
  selects = [],
  total,
  filtered,
  onReset,
}: ListFilterBarProps) {
  const hasActive =
    keyword.trim() !== "" || selects.some((item) => item.value !== "all" && item.value !== "");

  return (
    <div className="list-filter-bar">
      <Space wrap className="list-filter-bar__controls">
        <Input
          allowClear
          prefix={<IconSearch />}
          placeholder={keywordPlaceholder}
          value={keyword}
          onChange={onKeywordChange}
          style={{ width: keywordWidth }}
        />
        {selects.map((item, index) => (
          <Select
            key={`filter-${index}-${item.placeholder ?? ""}`}
            value={item.value}
            onChange={item.onChange}
            placeholder={item.placeholder}
            style={{ width: item.width ?? 120 }}
          >
            {item.options.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        ))}
        <Button icon={<IconRefresh />} onClick={onReset} disabled={!hasActive}>
          重置
        </Button>
      </Space>
      <Typography.Text type="secondary" className="list-filter-bar__count">
        共 {filtered} / {total} 条
      </Typography.Text>
    </div>
  );
}
