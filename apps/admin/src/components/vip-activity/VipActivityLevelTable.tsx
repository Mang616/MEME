import { Button, Table } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useMemo } from "react";
import { VipLevelBadge } from "@/components/VipLevelIcon";
import type { VipLevelActivityItem, VipLevelConfigItem } from "@/lib/api";

type VipActivityLevelTableProps = {
  levels: VipLevelActivityItem[];
  vipMax: number;
  getLevelDef: (level: number) => VipLevelConfigItem;
  onConfigure: (level: number) => void;
};

export function VipActivityLevelTable({
  levels,
  vipMax,
  getLevelDef,
  onConfigure,
}: VipActivityLevelTableProps) {
  const columns: ColumnProps<VipLevelActivityItem>[] = useMemo(
    () => [
      {
        title: "等级",
        width: 140,
        render: (_value, record) => {
          const def = getLevelDef(record.level);
          return <VipLevelBadge def={def} size="sm" />;
        },
      },
      {
        title: "称号",
        width: 88,
        render: (_value, record) => getLevelDef(record.level).title,
      },
      {
        title: "累计消费",
        dataIndex: "cumulativeThreshold",
        width: 120,
        render: (value: number) => `${Number(value).toLocaleString()} 元`,
      },
      {
        title: "升下一级",
        dataIndex: "upgradeTarget",
        width: 120,
        render: (value: number, record) =>
          record.level >= vipMax ? "—" : `${Number(value).toLocaleString()} 元`,
      },
      {
        title: "已解锁特权",
        width: 100,
        render: (_value, record) => {
          const unlocked = record.privilegeRows.filter((row) => row.unlocked).length;
          return `${unlocked}/${record.privilegeRows.length}`;
        },
      },
      {
        title: "操作",
        width: 88,
        fixed: "right",
        render: (_value, record) => (
          <Button type="text" size="small" onClick={() => onConfigure(record.level)}>
            配置
          </Button>
        ),
      },
    ],
    [getLevelDef, onConfigure, vipMax],
  );

  return (
    <Table
      rowKey="level"
      size="small"
      className="vip-config-table"
      columns={columns}
      data={levels}
      pagination={false}
      scroll={{ x: 720 }}
      border={{ wrapper: true, cell: true }}
    />
  );
}

