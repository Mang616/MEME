import { Button, Message, Space } from "@arco-design/web-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VipActivityGlobalDrawer } from "@/components/vip-activity/VipActivityGlobalDrawer";
import { VipActivityLevelDrawer } from "@/components/vip-activity/VipActivityLevelDrawer";
import { VipActivityLevelTable } from "@/components/vip-activity/VipActivityLevelTable";
import { PageShell } from "@/components/PageShell";
import { useVipConfig } from "@/contexts/VipConfigContext";
import { api, type VipActivityPayload } from "@/lib/api";
import {
  normalizeVipActivity,
  patchLevelActivity,
  patchLevelPrivilege,
  prepareVipActivityForSave,
} from "@/lib/vip-activity";

export default function VipActivityPage() {
  const { config: vipConfig, loading: vipLoading, getLevelDef } = useVipConfig();
  const [draft, setDraft] = useState<VipActivityPayload>(() =>
    normalizeVipActivity(undefined, vipConfig.vipMin, vipConfig.vipMax),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [configLevel, setConfigLevel] = useState<number | null>(null);
  const [globalOpen, setGlobalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await api.getVipActivity();
      setDraft(normalizeVipActivity(page.payload, vipConfig.vipMin, vipConfig.vipMax));
      setDirty(false);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "加载 VIP 活动配置失败");
    } finally {
      setLoading(false);
    }
  }, [vipConfig.vipMin, vipConfig.vipMax]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!vipLoading && !dirty) {
      setDraft((prev) => normalizeVipActivity(prev, vipConfig.vipMin, vipConfig.vipMax));
    }
  }, [vipConfig.vipMin, vipConfig.vipMax, vipLoading, dirty]);

  const patchCopy = useCallback((patch: Partial<VipActivityPayload>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const patchLevel = useCallback(
    (level: number, patch: Parameters<typeof patchLevelActivity>[2]) => {
      setDraft((prev) => ({
        ...prev,
        levelList: patchLevelActivity(prev.levelList, level, patch, vipConfig.vipMax),
      }));
      setDirty(true);
    },
    [vipConfig.vipMax],
  );

  const patchPrivilege = useCallback(
    (level: number, privilegeId: string, patch: Parameters<typeof patchLevelPrivilege>[3]) => {
      setDraft((prev) => ({
        ...prev,
        levelList: patchLevelPrivilege(prev.levelList, level, privilegeId, patch),
      }));
      setDirty(true);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const payload = prepareVipActivityForSave(draft, vipConfig.vipMin, vipConfig.vipMax);
    setSaving(true);
    try {
      const page = await api.updateVipActivity(payload);
      setDraft(normalizeVipActivity(page.payload, vipConfig.vipMin, vipConfig.vipMax));
      setDirty(false);
      Message.success("VIP 活动配置已保存");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [draft, vipConfig.vipMin, vipConfig.vipMax]);

  const sortedLevels = useMemo(
    () => [...draft.levelList].sort((a, b) => a.level - b.level),
    [draft.levelList],
  );

  const editingLevel = useMemo(
    () => sortedLevels.find((item) => item.level === configLevel) ?? null,
    [sortedLevels, configLevel],
  );

  return (
    <>
      <PageShell
        title="VIP 活动管理"
        subtitle="列表查看各等级门槛与特权；等级图标与称号来自「VIP 等级配置」"
        loading={loading && !dirty}
        action={
          <Space>
            <Button onClick={() => setGlobalOpen(true)}>全局文案</Button>
            <Button onClick={() => void load()}>重新加载</Button>
            <Button type="primary" loading={saving} disabled={!dirty} onClick={() => void handleSave()}>
              保存配置
            </Button>
          </Space>
        }
      >
        <VipActivityLevelTable
          levels={sortedLevels}
          vipMax={vipConfig.vipMax}
          getLevelDef={getLevelDef}
          onConfigure={setConfigLevel}
        />
      </PageShell>

      <VipActivityLevelDrawer
        visible={configLevel != null && editingLevel != null}
        level={editingLevel}
        vipMax={vipConfig.vipMax}
        getLevelDef={getLevelDef}
        onClose={() => setConfigLevel(null)}
        onPatchLevel={patchLevel}
        onPatchPrivilege={patchPrivilege}
      />

      <VipActivityGlobalDrawer
        visible={globalOpen}
        draft={draft}
        onClose={() => setGlobalOpen(false)}
        onPatch={patchCopy}
      />
    </>
  );
}
