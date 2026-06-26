import { useEffect } from "react";
import { ADMIN_PRESENCE_INTERVAL_MS } from "@/constants/polling";
import { api } from "@/lib/api";
import type { AdminSession } from "@/lib/session";
import { isLinkedServiceProvider } from "@/lib/service-provider-ui";

/** 打手账号登录后台后维持在线状态（心跳 + 退出时离线） */
export function useAdminPresence(session: AdminSession | null) {
  useEffect(() => {
    if (!session || !isLinkedServiceProvider(session)) return;

    const tick = () => {
      void api.touchAdminPresence().catch(() => {});
    };

    tick();
    const timer = window.setInterval(tick, ADMIN_PRESENCE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      void api.logoutAdmin().catch(() => {});
    };
  }, [session?.adminId, session?.handlerId, session?.roles]);
}
