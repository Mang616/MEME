import { Message, Table, Tag } from "@arco-design/web-react";
import type { ColumnProps } from "@arco-design/web-react/es/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListFilterBar } from "@/components/ListFilterBar";
import { DEFAULT_TABLE_PAGINATION, PageShell } from "@/components/PageShell";
import { matchKeyword } from "@/lib/list-filter";
import { api, type FeedbackRow } from "@/lib/api";

export default function ServiceFeedbacksPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listFeedbacks();
      setRows(data.items);
    } catch {
      Message.error("加载反馈失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const typeOptions = useMemo(() => {
    const labels = [...new Set(rows.map((row) => row.typeLabel))];
    return [
      { value: "all", label: "全部类型" },
      ...labels.map((label) => ({ value: label, label })),
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (typeFilter !== "all" && row.typeLabel !== typeFilter) return false;
      return matchKeyword(
        [row.id, row.userId, row.contact, row.content, row.typeLabel],
        keyword,
      );
    });
  }, [rows, keyword, typeFilter]);

  function resetFilters() {
    setKeyword("");
    setTypeFilter("all");
  }

  const columns: ColumnProps<FeedbackRow>[] = [
    { title: "反馈 ID", dataIndex: "id", width: 180 },
    {
      title: "类型",
      dataIndex: "typeLabel",
      width: 110,
      render: (label: string) => <Tag color="arcoblue">{label}</Tag>,
    },
    { title: "用户", dataIndex: "userId", width: 140 },
    { title: "联系方式", dataIndex: "contact", width: 140 },
    { title: "内容", dataIndex: "content", ellipsis: true },
    { title: "提交时间", dataIndex: "createdAt", width: 180 },
  ];

  return (
    <PageShell title="意见反馈" subtitle="用户在小程序提交的问题与建议" loading={loading}>
      <ListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        keywordPlaceholder="搜索用户 / 联系方式 / 内容"
        selects={[
          {
            value: typeFilter,
            onChange: setTypeFilter,
            placeholder: "反馈类型",
            width: 140,
            options: typeOptions,
          },
        ]}
        total={rows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />
      <Table rowKey="id" columns={columns} data={filteredRows} pagination={DEFAULT_TABLE_PAGINATION} />
    </PageShell>
  );
}
