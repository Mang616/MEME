import { Router } from "express";
import type { z } from "zod";

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
  mapResponse?: (item: T) => unknown;
  beforeCreate?: (input: CreateInput) => CreateInput;
};

export function createAdminCrudRouter<T, CreateInput, UpdateInput = Partial<CreateInput>>(
  options: CrudRouterOptions<T, CreateInput, UpdateInput>,
) {
  const router = Router();
  const toResponse = options.mapResponse ?? ((item: T) => item);

  router.get("/", async (_req, res) => {
    const items = await options.service.list();
    res.json({ items, total: items.length });
  });

  router.get("/:id", async (req, res) => {
    const item = await options.service.getById(req.params.id);
    if (!item) {
      res.status(404).json({ error: "NOT_FOUND", message: `${options.entityLabel}不存在` });
      return;
    }
    res.json(toResponse(item));
  });

  router.post("/", async (req, res) => {
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

  router.put("/:id", async (req, res) => {
    const parsed = options.partialBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_BODY",
        message: `${options.entityLabel}参数错误`,
      });
      return;
    }

    const updated = await options.service.update(req.params.id, parsed.data as UpdateInput);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: `${options.entityLabel}不存在` });
      return;
    }

    res.json(toResponse(updated));
  });

  router.delete("/:id", async (req, res) => {
    const ok = await options.service.remove(req.params.id);
    if (!ok) {
      res.status(404).json({ error: "NOT_FOUND", message: `${options.entityLabel}不存在` });
      return;
    }
    res.status(204).end();
  });

  return router;
}
