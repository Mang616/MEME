/** 管理端创建实体：生成 id、校验冲突后写入存储 */
export async function createEntity<T extends { id: string }>(options: {
  idPrefix: string;
  existsError: string;
  getById: (id: string) => Promise<T | null>;
  create: (entity: T) => Promise<T>;
  input: Omit<T, "id"> & { id?: string };
}): Promise<T> {
  const id = options.input.id ?? `${options.idPrefix}${Date.now()}`;
  if (await options.getById(id)) {
    throw new Error(options.existsError);
  }
  const created = { ...options.input, id } as T;
  return options.create(created);
}
