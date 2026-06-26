import { Button, Empty, Message } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import { useCallback, useEffect, useState } from "react";
import { OperationsOverview } from "@/components/operations/OperationsOverview";
import { PageShell } from "@/components/PageShell";
import { api, type AnalyticsOverview } from "@/lib/api";

export default function OperationsPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setOverview(await api.getAnalyticsOverview());
    } catch {
      setOverview(null);
      setLoadError("加载运营数据失败，请确认 API 服务已启动");
      Message.error("加载运营数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageShell
      title="运营概览"
      subtitle="核心指标、待办事项与数据概览"
      loading={loading}
      action={
        <Button type="outline" icon={<IconRefresh />} onClick={() => void load()}>
          刷新
        </Button>
      }
    >
      {overview ? (
        <OperationsOverview data={overview} />
      ) : !loading ? (
        <div className="operations-empty">
          <Empty description={loadError || "暂无数据"} />
          <Button type="primary" onClick={() => void load()}>
            重新加载
          </Button>
        </div>
      ) : null}
    </PageShell>
  );
}
