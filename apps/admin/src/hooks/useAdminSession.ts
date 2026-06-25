import type { AdminSession } from "@/lib/session";
import { getAdminSession, toAdminSession } from "@/lib/session";
import { hydrateSession } from "@/lib/auth";
import { useEffect, useState } from "react";

/** 挂载时从服务端刷新 session，供顶栏等组件使用 */
export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession());

  useEffect(() => {
    void hydrateSession().then((me) => {
      if (me) setSession(toAdminSession(me));
    });
  }, []);

  return [session, setSession] as const;
}
