import { Router, type RequestHandler } from "express";
import type { z } from "zod";
import type { AdminPermission } from "../../constants/admin-rbac.js";
import { paramString } from "../../lib/request-params.js";
import { requireRead, requireWrite } from "../../middleware/admin-api-policy.js";

type CrudService<T, CreateInput, UpdateInput = Partial<CreateInput>> = {
  list: () => Promise<T[]>;
  getById: (id: string) => Promise<T | null>;
  create: (input: CreateInput) => Promise<T>;
  update: (id: string, patch: UpdateInput) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
};

type CrudRouterOptions<T, CreateInput, UpdateInput = Partial<CreateInput>> = {
  service: CrudService<T, CreateInput, UpdateInput>;
  bodySchema: z.ZodTypeAny;
  partialBodySchema: z.ZodTypeAny;
  entityLabel: string;
  existsError: string;
  readPermissions?: readonly AdminPermission[];
  writePermissions?: readonly AdminPermission[];
  mapResponse?: (item: T) => unknown;
  beforeCreate?: (input: CreateInput) => CreateInput;
};

function readGuard(permissions?: readonly AdminPermission[]): RequestHandler[] {
  return permissions?.length ? [requireRead(...permissions)] : [];
}

function writeGuard(permissions?: readonly AdminPermission[]): RequestHandler[] {
  return permissions?.length ? [requireWrite(...permissions)] : [];
}

export function createAdminCrudRouter<T, CreateInput, UpdateInput = Partial<CreateInput>>(
  options: CrudRouterOptions<T, CreateInput, UpdateInput>,
) {
  const router = Router();
  const toResponse = options.mapResponse ?? ((item: T) => item);

  router.get("/", ...readGuard(options.readPermissions), async (_req, res) => {
    const items = await options.service.list();
    res.json({ items, total: items.length });
  });

  router.get("/:id", ...readGuard(options.readPermissions), async (req, res) => {
    const item = await options.service.getById(paramString(req.params.id));
    if (!item) {
      res.status(404).json({ error: "NOT_FOUND", message: `${options.entityLabel}不存在` });
      return;
    }
    res.json(toResponse(item));
  });

  router.post("/", ...writeGuard(options.writePermissions), async (req, res) => {
    const parsed = options.bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_BODY",
        message: `${options.entityLabel}参数错误`,
      });
      return;
    }

    try {
      const input = options.beforeCreate
        ? options.beforeCreate(parsed.data as CreateInput)
        : (parsed.data as CreateInput);
      const created = await options.service.create(input);
      res.status(201).json(toResponse(created));
    } catch (err) {
      if (err instanceof Error && err.message === options.existsError) {
        res.status(409).json({ error: "CONFLICT", message: `${options.entityLabel} ID 已存在` });
        return;
      }
      throw err;
    }
  });

  router.put("/:id", ...writeGuard(options.writePermissions), async (req, res) => {
    const parsed = options.partialBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_BODY",
        message: `${options.entityLabel}参数错误`,
      });
      return;
    }

    const updated = await options.service.update(paramString(req.params.id), parsed.data as UpdateInput);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: `${options.entityLabel}不存在` });
      return;
    }

    res.json(toResponse(updated));
  });

  router.delete("/:id", ...writeGuard(options.writePermissions), async (req, res) => {
    const ok = await options.service.remove(paramString(req.params.id));
    if (!ok) {
      res.status(404).json({ error: "NOT_FOUND", message: `${options.entityLabel}不存在` });
      return;
    }
    res.status(204).end();
  });

  return router;
}
