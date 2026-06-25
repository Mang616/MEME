import { Message } from "@arco-design/web-react";
import type { FormInstance } from "@arco-design/web-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CrudMessages = {
  loadError: string;
  createOk?: string;
  updateOk?: string;
  deleteOk?: string;
  saveError?: string;
  deleteError?: string;
};

type UseCrudResourceOptions<T extends { id: string }, F> = {
  list: () => Promise<{ items: T[] }>;
  create?: (values: F) => Promise<T>;
  update?: (id: string, values: Partial<F>) => Promise<T>;
  remove?: (id: string) => Promise<void>;
  messages: CrudMessages;
};

export function useCrudResource<T extends { id: string }, F>(
  options: UseCrudResourceOptions<T, F>,
) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<T[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await optionsRef.current.list();
      setRows(data.items);
    } catch {
      Message.error(optionsRef.current.messages.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate(form: FormInstance<F>, emptyValues: F) {
    if (!optionsRef.current.create) return;
    setEditing(null);
    form.setFieldsValue(emptyValues as never);
    setModalOpen(true);
  }

  function openEdit(form: FormInstance<F>, row: T, toFormValues: (row: T) => F) {
    setEditing(row);
    form.setFieldsValue(toFormValues(row) as never);
    setModalOpen(true);
  }

  async function handleSave(form: FormInstance<F>) {
    const { create, update, messages } = optionsRef.current;
    const values = await form.validate();
    setSaving(true);
    try {
      if (editing && update) {
        const updated = await update(editing.id, values);
        setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        Message.success(messages.updateOk ?? "已更新");
      } else if (create) {
        const created = await create(values);
        setRows((prev) => [created, ...prev]);
        Message.success(messages.createOk ?? "已创建");
      }
      setModalOpen(false);
    } catch {
      Message.error(messages.saveError ?? (editing ? "更新失败" : "创建失败"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { remove, messages } = optionsRef.current;
    if (!remove) return;
    try {
      await remove(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      Message.success(messages.deleteOk ?? "已删除");
    } catch {
      Message.error(messages.deleteError ?? "删除失败");
    }
  }

  return {
    loading,
    rows,
    modalOpen,
    setModalOpen,
    editing,
    saving,
    load,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
  };
}
