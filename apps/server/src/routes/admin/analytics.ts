import { Router } from "express";
import { adminApiPolicy, requireRead } from "../../middleware/admin-api-policy.js";
import { analyticsService } from "../../services/analytics.js";

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.get("/overview", requireRead(...adminApiPolicy.analytics.read), async (_req, res) => {
  const overview = await analyticsService.getOverview();
  res.json(overview);
});

adminAnalyticsRouter.get("/report", requireRead(...adminApiPolicy.analytics.read), async (req, res) => {
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const report = await analyticsService.getReport(from, to);
  res.json(report);
});
