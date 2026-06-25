/** CMS 缺省：数据来自 seed/initial.json，不再硬编码 */
import type { Database } from "../types.js";

export function withCmsDefaults(data: Partial<Database>): Pick<Database, "users" | "banners" | "announcements"> {
  return {
    users: (data.users ?? []).map((u) => ({ ...u })),
    banners: (data.banners ?? []).map((b) => ({ ...b })),
    announcements: (data.announcements ?? []).map((a) => ({ ...a })),
  };
}
