import { Router } from "express";
import { adminApiPolicy, requireRead } from "../../middleware/admin-api-policy.js";
import { adminSupportService } from "../../services/admin-support.js";

export const adminFeedbacksRouter = Router();

adminFeedbacksRouter.get("/", requireRead(...adminApiPolicy.feedbacks.read), async (_req, res) => {
  const items = await adminSupportService.listFeedbackRows();
  res.json({ items, total: items.length });
});
