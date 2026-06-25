import { Card, Grid, Statistic, Typography } from "@arco-design/web-react";
import {
  IconCalendar,
  IconStorage,
  IconUser,
} from "@arco-design/web-react/icon";
import type { AnalyticsReport } from "@/lib/api";
import { formatRangeLabel } from "@/lib/analytics-date";

const { Row, Col } = Grid;

type AnalyticsSummaryProps = {
  report: AnalyticsReport;
};

export function AnalyticsSummary({ report }: AnalyticsSummaryProps) {
  const { summary, range } = report;
  const rangeLabel = formatRangeLabel(range.from, range.to);

  return (
    <div className="analytics-summary">
      <div className="analytics-summary__head">
        <Typography.Title heading={6} style={{ margin: 0 }}>
          统计概览
        </Typography.Title>
        <Typography.Text type="secondary">{rangeLabel}</Typography.Text>
      </div>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="analytics-summary__card">
            <div className="analytics-summary__card-inner">
              <div className="analytics-summary__icon analytics-summary__icon--users">
                <IconUser />
              </div>
              <div>
                <Statistic title="客户总数" value={summary.userTotal} groupSeparator />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  本期新增 {summary.newUsers} 人
                </Typography.Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="analytics-summary__card">
            <div className="analytics-summary__card-inner">
              <div className="analytics-summary__icon analytics-summary__icon--orders">
                <IconCalendar />
              </div>
              <div>
                <Statistic title="销售订单量" value={summary.orderCount} groupSeparator />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  所选时间范围内
                </Typography.Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="analytics-summary__card">
            <div className="analytics-summary__card-inner">
              <div className="analytics-summary__icon analytics-summary__icon--revenue">
                <IconStorage />
              </div>
              <div>
                <Statistic
                  title="销售总营业额"
                  prefix="¥"
                  precision={2}
                  value={summary.revenue}
                  groupSeparator
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  不含已取消 / 已退款
                </Typography.Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
