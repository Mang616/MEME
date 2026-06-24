import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [ROUTES.home, ROUTES.order];
  return routes.map((path) => ({
    url: `${SITE_URL}${path === ROUTES.home ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === ROUTES.home ? 1 : 0.85,
  }));
}
