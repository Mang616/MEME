import { Button, Popconfirm, Space } from "@arco-design/web-react";

type EditDeleteActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  deleteTitle?: string;
};

export function EditDeleteActions({
  onEdit,
  onDelete,
  deleteTitle = "确认删除？",
}: EditDeleteActionsProps) {
  return (
    <Space>
      <Button type="text" onClick={onEdit}>
        编辑
      </Button>
      <Popconfirm title={deleteTitle} onOk={onDelete}>
        <Button type="text" status="danger">
          删除
        </Button>
      </Popconfirm>
    </Space>
  );
}
