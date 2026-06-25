import { Drawer, Typography } from "@arco-design/web-react";
import { VipLevelBadge } from "@/components/VipLevelIcon";
import type { VipLevelActivityItem, VipPrivilegeRow, VipLevelConfigItem } from "@/lib/api";
import {
  DrawerNumberField,
  VIP_ACTIVITY_DRAWER_WIDTH,
} from "@/components/vip-activity/VipActivityDrawerFields";
import { VipActivityPrivilegeEditor } from "@/components/vip-activity/VipActivityPrivilegeEditor";

type VipActivityLevelDrawerProps = {
  visible: boolean;
  level: VipLevelActivityItem | null;
  vipMax: number;
  getLevelDef: (level: number) => VipLevelConfigItem;
  onClose: () => void;
  onPatchLevel: (level: number, patch: Partial<VipLevelActivityItem>) => void;
  onPatchPrivilege: (level: number, privilegeId: string, patch: Partial<VipPrivilegeRow>) => void;
};

export function VipActivityLevelDrawer({
  visible,
  level,
  vipMax,
  getLevelDef,
  onClose,
  onPatchLevel,
  onPatchPrivilege,
}: VipActivityLevelDrawerProps) {
  if (!level) return null;

  const def = getLevelDef(level.level);
  const isMax = level.level >= vipMax;

  return (
    <Drawer
      width={VIP_ACTIVITY_DRAWER_WIDTH}
      className="vip-activity-drawer"
      title={
        <span className="vip-activity-drawer-title">
          <VipLevelBadge def={def} size="sm" />
          <span>
            {def.label} · {def.title}
          </span>
        </span>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      <div className="vip-activity-drawer-body">
        <section className="vip-activity-section">
          <Typography.Title heading={6} className="vip-activity-section__title">
            升级条件
          </Typography.Title>
          <DrawerNumberField
            label="达到该等级累计消费"
            hint="单位：元"
            value={level.cumulativeThreshold}
            onChange={(cumulativeThreshold) =>
              onPatchLevel(level.level, { cumulativeThreshold })
            }
          />
          <Typography.Paragraph type="secondary" className="vip-activity-section__hint">
            {isMax
              ? "当前为最高等级"
              : `升至下一级还需消费 ${level.upgradeTarget.toLocaleString()} 元（随累计门槛自动计算）`}
          </Typography.Paragraph>
        </section>

        <section className="vip-activity-section">
          <Typography.Title heading={6} className="vip-activity-section__title">
            会员特权
          </Typography.Title>
          <VipActivityPrivilegeEditor
            rows={level.privilegeRows}
            onPatch={(privilegeId, patch) => onPatchPrivilege(level.level, privilegeId, patch)}
          />
        </section>
      </div>
    </Drawer>
  );
}
