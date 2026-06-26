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
  REGISTER_ACTIVITY_DEFAULTS,
  normalizeRegisterActivityPayload,
  type RegisterActivityPayload,
} from "@/lib/register-activity";

export default function RegisterActivityPage() {
  const [draft, setDraft] = useState<RegisterActivityPayload>(REGISTER_ACTIVITY_DEFAULTS);
  const [couponOptions, setCouponOptions] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form] = Form.useForm<RegisterActivityPayload>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await api.getRegisterActivity();
      const couponsPage = await api.getCoupons();
      const next = normalizeRegisterActivityPayload(page.payload);
      setDraft(next);
      form.setFieldsValue(next);
      setCouponOptions(normalizeCouponsPayload(couponsPage.payload).items);
      setDirty(false);
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "加载注册活动配置失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  function patchDraft(patch: Partial<RegisterActivityPayload>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      form.setFieldsValue(next);
      return next;
    });
    setDirty(true);
  }

  async function handleSave() {
    const values = await form.validate();
    const payload = normalizeRegisterActivityPayload({
      ...draft,
      ...values,
      templateIds: draft.templateIds,
    });
    setSaving(true);
    try {
      const page = await api.updateRegisterActivity(payload);
      const next = normalizeRegisterActivityPayload(page.payload);
      setDraft(next);
      form.setFieldsValue(next);
      setDirty(false);
      Message.success("注册活动配置已保存");
    } catch (err) {
      Message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="注册活动管理"
      subtitle="配置新用户注册成功后自动发放的优惠券"
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
      <Form form={form} layout="vertical" initialValues={draft}>
        <Form.Item label="活动开关" field="enabled" triggerPropName="checked">
          <Switch checked={draft.enabled} onChange={(enabled) => patchDraft({ enabled })} />
        </Form.Item>

        <Form.Item label="活动标题" field="title" rules={[{ required: true }]}>
          <Input onChange={(title) => patchDraft({ title })} />
        </Form.Item>
        <Form.Item label="活动说明" field="subtitle" rules={[{ required: true }]}>
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={(subtitle) => patchDraft({ subtitle })}
          />
        </Form.Item>

        <Form.Item label="注册奖励券（可多选，新用户注册成功后发放）">
          <CouponTemplateMultiSelect
            coupons={couponOptions}
            value={draft.templateIds}
            placeholder="选择注册奖励券"
            onChange={(templateIds) => patchDraft({ templateIds })}
          />
        </Form.Item>
      </Form>
    </PageShell>
  );
}
