import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type VipConfigPayload, type VipLevelConfigItem } from "@/lib/api";
import {
  buildVipLevelOptions,
  getVipLevelDef,
  normalizeVipConfig,
} from "@/lib/vip-config";

type VipConfigContextValue = {
  config: VipConfigPayload;
  loading: boolean;
  levelOptions: { value: number; label: string }[];
  getLevelDef: (level: number | undefined | null) => VipLevelConfigItem;
  refresh: () => Promise<void>;
  applyConfig: (next: VipConfigPayload) => void;
};

const VipConfigContext = createContext<VipConfigContextValue | null>(null);

export function VipConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<VipConfigPayload>(() => normalizeVipConfig(undefined));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const page = await api.getVipConfig();
      setConfig(normalizeVipConfig(page.payload));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const levelOptions = useMemo(() => buildVipLevelOptions(config), [config]);

  const getLevelDef = useCallback(
    (level: number | undefined | null) => getVipLevelDef(config, level),
    [config],
  );

  const value = useMemo(
    () => ({
      config,
      loading,
      levelOptions,
      getLevelDef,
      refresh,
      applyConfig: setConfig,
    }),
    [config, loading, levelOptions, getLevelDef, refresh],
  );

  return <VipConfigContext.Provider value={value}>{children}</VipConfigContext.Provider>;
}

export function useVipConfig() {
  const ctx = useContext(VipConfigContext);
  if (!ctx) {
    throw new Error("useVipConfig 须在 VipConfigProvider 内使用");
  }
  return ctx;
}
