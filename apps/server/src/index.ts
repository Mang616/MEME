import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { PORT, USE_MYSQL } from "./config.js";
import { seedDatabaseIfEmpty, ensureCmsSeeded, storageLabel } from "./db/index.js";
import { requireAdmin } from "./middleware/auth.js";
import { adminAnnouncementsRouter } from "./routes/admin/announcements.js";
import { adminAuthRouter } from "./routes/admin/auth.js";
import { adminBannersRouter } from "./routes/admin/banners.js";
import { adminHandlersRouter } from "./routes/admin/handlers.js";
import { adminOrdersRouter } from "./routes/admin/orders.js";
import { adminProductsRouter } from "./routes/admin/products.js";
import { adminUsersRouter } from "./routes/admin/users.js";
import {
  publicAnnouncementsRouter,
  publicBannersRouter,
  publicCatalogRouter,
  publicHandlersRouter,
  publicOrdersRouter,
  publicProductsRouter,
} from "./routes/public.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "meme-server", storage: storageLabel() });
});

app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/orders", requireAdmin, adminOrdersRouter);
app.use("/api/admin/products", requireAdmin, adminProductsRouter);
app.use("/api/admin/handlers", requireAdmin, adminHandlersRouter);
app.use("/api/admin/users", requireAdmin, adminUsersRouter);
app.use("/api/admin/banners", requireAdmin, adminBannersRouter);
app.use("/api/admin/announcements", requireAdmin, adminAnnouncementsRouter);

app.use("/api/catalog", publicCatalogRouter);
app.use("/api/products", publicProductsRouter);
app.use("/api/handlers", publicHandlersRouter);
app.use("/api/orders", publicOrdersRouter);
app.use("/api/banners", publicBannersRouter);
app.use("/api/announcements", publicAnnouncementsRouter);

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
  } catch (err) {
    console.error("[meme-server] database init failed:", err);
    if (USE_MYSQL) process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(
      `meme-server listening on http://localhost:${PORT} (storage: ${storageLabel()})`,
    );
  });
}

start();
