import { Button, InputNumber, Message, Space, Typography } from "@arco-design/web-react";
import { useCallback, useEffect, useState } from "react";
import { VipLevelEditorTable } from "@/components/vip-config/VipLevelEditorTable";
import { PageShell } from "@/components/PageShell";
import { useVipConfig } from "@/contexts/VipConfigContext";
import { api, type VipConfigPayload } from "@/lib/api";
import {
  normalizeVipConfig,
  patchVipLevelList,
  prepareVipConfigForSave,
  syncLevelListToRange,
} from "@/lib/vip-config";

function VipRangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="vip-config-range-field">
      <Typography.Text type="secondary">{label}</Typography.Text>
      <InputNumber min={0} max={99} size="small" value={value} onChange={(v) => onChange(Number(v ?? 0))} />
    </label>
  );
}

export default function VipConfigPage() {
  const { config: savedConfig, loading: contextLoading, refresh, applyConfig } = useVipConfig();
  const [draft, setDraft] = useState<VipConfigPayload>(() => normalizeVipConfig(undefined));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!contextLoading) {
      setDraft(normalizeVipConfig(savedConfig));
      setDirty(false);
    }
  }, [savedConfig, contextLoading]);

  const patchLevel = useCallback((level: number, patch: Parameters<typeof patchVipLevelList>[2]) => {
    setDraft((prev) => ({
      ...prev,
      levelList: patchVipLevelList(prev.levelList, level, patch),
    }));
    setDirty(true);
  }, []);

  const updateRange = useCallback((vipMin: number, vipMax: number) => {
    if (!Number.isFinite(vipMin) || !Number.isFinite(vipMax) || vipMax < vipMin) return;
    setDraft((prev) => ({
      ...prev,
      vipMin,
      vipMax,
      levelList: syncLevelListToRange(prev.levelList, vipMin, vipMax),
    }));
    setDirty(true);
  }, []);

  const handleReload = useCallback(async () => {
    await refresh();
    Message.success("已重新加载 VIP 配置");
  }, [refresh]);

  const handleSave = useCallback(async () => {
    if (draft.vipMax < draft.vipMin) {
      Message.error("最高等级不能小于最低等级");
      return;
    }

    const payload = prepareVipConfigForSave(draft);
    setSaving(true);
    try {
      const page = await api.updateVipConfig(payload);
      const next = normalizeVipConfig(page.payload);
      applyConfig(next);
      setDraft(next);
      setDirty(false);
      Message.success("VIP 配置已保存");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [applyConfig, draft]);

  return (
    <PageShell
      title="VIP 等级配置"
      subtitle="各等级可独立配置称号、标签、背景色、文字色与图标；图标存 COS"
      loading={contextLoading && !dirty}
      action={
        <Space>
          <Button onClick={() => void handleReload()}>重新加载</Button>
          <Button type="primary" loading={saving} disabled={!dirty} onClick={() => void handleSave()}>
            保存配置
          </Button>
        </Space>
      }
    >
      <div className="vip-config-toolbar">
        <Space align="start" size={16} wrap>
          <VipRangeField
            label="最低等级"
            value={draft.vipMin}
            onChange={(vipMin) => updateRange(vipMin, draft.vipMax)}
          />
          <VipRangeField
            label="最高等级"
            value={draft.vipMax}
            onChange={(vipMax) => updateRange(draft.vipMin, vipMax)}
          />
        </Space>
        <Typography.Text type="secondary" className="vip-config-hint">
          用户 VIP 数值在「用户管理」调整；批量上传图标：
          <Typography.Text code>npm run server:upload-vip-icons</Typography.Text>
        </Typography.Text>
      </div>

      <VipLevelEditorTable
        levels={[...draft.levelList].sort((a, b) => a.level - b.level)}
        onPatch={patchLevel}
      />
    </PageShell>
  );
}
