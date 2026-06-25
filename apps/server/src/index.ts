import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { PORT } from "./config.js";
import { requireAdmin } from "./middleware/auth.js";
import { adminAuthRouter } from "./routes/admin/auth.js";
import { adminHandlersRouter } from "./routes/admin/handlers.js";
import { adminOrdersRouter } from "./routes/admin/orders.js";
import { adminProductsRouter } from "./routes/admin/products.js";
import {
  publicCatalogRouter,
  publicHandlersRouter,
  publicOrdersRouter,
  publicProductsRouter,
} from "./routes/public.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "meme-server" });
});

app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/orders", requireAdmin, adminOrdersRouter);
app.use("/api/admin/products", requireAdmin, adminProductsRouter);
app.use("/api/admin/handlers", requireAdmin, adminHandlersRouter);

app.use("/api/catalog", publicCatalogRouter);
app.use("/api/products", publicProductsRouter);
app.use("/api/handlers", publicHandlersRouter);
app.use("/api/orders", publicOrdersRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "INTERNAL_ERROR", message: "服务异常" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

app.listen(PORT, () => {
  console.log(`meme-server listening on http://localhost:${PORT}`);
});
