import { useEffect, useState } from "react";
import { isStoredMediaRef } from "@/lib/media-ref";
import { api } from "@/lib/api";

export function useSignedMediaUrl(cover: string) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const raw = cover.trim();
    if (!raw) {
      setUrl("");
      return;
    }
    if (!isStoredMediaRef(raw)) {
      setUrl(raw);
      return;
    }
    let cancelled = false;
    void api
      .signMediaUrl(raw)
      .then((result) => {
        if (!cancelled) setUrl(result.url);
      })
      .catch(() => {
        if (!cancelled) setUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [cover]);

  return url;
}
