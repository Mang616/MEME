import { Input, Switch } from "@arco-design/web-react";
import type { VipPrivilegeRow } from "@/lib/api";

type VipActivityPrivilegeEditorProps = {
  rows: VipPrivilegeRow[];
  onPatch: (privilegeId: string, patch: Partial<VipPrivilegeRow>) => void;
};

export function VipActivityPrivilegeEditor({ rows, onPatch }: VipActivityPrivilegeEditorProps) {
  return (
    <div className="vip-activity-privilege-grid">
      <div className="vip-activity-privilege-grid__head">
        <span>特权</span>
        <span>展示文案</span>
        <span className="vip-activity-privilege-grid__head-unlock">已解锁</span>
      </div>
      {rows.map((row) => (
        <div key={row.id} className="vip-activity-privilege-grid__row">
          <Input
            size="small"
            className="vip-activity-privilege-grid__name"
            value={row.name}
            onChange={(next) => onPatch(row.id, { name: next })}
          />
          <Input
            size="small"
            className="vip-activity-privilege-grid__value"
            value={row.value}
            onChange={(next) => onPatch(row.id, { value: next })}
          />
          <Switch
            size="small"
            className="vip-activity-privilege-grid__unlock"
            checked={row.unlocked}
            onChange={(checked) => onPatch(row.id, { unlocked: checked })}
          />
        </div>
      ))}
    </div>
  );
}
