import { useEffect } from "react";
import { unlockOrderNotificationSound } from "@/lib/order-notification-sound";

/** 首次用户交互后解锁订单提示音（浏览器 autoplay 策略） */
export function useOrderSoundUnlock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const unlock = () => unlockOrderNotificationSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enabled]);
}
