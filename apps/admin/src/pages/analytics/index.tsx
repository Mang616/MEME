import { Card, Message, Radio, Space, Tabs } from "@arco-design/web-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsChart, buildBarOption, buildTreemapOption } from "@/components/analytics/AnalyticsChart";
import { AnalyticsDateFilter } from "@/components/analytics/AnalyticsDateFilter";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { PageShell } from "@/components/PageShell";
import { api, type AnalyticsReport } from "@/lib/api";
import {
  buildDateRange,
  type DatePreset,
  type DateRangeValue,
} from "@/lib/analytics-date";

type ProductMetric = "quantity" | "amount";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [draftRange, setDraftRange] = useState<DateRangeValue>(() => buildDateRange("last30"));
  const [productMetric, setProductMetric] = useState<ProductMetric>("quantity");

  const load = useCallback(async (nextRange: DateRangeValue) => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsReport(nextRange.from, nextRange.to);
      setReport(data);
    } catch {
      Message.error("加载分析数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(buildDateRange("last30"));
  }, [load]);

  function handlePresetChange(preset: DatePreset) {
    const next = buildDateRange(preset, draftRange);
    setDraftRange(next);
    if (preset !== "custom") {
      void load(next);
    }
  }

  function handleSearch() {
    void load(draftRange);
  }

  const chartOptions = useMemo(() => {
    if (!report) return null;
    const { daily, products } = report;

    return {
      users: buildBarOption({
        title: "每日新增用户量",
        labels: daily.labels,
        values: daily.newUsers,
        color: "#165DFF",
      }),
      orders: buildBarOption({
        title: "每日订单量",
        labels: daily.labels,
        values: daily.orders,
        color: "#FF7D00",
      }),
      revenue: buildBarOption({
        title: "每日订单总金额（不含已取消）",
        labels: daily.labels,
        values: daily.revenue,
        color: "#00B42A",
        valueFormatter: (value) => `¥${value.toFixed(2)}`,
      }),
      productsQuantity: buildTreemapOption({
        title: "产品销量 · 按订单数量",
        data: products.byQuantity,
        valueFormatter: (value) => `${value} 单`,
      }),
      productsAmount: buildTreemapOption({
        title: "产品销量 · 按成交金额",
        data: products.byAmount,
        valueFormatter: (value) => `¥${value.toFixed(2)}`,
      }),
    };
  }, [report]);

  return (
    <PageShell title="数据分析" subtitle="统计概览 + 图表分析，支持按时间范围查看" loading={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <AnalyticsDateFilter
          value={draftRange}
          loading={loading}
          onPresetChange={handlePresetChange}
          onCustomChange={(from, to) =>
            setDraftRange({ preset: "custom", from, to })
          }
          onSearch={handleSearch}
        />

        {report ? <AnalyticsSummary report={report} /> : null}

        <Card bordered={false} className="analytics-panel">
          <Tabs defaultActiveTab="users" type="rounded">
            <Tabs.TabPane key="users" title="用户增长">
              {chartOptions ? <AnalyticsChart option={chartOptions.users} height={380} /> : null}
            </Tabs.TabPane>
            <Tabs.TabPane key="orders" title="订单趋势">
              {chartOptions ? <AnalyticsChart option={chartOptions.orders} height={380} /> : null}
            </Tabs.TabPane>
            <Tabs.TabPane key="revenue" title="营收趋势">
              {chartOptions ? <AnalyticsChart option={chartOptions.revenue} height={380} /> : null}
            </Tabs.TabPane>
            <Tabs.TabPane key="products" title="产品销量">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Radio.Group
                  type="button"
                  value={productMetric}
                  onChange={setProductMetric}
                >
                  <Radio value="quantity">按订单数量</Radio>
                  <Radio value="amount">按成交金额</Radio>
                </Radio.Group>
                {chartOptions ? (
                  <AnalyticsChart
                    option={
                      productMetric === "quantity"
                        ? chartOptions.productsQuantity
                        : chartOptions.productsAmount
                    }
                    height={400}
                  />
                ) : null}
              </Space>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </Space>
    </PageShell>
  );
}
