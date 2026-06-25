import { HandlersManagePage } from "@/components/handlers/HandlersManagePage";

const ESCORT_CONFIG = {
  serviceType: "escort" as const,
  title: "打手管理",
  subtitle: "管理护航打手档案与所属俱乐部，仅启用中的俱乐部可参与派单",
  entityLabel: "打手",
  levelFieldLabel: "护航等级",
  createButtonLabel: "新建打手",
};

export default function HandlersPage() {
  return <HandlersManagePage config={ESCORT_CONFIG} />;
}
