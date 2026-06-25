import { z } from "zod";
import { createAdminCrudRouter } from "./create-crud-router.js";
import { bannerService } from "../../services/cms.js";
import type { Banner } from "../../types.js";

const bannerBodySchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().default(""),
  image: z.string().default(""),
  bgColor: z.string().default("#2d4a35"),
  linkType: z.enum(["products", "tab", "none"]).default("none"),
  linkValue: z.string().default(""),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(true),
});

type BannerInput = z.infer<typeof bannerBodySchema>;

export const adminBannersRouter = createAdminCrudRouter<Banner, BannerInput>({
  service: bannerService,
  bodySchema: bannerBodySchema,
  partialBodySchema: bannerBodySchema.partial(),
  entityLabel: "Banner",
  existsError: "BANNER_EXISTS",
});
