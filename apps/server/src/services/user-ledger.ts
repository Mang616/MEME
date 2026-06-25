import { formatDateTime } from "../lib/format-time.js";
import { insertUserLedger } from "../db/index.js";
import type { UserLedgerType } from "../types.js";

export async function recordUserLedger(input: {
  userId: string;
  type: UserLedgerType;
  consumeAmount: number;
  balanceDelta: number;
  balanceAfter: number;
  totalConsumeAfter: number;
  remark?: string;
  refId?: string;
}) {
  const entry = {
    id: `ul_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    type: input.type,
    consumeAmount: Math.round(Math.max(0, input.consumeAmount) * 100) / 100,
    balanceDelta: Math.round(input.balanceDelta * 100) / 100,
    balanceAfter: Math.round(input.balanceAfter * 100) / 100,
    totalConsumeAfter: Math.round(Math.max(0, input.totalConsumeAfter) * 100) / 100,
    remark: input.remark?.trim() ?? "",
    refId: input.refId?.trim() ?? "",
    createdAt: formatDateTime(),
  };
  await insertUserLedger(entry);
  return entry;
}
