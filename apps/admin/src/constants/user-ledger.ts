export const USER_LEDGER_TYPE_MAP: Record<
  string,
  { label: string; color: string }
> = {
  recharge: { label: "充值", color: "green" },
  order_pay: { label: "订单支付", color: "arcoblue" },
  admin_increment: { label: "后台加余额", color: "orange" },
  admin_decrement: { label: "后台减余额", color: "red" },
  admin_set: { label: "后台设余额", color: "gray" },
};
