import { getContentPageBySlug, getUser, updateUser } from "../db/index.js";
import {
  normalizeVipActivityPayload,
  resolveVipLevelFromTotalConsume,
  VIP_MAX,
  VIP_MIN,
} from "@meme/vip-activity-defaults";
import type { AppUser, UserLedgerType } from "../types.js";
import { recordUserLedger } from "./user-ledger.js";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

type VipBounds = { vipMin: number; vipMax: number };

async function loadVipBounds(): Promise<VipBounds> {
  const vipConfigPage = await getContentPageBySlug("vip-config");
  const payload = vipConfigPage?.payload as { vipMin?: number; vipMax?: number } | undefined;
  return {
    vipMin: payload?.vipMin ?? VIP_MIN,
    vipMax: payload?.vipMax ?? VIP_MAX,
  };
}

async function loadVipActivityLevelList(vipMin: number, vipMax: number) {
  const page = await getContentPageBySlug("vip-activity");
  const activity = normalizeVipActivityPayload(
    page?.payload as Parameters<typeof normalizeVipActivityPayload>[0],
    vipMin,
    vipMax,
  );
  return activity.levelList;
}

async function applyMemberPatch(
  userId: string,
  patch: Partial<Pick<AppUser, "balance" | "totalConsume" | "vipLevel">>,
) {
  const { vipMin, vipMax } = await loadVipBounds();
  const levelList = await loadVipActivityLevelList(vipMin, vipMax);
  const existing = await getUser(userId);
  if (!existing) return null;

  const totalConsume = roundMoney(patch.totalConsume ?? existing.totalConsume ?? 0);
  const vipLevel = resolveVipLevelFromTotalConsume(totalConsume, levelList, vipMin, vipMax);

  return updateUser(userId, {
    ...patch,
    totalConsume,
    vipLevel,
  });
}

async function writeLedger(
  user: AppUser,
  input: {
    type: UserLedgerType;
    consumeAmount: number;
    balanceDelta: number;
    remark?: string;
    refId?: string;
  },
) {
  await recordUserLedger({
    userId: user.id,
    type: input.type,
    consumeAmount: input.consumeAmount,
    balanceDelta: input.balanceDelta,
    balanceAfter: user.balance,
    totalConsumeAfter: user.totalConsume ?? 0,
    remark: input.remark,
    refId: input.refId,
  });
}

/** 充值：增加余额，金额同步计入累计消费并刷新 VIP 等级 */
export async function rechargeMember(userId: string, amount: number) {
  const user = await getUser(userId);
  if (!user) return null;

  const add = roundMoney(Number(amount));
  if (!Number.isFinite(add) || add <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const updated = await applyMemberPatch(userId, {
    balance: roundMoney(user.balance + add),
    totalConsume: roundMoney((user.totalConsume ?? 0) + add),
  });
  if (!updated) return null;

  await writeLedger(updated, {
    type: "recharge",
    consumeAmount: add,
    balanceDelta: add,
    remark: "账户充值",
  });
  return updated;
}

/** 余额支付订单：扣减余额，实付计入累计消费并刷新 VIP 等级 */
export async function payOrderWithBalance(
  userId: string,
  amount: number,
  meta?: { refId?: string; remark?: string },
) {
  const user = await getUser(userId);
  if (!user) return null;

  const paid = roundMoney(Number(amount));
  if (!Number.isFinite(paid) || paid <= 0) {
    throw new Error("INVALID_AMOUNT");
  }
  if (user.balance < paid) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  const updated = await applyMemberPatch(userId, {
    balance: roundMoney(user.balance - paid),
    totalConsume: roundMoney((user.totalConsume ?? 0) + paid),
  });
  if (!updated) return null;

  await writeLedger(updated, {
    type: "order_pay",
    consumeAmount: paid,
    balanceDelta: -paid,
    remark: meta?.remark ?? "订单支付",
    refId: meta?.refId,
  });
  return updated;
}

/** 后台余额变更：increment 同步计入累计消费（充值视同消费） */
export async function adjustBalanceWithMemberRules(
  user: AppUser,
  input: { mode: "increment" | "decrement" | "set"; amount: number; remark?: string },
) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("INVALID_AMOUNT");
  }
  if (input.mode !== "set" && amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  let nextBalance: number;
  let nextConsume = user.totalConsume ?? 0;
  let ledgerType: UserLedgerType = "admin_set";
  let consumeAmount = 0;

  if (input.mode === "set") {
    nextBalance = amount;
  } else if (input.mode === "increment") {
    nextBalance = user.balance + amount;
    nextConsume = roundMoney(nextConsume + amount);
    ledgerType = "admin_increment";
    consumeAmount = amount;
  } else {
    nextBalance = user.balance - amount;
    ledgerType = "admin_decrement";
  }

  if (nextBalance < 0) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  const updated = await applyMemberPatch(user.id, {
    balance: roundMoney(nextBalance),
    totalConsume: roundMoney(nextConsume),
  });
  if (!updated) return null;

  await writeLedger(updated, {
    type: ledgerType,
    consumeAmount,
    balanceDelta: roundMoney(updated.balance - user.balance),
    remark: input.remark?.trim() || "后台余额变更",
  });
  return updated;
}

/** 从历史流水 / 订单 / 余额反推累计消费（修复功能上线前的充值漏记） */
export async function reconcileUserTotalConsume(userId: string) {
  const { listUserLedgerByUser, listOrders } = await import("../db/index.js");
  const user = await getUser(userId);
  if (!user) return null;

  const [ledger, orders] = await Promise.all([listUserLedgerByUser(userId), listOrders()]);
  const userOrders = orders.filter((order) => order.ownerUserId === userId && order.paid !== false);
  const orderSum = roundMoney(userOrders.reduce((sum, order) => sum + order.totalPaid, 0));

  const fromLedger = roundMoney(
    ledger.reduce((sum, entry) => sum + Math.max(0, entry.consumeAmount || 0), 0),
  );

  const ledgerOrderIds = new Set(
    ledger.filter((entry) => entry.type === "order_pay" && entry.refId).map((entry) => entry.refId),
  );
  const orphanOrderConsume = roundMoney(
    userOrders
      .filter((order) => !ledgerOrderIds.has(order.id))
      .reduce((sum, order) => sum + order.totalPaid, 0),
  );

  const fromEvents = roundMoney(fromLedger + orphanOrderConsume);

  // 仅充值 + 余额支付订单时恒成立：累计消费 = 余额 + 2×订单实付
  const hasAdminSet = ledger.some((entry) => entry.type === "admin_set");
  const inferredFromBalance = !hasAdminSet
    ? roundMoney(Math.max(0, user.balance) + 2 * orderSum)
    : 0;

  const stored = roundMoney(user.totalConsume ?? 0);
  const nextConsume = roundMoney(
    Math.max(stored, fromEvents, inferredFromBalance > 0 ? inferredFromBalance : 0),
  );

  if (nextConsume === stored) {
    return user;
  }

  return applyMemberPatch(userId, { totalConsume: nextConsume });
}

/** 按累计消费重算 VIP 等级；会先尝试补全累计消费 */
export async function syncUserVipFromConsume(userId: string) {
  await reconcileUserTotalConsume(userId);

  const user = await getUser(userId);
  if (!user) return null;

  const { vipMin, vipMax } = await loadVipBounds();
  const levelList = await loadVipActivityLevelList(vipMin, vipMax);
  const totalConsume = roundMoney(user.totalConsume ?? 0);
  const vipLevel = resolveVipLevelFromTotalConsume(totalConsume, levelList, vipMin, vipMax);

  if (vipLevel === user.vipLevel && totalConsume === roundMoney(user.totalConsume ?? 0)) {
    return user;
  }

  return updateUser(userId, { vipLevel, totalConsume });
}

/** 启动时修正历史数据：补全累计消费并重算 VIP */
export async function syncAllUsersVipFromConsume() {
  const { listUsers } = await import("../db/index.js");
  const users = await listUsers();
  let consumeFixed = 0;
  let vipFixed = 0;

  for (const user of users) {
    const beforeConsume = roundMoney(user.totalConsume ?? 0);
    const beforeVip = user.vipLevel;
    const updated = await syncUserVipFromConsume(user.id);
    if (!updated) continue;
    if (roundMoney(updated.totalConsume ?? 0) !== beforeConsume) {
      consumeFixed += 1;
    }
    if (updated.vipLevel !== beforeVip) {
      vipFixed += 1;
    }
  }

  return { total: users.length, consumeFixed, vipFixed };
}
