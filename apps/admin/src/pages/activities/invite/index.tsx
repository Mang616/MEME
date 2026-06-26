import {
  Button,
  Form,
  Input,
  Message,
  Space,
  Switch,
} from "@arco-design/web-react";
import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { CouponTemplateMultiSelect } from "@/components/CouponTemplateMultiSelect";
import { api } from "@/lib/api";
import { normalizeCouponsPayload, type CouponItem } from "@/lib/coupons";
import {
  INVITE_ACTIVITY_DEFAULTS,
  normalizeInviteActivityPayload,
  type InviteActivityPayload,
} from "@/lib/invite-activity";

export default function InviteActivityPage() {
  const [draft, setDraft] = useState<InviteActivityPayload>(INVITE_ACTIVITY_DEFAULTS);
  const [couponOptions, setCouponOptions] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form] = Form.useForm<InviteActivityPayload>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await api.getInviteActivity();
      const couponsPage = await api.getCoupons();
      const next = normalizeInviteActivityPayload(page.payload);
      setDraft(next);
      form.setFieldsValue(next);
      setCouponOptions(normalizeCouponsPayload(couponsPage.payload).items);
      setDirty(false);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "加载邀请活动配置失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  function patchDraft(patch: Partial<InviteActivityPayload>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      form.setFieldsValue(next);
      return next;
    });
    setDirty(true);
  }

  function patchRewards(patch: Partial<InviteActivityPayload["rewards"]>) {
    patchDraft({ rewards: { ...draft.rewards, ...patch } });
  }

  function patchRules(rules: string[]) {
    patchDraft({ rules });
  }

  async function handleSave() {
    const values = await form.validate();
    const payload = normalizeInviteActivityPayload({
      ...draft,
      ...values,
      rules: draft.rules,
      poster: {
        headline: values.poster?.headline || draft.poster.headline,
        footnote: values.poster?.footnote || draft.poster.footnote,
      },
      rewards: draft.rewards,
    });
    setSaving(true);
    try {
      const page = await api.updateInviteActivity(payload);
      const next = normalizeInviteActivityPayload(page.payload);
      setDraft(next);
      form.setFieldsValue(next);
      setDirty(false);
      Message.success("邀请活动配置已保存");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="邀请活动管理"
      subtitle="配置小程序邀请页文案、规则、海报与首单邀请奖励"
      loading={loading}
      action={
        <Space>
          <Button onClick={() => void load()} disabled={loading || saving}>
            刷新
          </Button>
          <Button type="primary" loading={saving} disabled={!dirty} onClick={() => void handleSave()}>
            保存配置
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={draft} className="invite-activity-form">
        <Form.Item label="活动开关" field="enabled" triggerPropName="checked">
          <Switch
            checked={draft.enabled}
            onChange={(enabled) => patchDraft({ enabled })}
          />
        </Form.Item>

        <Space size={16} style={{ display: "flex", flexWrap: "wrap" }}>
          <Form.Item label="标签" field="tag" style={{ minWidth: 180 }}>
            <Input onChange={(tag) => patchDraft({ tag })} />
          </Form.Item>
          <Form.Item label="CTA 文案" field="cta" style={{ minWidth: 180 }}>
            <Input onChange={(cta) => patchDraft({ cta })} />
          </Form.Item>
          <Form.Item label="导航标签" field="navTag" style={{ minWidth: 180 }}>
            <Input onChange={(navTag) => patchDraft({ navTag })} />
          </Form.Item>
          <Form.Item label="导航标题" field="navTitle" style={{ minWidth: 240 }}>
            <Input onChange={(navTitle) => patchDraft({ navTitle })} />
          </Form.Item>
        </Space>

        <Form.Item label="活动标题" field="title" rules={[{ required: true }]}>
          <Input onChange={(title) => patchDraft({ title })} />
        </Form.Item>
        <Form.Item label="活动副标题" field="subtitle" rules={[{ required: true }]}>
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} onChange={(subtitle) => patchDraft({ subtitle })} />
        </Form.Item>

        <Form.Item label="活动规则（每行一条）">
          <Input.TextArea
            value={draft.rules.join("\n")}
            autoSize={{ minRows: 4, maxRows: 8 }}
            onChange={(value) => patchRules(value.split("\n").map((item) => item.trim()).filter(Boolean))}
          />
        </Form.Item>

        <Form.Item label="海报主标题" field="poster.headline" rules={[{ required: true }]}>
          <Input onChange={(headline) => patchDraft({ poster: { ...draft.poster, headline } })} />
        </Form.Item>
        <Form.Item label="海报底部说明" field="poster.footnote" rules={[{ required: true }]}>
          <Input onChange={(footnote) => patchDraft({ poster: { ...draft.poster, footnote } })} />
        </Form.Item>

        <Form.Item
          label="邀请人奖励券（可多选，被邀请人完成首单后，每成功邀请 1 人发放 1 次）"
        >
          <CouponTemplateMultiSelect
            coupons={couponOptions}
            value={draft.rewards.inviterTemplateIds}
            placeholder="选择邀请人奖励券"
            onChange={(inviterTemplateIds) => patchRewards({ inviterTemplateIds })}
          />
        </Form.Item>

        <Form.Item label="被邀请人奖励券（可多选，完成首单后发放，每人仅 1 次）">
          <CouponTemplateMultiSelect
            coupons={couponOptions}
            value={draft.rewards.inviteeTemplateIds}
            placeholder="选择被邀请人奖励券"
            onChange={(inviteeTemplateIds) => patchRewards({ inviteeTemplateIds })}
          />
        </Form.Item>
      </Form>
    </PageShell>
  );
}
