import { Form, Input, InputNumber, Message, Modal, Radio, Typography } from "@arco-design/web-react";
import { useEffect, useMemo, useState } from "react";
import { VipLevelWithLabel } from "@/components/VipLevelIcon";
import { api, ApiError, type UserRow } from "@/lib/api";
import { formatMoney } from "@/lib/format-price";

type BalanceMode = "increment" | "decrement" | "set";

type BalanceFormValues = {
  mode: BalanceMode;
  amount: number;
  adminPassword: string;
  remark?: string;
};

type UserBalanceAdjustModalProps = {
  user: UserRow | null;
  visible: boolean;
  onClose: () => void;
  onUpdated: (user: UserRow) => void;
};

const MODE_LABELS: Record<BalanceMode, string> = {
  increment: "增加余额",
  decrement: "减少余额",
  set: "设置为",
};

export function UserBalanceAdjustModal({
  user,
  visible,
  onClose,
  onUpdated,
}: UserBalanceAdjustModalProps) {
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<BalanceFormValues>();

  useEffect(() => {
    if (!visible || !user) return;
    form.setFieldsValue({
      mode: "increment",
      amount: undefined,
      adminPassword: "",
      remark: "",
    });
  }, [visible, user, form]);

  const previewBalance = Form.useWatch("amount", form);
  const previewMode = Form.useWatch("mode", form) as BalanceMode | undefined;

  const nextBalance = useMemo(() => {
    if (!user) return null;
    const amount = Number(previewBalance);
    if (!Number.isFinite(amount) || amount < 0) return null;
    if (previewMode === "set") return amount;
    if (previewMode === "increment") return user.balance + amount;
    if (previewMode === "decrement") return user.balance - amount;
    return null;
  }, [user, previewBalance, previewMode]);

  async function handleSubmit(values: BalanceFormValues) {
    if (!user) return;
    setSaving(true);
    try {
      const result = await api.adjustUserBalance(user.id, {
        mode: values.mode,
        amount: values.amount,
        adminPassword: values.adminPassword.trim(),
        remark: values.remark?.trim() || undefined,
      });
      onUpdated(result);
      Message.success(
        `余额已${MODE_LABELS[values.mode]}：¥${result.previousBalance.toFixed(2)} → ¥${result.balance.toFixed(2)}`,
      );
      onClose();
    } catch (err) {
      Message.error(err instanceof ApiError ? err.message : "余额变更失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="变更余额"
      visible={visible}
      okText="确认变更"
      cancelText="取消"
      confirmLoading={saving}
      onCancel={onClose}
      onOk={() => form.submit()}
      unmountOnExit
      className="user-balance-modal"
    >
      {user ? (
        <Form form={form} layout="vertical" onSubmit={handleSubmit}>
          <div className="user-balance-modal__summary">
            <Typography.Text type="secondary">用户</Typography.Text>
            <VipLevelWithLabel level={user.vipLevel} label={user.nickname} size="sm" />
            <Typography.Text type="secondary">当前余额</Typography.Text>
            <Typography.Text bold>{formatMoney(user.balance)}</Typography.Text>
          </div>

          <Form.Item label="变更方式" field="mode" rules={[{ required: true }]}>
            <Radio.Group type="button">
              <Radio value="increment">增加</Radio>
              <Radio value="decrement">减少</Radio>
              <Radio value="set">设置为</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="金额"
            field="amount"
            rules={[
              { required: true, message: "请输入金额" },
              {
                validator(value, callback) {
                  const num = Number(value);
                  if (!Number.isFinite(num) || num < 0) {
                    callback("金额不能为负数");
                    return;
                  }
                  const mode = form.getFieldValue("mode") as BalanceMode;
                  if (mode !== "set" && num <= 0) {
                    callback("增减金额须大于 0");
                    return;
                  }
                  if (mode === "decrement" && num > user.balance) {
                    callback("减少金额不能大于当前余额");
                    return;
                  }
                  callback();
                },
              },
            ]}
          >
            <InputNumber min={0} precision={2} prefix="¥" style={{ width: "100%" }} />
          </Form.Item>

          {nextBalance !== null ? (
            <div className="user-balance-modal__preview">
              <Typography.Text type="secondary">变更后余额</Typography.Text>
              <Typography.Text
                bold
                style={{ color: nextBalance < 0 ? "#f53f3f" : "var(--color-text-1, #1d2129)" }}
              >
                ¥{nextBalance.toFixed(2)}
              </Typography.Text>
            </div>
          ) : null}

          <Form.Item label="备注（可选）" field="remark">
            <Input.TextArea maxLength={200} showWordLimit placeholder="记录变更原因，便于后续核对" />
          </Form.Item>

          <Form.Item
            label="管理员密码"
            field="adminPassword"
            rules={[{ required: true, message: "请输入您的登录密码以确认操作" }]}
          >
            <Input.Password autoComplete="current-password" placeholder="输入当前登录密码" />
          </Form.Item>
        </Form>
      ) : null}
    </Modal>
  );
}
