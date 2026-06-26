import { Form, Input, Message, Modal } from "@arco-design/web-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { setAdminSession, type AdminSession } from "@/lib/session";

type ProfileSettingsModalProps = {
  visible: boolean;
  session: AdminSession;
  onClose: () => void;
  onUpdated: (session: AdminSession) => void;
};

type FormValues = {
  displayName: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
};

export function ProfileSettingsModal({
  visible,
  session,
  onClose,
  onUpdated,
}: ProfileSettingsModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    form.setFieldsValue({ displayName: session.displayName });
  }, [visible, session.displayName, form]);

  async function handleSubmit(values: FormValues) {
    const nextPassword = values.password?.trim();
    if (nextPassword && nextPassword !== values.confirmPassword?.trim()) {
      Message.error("两次输入的新密码不一致");
      return;
    }

    const body: {
      displayName?: string;
      currentPassword?: string;
      password?: string;
    } = {};

    const displayName = values.displayName.trim();
    if (displayName && displayName !== session.displayName) {
      body.displayName = displayName;
    }
    if (nextPassword) {
      body.currentPassword = values.currentPassword?.trim();
      body.password = nextPassword;
    }

    if (!body.displayName && !body.password) {
      Message.info("没有需要保存的修改");
      return;
    }

    setSaving(true);
    try {
      const result = await api.updateProfile(body);
      const nextSession: AdminSession = {
        username: result.username,
        displayName: result.displayName,
        adminId: result.adminId,
        roles: result.roles,
        permissions: result.permissions,
        handlerId: result.handlerId,
      };
      setAdminSession(nextSession);
      onUpdated(nextSession);
      Message.success("个人设置已保存");
      form.resetFields(["currentPassword", "password", "confirmPassword"]);
      onClose();
    } catch {
      Message.error("保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="个人设置"
      visible={visible}
      okText="保存"
      cancelText="取消"
      confirmLoading={saving}
      onCancel={onClose}
      onOk={() => form.submit()}
      unmountOnExit
    >
      <Form form={form} layout="vertical" onSubmit={handleSubmit}>
        <Form.Item label="登录账号">
          <Input value={session.username} disabled />
        </Form.Item>
        <Form.Item
          label="昵称"
          field="displayName"
          rules={[{ required: true, message: "请输入昵称" }]}
        >
          <Input placeholder="在后台顶部与消息中展示的昵称" maxLength={128} />
        </Form.Item>
        <Form.Item label="新密码" field="password">
          <Input.Password placeholder="不修改请留空" autoComplete="new-password" />
        </Form.Item>
        <Form.Item label="确认新密码" field="confirmPassword">
          <Input.Password placeholder="再次输入新密码" autoComplete="new-password" />
        </Form.Item>
        <Form.Item label="当前密码" field="currentPassword">
          <Input.Password placeholder="修改密码时必填" autoComplete="current-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
