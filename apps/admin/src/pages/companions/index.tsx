import { HandlersManagePage } from "@/components/handlers/HandlersManagePage";

const COMPANION_CONFIG = {
  serviceType: "companion" as const,
  title: "陪玩管理",
  subtitle: "管理陪玩师档案与所属俱乐部，仅启用中的俱乐部可参与派单",
  entityLabel: "陪玩师",
  levelFieldLabel: "陪玩等级",
  createButtonLabel: "新建陪玩师",
};

export default function CompanionsPage() {
  return <HandlersManagePage config={COMPANION_CONFIG} />;
}
