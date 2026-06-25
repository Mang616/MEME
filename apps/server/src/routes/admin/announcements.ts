import { z } from "zod";
import { adminApiPolicy } from "../../middleware/admin-api-policy.js";
import { createAdminCrudRouter } from "./create-crud-router.js";
import { announcementService } from "../../services/cms.js";
import type { Announcement } from "../../types.js";

const announcementBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  placement: z.enum(["home_bar", "popup"]).default("home_bar"),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  startAt: z.string().default(""),
  endAt: z.string().default(""),
});

type AnnouncementInput = z.infer<typeof announcementBodySchema>;

export const adminAnnouncementsRouter = createAdminCrudRouter<Announcement, AnnouncementInput>({
  service: announcementService,
  bodySchema: announcementBodySchema,
  partialBodySchema: announcementBodySchema.partial(),
  entityLabel: "公告",
  existsError: "ANNOUNCEMENT_EXISTS",
  readPermissions: adminApiPolicy.content.read,
  writePermissions: adminApiPolicy.content.write,
});
