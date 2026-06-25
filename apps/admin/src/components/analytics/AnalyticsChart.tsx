import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, TreemapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

echarts.use([
  BarChart,
  TreemapChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

type AnalyticsChartProps = {
  option: EChartsCoreOption;
  height?: number;
};

export function AnalyticsChart({ option, height = 360 }: AnalyticsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container);
    chartRef.current = chart;

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
    chartRef.current?.resize();
  }, [option]);

  return <div ref={containerRef} className="analytics-chart" style={{ height }} />;
}

export function buildBarOption({
  title,
  labels,
  values,
  color,
  valueFormatter,
}: {
  title: string;
  labels: string[];
  values: number[];
  color: string;
  valueFormatter?: (value: number) => string;
}): EChartsCoreOption {
  return {
    title: {
      text: title,
      left: 0,
      top: 0,
      textStyle: { fontSize: 14, fontWeight: 600, color: "#1d2129" },
    },
    grid: { left: 48, right: 16, top: 48, bottom: 40 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const item = Array.isArray(params) ? params[0] : (params as { name?: string; value?: number });
        const value = Number(item?.value ?? 0);
        const text = valueFormatter ? valueFormatter(value) : String(value);
        return `${item?.name ?? ""}<br/>${text}`;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#86909c", rotate: labels.length > 14 ? 45 : 0 },
      axisLine: { lineStyle: { color: "#e5e6eb" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#86909c" },
      splitLine: { lineStyle: { color: "#f2f3f5" } },
    },
    series: [
      {
        type: "bar",
        data: values,
        barMaxWidth: 28,
        itemStyle: {
          color,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };
}

export function buildTreemapOption({
  title,
  data,
  valueFormatter,
}: {
  title: string;
  data: { name: string; value: number }[];
  valueFormatter?: (value: number) => string;
}): EChartsCoreOption {
  return {
    title: {
      text: title,
      left: 0,
      top: 0,
      textStyle: { fontSize: 14, fontWeight: 600, color: "#1d2129" },
    },
    tooltip: {
      formatter: (info: unknown) => {
        const item = info as { name?: string; value?: number };
        const value = Number(item.value ?? 0);
        const text = valueFormatter ? valueFormatter(value) : String(value);
        return `${item.name}<br/>${text}`;
      },
    },
    series: [
      {
        type: "treemap",
        top: 42,
        left: 0,
        right: 0,
        bottom: 0,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: "{b}",
          color: "#fff",
          fontSize: 12,
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
          gapWidth: 2,
        },
        data: data.length
          ? data.map((item) => ({ name: item.name, value: item.value }))
          : [{ name: "暂无数据", value: 1 }],
      },
    ],
  };
}
