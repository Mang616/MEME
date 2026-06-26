import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { PORT, USE_MYSQL, CORS_ORIGINS, PUBLIC_API_URL } from "./config.js";
import { seedDatabaseIfEmpty, ensureCmsSeeded, ensureExtendedSeeded, ensureMissingContentPages, ensureProductTagsSeeded, ensureAdminUsersSeeded, ensureHandlerLegacyProfiles, ensureChatConversationsMigrated, ensureOrderServiceTypes, ensureRbacHandlerDefaults, ensureUsersVipSynced, ensureUserCouponsSeeded, ensureUserInviteCodesSeeded, storageLabel } from "./db/index.js";
import { requireAdmin } from "./middleware/auth.js";
import { adminAnalyticsRouter } from "./routes/admin/analytics.js";
import { adminAnnouncementsRouter } from "./routes/admin/announcements.js";
import { adminAuthRouter } from "./routes/admin/auth.js";
import { adminBannersRouter } from "./routes/admin/banners.js";
import { adminStaffRouter } from "./routes/admin/admin-users.js";
import { adminChatsRouter } from "./routes/admin/chats.js";
import { adminFeedbacksRouter } from "./routes/admin/feedbacks.js";
import { adminHandlersRouter } from "./routes/admin/handlers.js";
import { adminClubsRouter } from "./routes/admin/clubs.js";
import { adminOrdersRouter } from "./routes/admin/orders.js";
import { adminCategoriesRouter } from "./routes/admin/categories.js";
import { adminProductTagsRouter } from "./routes/admin/product-tags.js";
import { adminProductsRouter } from "./routes/admin/products.js";
import { adminUsersRouter } from "./routes/admin/users.js";
import { adminPermissionsRouter } from "./routes/admin/permissions.js";
import { adminRolesRouter } from "./routes/admin/roles.js";
import { adminUploadRouter } from "./routes/admin/upload.js";
import { adminContentPagesRouter } from "./routes/admin/content-pages.js";
import { rolePermissionService } from "./services/role-permissions.js";
import { authRouter, userRouter } from "./routes/auth.js";
import {
  publicAnnouncementsRouter,
  publicBannersRouter,
  publicCatalogRouter,
  publicChatsRouter,
  publicContentRouter,
  publicFeedbacksRouter,
  publicHandlersRouter,
  publicOrdersRouter,
  publicProductsRouter,
} from "./routes/public.js";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "meme-server",
    storage: storageLabel(),
    api: PUBLIC_API_URL,
  });
});

app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/orders", requireAdmin, adminOrdersRouter);
app.use("/api/admin/products", requireAdmin, adminProductsRouter);
app.use("/api/admin/categories", requireAdmin, adminCategoriesRouter);
app.use("/api/admin/product-tags", requireAdmin, adminProductTagsRouter);
app.use("/api/admin/handlers", requireAdmin, adminHandlersRouter);
app.use("/api/admin/clubs", requireAdmin, adminClubsRouter);
app.use("/api/admin/users", requireAdmin, adminUsersRouter);
app.use("/api/admin/staff", adminStaffRouter);
app.use("/api/admin/roles", adminRolesRouter);
app.use("/api/admin/permissions", adminPermissionsRouter);
app.use("/api/admin/banners", requireAdmin, adminBannersRouter);
app.use("/api/admin/announcements", requireAdmin, adminAnnouncementsRouter);
app.use("/api/admin/content-pages", requireAdmin, adminContentPagesRouter);
app.use("/api/admin/analytics", requireAdmin, adminAnalyticsRouter);
app.use("/api/admin/chats", requireAdmin, adminChatsRouter);
app.use("/api/admin/feedbacks", requireAdmin, adminFeedbacksRouter);
app.use("/api/admin/upload", requireAdmin, adminUploadRouter);

app.use("/api/catalog", publicCatalogRouter);
app.use("/api/products", publicProductsRouter);
app.use("/api/handlers", publicHandlersRouter);
app.use("/api/orders", publicOrdersRouter);
app.use("/api/banners", publicBannersRouter);
app.use("/api/announcements", publicAnnouncementsRouter);
app.use("/api/content", publicContentRouter);
app.use("/api/chats", publicChatsRouter);
app.use("/api/feedbacks", publicFeedbacksRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "INTERNAL_ERROR", message: "服务异常" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

async function start() {
  try {
    await seedDatabaseIfEmpty();
    await ensureCmsSeeded();
    await ensureExtendedSeeded();
    await ensureMissingContentPages();
    await ensureUsersVipSynced();
    await ensureUserCouponsSeeded();
    await ensureUserInviteCodesSeeded();
    await ensureProductTagsSeeded();
    await ensureAdminUsersSeeded();
    await ensureHandlerLegacyProfiles();
    await ensureChatConversationsMigrated();
    await ensureOrderServiceTypes();
    await ensureRbacHandlerDefaults();
    await rolePermissionService.load();
  } catch (err) {
    console.error("[meme-server] database init failed:", err);
    if (USE_MYSQL) process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `meme-server listening on http://0.0.0.0:${PORT} (storage: ${storageLabel()})`,
    );
  });
}

start();
