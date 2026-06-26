import { useCallback, useRef } from "react";

/** 防止轮询任务重叠执行 */
export function usePollingGuard() {
  const busyRef = useRef(false);

  return useCallback(async (task: () => Promise<void>, force = false) => {
    if (!force && busyRef.current) return;
    busyRef.current = true;
    try {
      await task();
    } finally {
      busyRef.current = false;
    }
  }, []);
}
