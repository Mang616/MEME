import { Drawer } from "@arco-design/web-react";
import {
  DrawerTextField,
  VIP_ACTIVITY_DRAWER_WIDTH,
} from "@/components/vip-activity/VipActivityDrawerFields";
import type { VipActivityPayload } from "@/lib/api";

type VipActivityGlobalDrawerProps = {
  visible: boolean;
  draft: Pick<
    VipActivityPayload,
    | "consumeLabel"
    | "promotionRewardText"
    | "maxLevelHint"
    | "upgradeHintTemplate"
    | "sectionTitle"
    | "sectionSubtitleTemplate"
  >;
  onClose: () => void;
  onPatch: (patch: Partial<VipActivityPayload>) => void;
};

export function VipActivityGlobalDrawer({
  visible,
  draft,
  onClose,
  onPatch,
}: VipActivityGlobalDrawerProps) {
  return (
    <Drawer
      width={VIP_ACTIVITY_DRAWER_WIDTH}
      className="vip-activity-drawer"
      title="全局文案"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      <div className="vip-activity-drawer-body">
        <DrawerTextField
          label="消费指标"
          value={draft.consumeLabel}
          onChange={(consumeLabel) => onPatch({ consumeLabel })}
        />
        <DrawerTextField
          label="升级奖励提示"
          value={draft.promotionRewardText}
          onChange={(promotionRewardText) => onPatch({ promotionRewardText })}
        />
        <DrawerTextField
          label="最高等级提示"
          value={draft.maxLevelHint}
          onChange={(maxLevelHint) => onPatch({ maxLevelHint })}
        />
        <DrawerTextField
          label="升级进度模板"
          hint="占位符：{remain} {consumeLabel} {nextTag}"
          value={draft.upgradeHintTemplate}
          onChange={(upgradeHintTemplate) => onPatch({ upgradeHintTemplate })}
        />
        <DrawerTextField
          label="特权标题"
          value={draft.sectionTitle}
          onChange={(sectionTitle) => onPatch({ sectionTitle })}
        />
        <DrawerTextField
          label="特权副标题模板"
          hint="占位符：{levelTag}"
          value={draft.sectionSubtitleTemplate}
          onChange={(sectionSubtitleTemplate) => onPatch({ sectionSubtitleTemplate })}
        />
      </div>
    </Drawer>
  );
}
