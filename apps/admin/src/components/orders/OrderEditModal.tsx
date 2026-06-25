import { Form, Input, Message, Modal, Select } from "@arco-design/web-react";
import type { FormInstance } from "@arco-design/web-react";
import { useCallback, useState } from "react";
import { ORDER_STATUS_MAP } from "@/constants/labels";
import { api, type OrderRow, type OrderStatus } from "@/lib/api";

const EMPTY_SERVICE_PLAYER = "—";

type OrderEditMode = "full" | "afterSale";

type UseOrderEditorOptions = {
  mode?: OrderEditMode;
  onUpdated: (updated: OrderRow) => void;
  successMessage?: string;
};

export function useOrderEditor({
  mode = "full",
  onUpdated,
  successMessage,
}: UseOrderEditorOptions) {
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const openEdit = useCallback(
    (row: OrderRow) => {
      setEditing(row);
      form.setFieldsValue({
        status: row.status,
        servicePlayer: row.servicePlayer === EMPTY_SERVICE_PLAYER ? "" : row.servicePlayer,
      });
    },
    [form],
  );

  const closeEdit = useCallback(() => setEditing(null), []);

  const handleSave = useCallback(async () => {
    if (!editing) return;
    const values = await form.validate();
    setSaving(true);
    try {
      const updated = await api.updateOrder(editing.id, {
        status: values.status as OrderStatus,
        servicePlayer: values.servicePlayer?.trim() || EMPTY_SERVICE_PLAYER,
      });
      onUpdated(updated);
      Message.success(successMessage ?? (mode === "afterSale" ? "售后单已更新" : "订单已更新"));
      setEditing(null);
    } catch {
      Message.error("更新失败");
    } finally {
      setSaving(false);
    }
  }, [editing, form, mode, onUpdated, successMessage]);

  return { editing, saving, form, openEdit, closeEdit, handleSave };
}

type OrderEditModalProps = {
  mode?: OrderEditMode;
  editing: OrderRow | null;
  saving: boolean;
  form: FormInstance;
  onSave: () => void;
  onCancel: () => void;
};

export function OrderEditModal({
  mode = "full",
  editing,
  saving,
  form,
  onSave,
  onCancel,
}: OrderEditModalProps) {
  const title =
    mode === "afterSale"
      ? `处理售后 ${editing?.id ?? ""}`
      : `编辑订单 ${editing?.id ?? ""}`;

  return (
    <Modal
      title={title}
      visible={Boolean(editing)}
      confirmLoading={saving}
      onOk={onSave}
      onCancel={onCancel}
      unmountOnExit
    >
      <Form form={form} layout="vertical">
        <Form.Item label="状态" field="status" rules={[{ required: true }]}>
          <Select>
            {mode === "afterSale" ? (
              <>
                <Select.Option value="after_sale">{ORDER_STATUS_MAP.after_sale.label}</Select.Option>
                <Select.Option value="completed">{ORDER_STATUS_MAP.completed.label}</Select.Option>
                <Select.Option value="pending_confirm">
                  {ORDER_STATUS_MAP.pending_confirm.label}
                </Select.Option>
              </>
            ) : (
              Object.entries(ORDER_STATUS_MAP).map(([value, meta]) => (
                <Select.Option key={value} value={value}>
                  {meta.label}
                </Select.Option>
              ))
            )}
          </Select>
        </Form.Item>
        <Form.Item label="服务打手" field="servicePlayer">
          <Input placeholder="留空则显示 —" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
