import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";

type UseAdminListOptions<T> = {
  load: () => Promise<{ items: T[] }>;
  errorMessage: string;
  /** 可选：对列表结果做过滤或映射 */
  select?: (items: T[]) => T[];
};

export function useAdminList<T>({ load: loadFn, errorMessage, select }: UseAdminListOptions<T>) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rows, setRows] = useState<T[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await loadFn();
      setRows(select ? select(data.items) : data.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setLoadError(err instanceof ApiError ? err.message : errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadFn, errorMessage, select]);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, loadError, rows, setRows, load };
}
