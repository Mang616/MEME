import { Input, Table } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useMemo } from "react";
import { ImageUrlField } from "@/components/ImageUrlField";
import { VipLevelBadge } from "@/components/VipLevelIcon";
import type { VipLevelConfigItem } from "@/lib/api";

type VipLevelEditorTableProps = {
  levels: VipLevelConfigItem[];
  onPatch: (level: number, patch: Partial<VipLevelConfigItem>) => void;
};

export function VipLevelEditorTable({ levels, onPatch }: VipLevelEditorTableProps) {
  const columns: ColumnProps<VipLevelConfigItem>[] = useMemo(
    () => [
      {
        title: "等级",
        dataIndex: "level",
        width: 56,
        fixed: "left",
        render: (value: number) => `VIP${value}`,
      },
      {
        title: "预览",
        width: 100,
        render: (_value, record) => <VipLevelBadge def={record} size="sm" />,
      },
      {
        title: "称号",
        dataIndex: "title",
        width: 88,
        render: (value: string, record) => (
          <Input
            size="mini"
            value={value}
            placeholder="青铜"
            onChange={(next) => onPatch(record.level, { title: next })}
          />
        ),
      },
      {
        title: "标签",
        dataIndex: "label",
        width: 76,
        render: (value: string, record) => (
          <Input
            size="mini"
            value={value}
            placeholder="VIP1"
            onChange={(next) => onPatch(record.level, { label: next })}
          />
        ),
      },
      {
        title: "背景色",
        dataIndex: "bg",
        width: 120,
        render: (value: string, record) => (
          <Input
            size="mini"
            value={value}
            placeholder="#C9A020"
            onChange={(next) => onPatch(record.level, { bg: next })}
          />
        ),
      },
      {
        title: "文字色",
        dataIndex: "color",
        width: 88,
        render: (value: string, record) => (
          <Input
            size="mini"
            value={value}
            placeholder="#C9A020"
            onChange={(next) => onPatch(record.level, { color: next })}
          />
        ),
      },
      {
        title: "图标",
        dataIndex: "icon",
        width: 220,
        render: (value: string, record) => (
          <ImageUrlField
            minimal
            folder="vip-levels"
            entityId={`level-${record.level}`}
            value={value}
            placeholder="COS"
            onChange={(next) => onPatch(record.level, { icon: next })}
          />
        ),
      },
    ],
    [onPatch],
  );

  return (
    <Table
      rowKey="level"
      size="small"
      className="vip-config-table"
      columns={columns}
      data={levels}
      pagination={false}
      scroll={{ x: 880 }}
      border={{ wrapper: true, cell: true }}
    />
  );
}
