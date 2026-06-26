import { updateHandler } from "../db/index.js";

const TTL_MS = 90_000;

type PresenceEntry = {
  handlerId: string;
  lastSeen: number;
};

const entries = new Map<string, PresenceEntry>();

function isLive(entry: PresenceEntry, now = Date.now()) {
  return now - entry.lastSeen <= TTL_MS;
}

export const adminPresenceService = {
  async touch(adminId: string, handlerId: string) {
    if (!handlerId) return;
    entries.set(adminId, { handlerId, lastSeen: Date.now() });
    await updateHandler(handlerId, { online: true });
  },

  async clear(adminId: string) {
    const entry = entries.get(adminId);
    if (!entry) return;
    entries.delete(adminId);
    await updateHandler(entry.handlerId, { online: false });
  },

  async pruneStale() {
    const now = Date.now();
    for (const [adminId, entry] of entries) {
      if (!isLive(entry, now)) {
        await this.clear(adminId);
      }
    }
  },

  isHandlerLive(handlerId: string) {
    const now = Date.now();
    for (const entry of entries.values()) {
      if (entry.handlerId === handlerId && isLive(entry, now)) {
        return true;
      }
    }
    return false;
  },
};
