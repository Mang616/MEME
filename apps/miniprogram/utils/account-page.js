/**
 * 我的账户页：余额 + 流水
 */
const auth = require('./auth')
const authApi = require('./auth-api')
const { formatMoney } = require('./format')

const RECHARGE_AMOUNTS = [100, 500, 1000, 5000]

const LEDGER_TYPE_LABELS = {
  recharge: '充值',
  order_pay: '订单支付',
  admin_increment: '后台加余额',
  admin_decrement: '后台减余额',
  admin_set: '后台设余额',
}

function formatLedgerRow(entry) {
  const delta = Number(entry.balanceDelta) || 0
  const absDelta = Math.abs(delta)
  return {
    id: entry.id,
    typeLabel: LEDGER_TYPE_LABELS[entry.type] || entry.type,
    remark: entry.remark || '—',
    time: entry.createdAt || '',
    deltaText: `${delta >= 0 ? '+' : '-'}¥${formatMoney(absDelta)}`,
    deltaPositive: delta >= 0,
    balanceAfterText: formatMoney(entry.balanceAfter),
  }
}

function buildAccountState(user, ledgerItems) {
  const balance = Number(user?.balance) || 0
  const totalConsume = Number(user?.totalConsume) || 0
  return {
    balanceText: formatMoney(balance),
    totalConsumeText: formatMoney(totalConsume),
    ledgerRows: (ledgerItems || []).map(formatLedgerRow),
    emptyLedger: !(ledgerItems && ledgerItems.length),
  }
}

async function loadAccountPage() {
  const [user, ledgerRes] = await Promise.all([authApi.fetchMe(), authApi.fetchLedger()])
  return buildAccountState(user, ledgerRes.items || [])
}

async function refreshAccountPage() {
  await auth.syncProfile()
  return loadAccountPage()
}

function formatRechargeMessage(result) {
  const total = Number(result.totalConsume) || 0
  const level = result.vipLevel ?? 0
  if (result.vipUpgraded) {
    return `充值成功，累计消费 ¥${formatMoney(total)}，已升至 VIP${level}`
  }
  return `充值成功，累计消费 ¥${formatMoney(total)}`
}

module.exports = {
  RECHARGE_AMOUNTS,
  loadAccountPage,
  refreshAccountPage,
  formatRechargeMessage,
}
