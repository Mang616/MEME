/**
 * 首页快捷入口弹窗内容
 * block.type: paragraph | rich | list | qrcode | tip
 */

const GUIDES = {
  guide: {
    id: 'guide',
    title: '购买说明',
    icon: '🎧',
    blocks: [
      {
        type: 'paragraph',
        text: '✨ 老板您好！感谢您选择本店服务，您可直接在小程序下单！免出去比价还不会被骗，本店价格优惠、新店活动多，纯绿手工无科技，您直接下单即可 ✨',
      },
      {
        type: 'paragraph',
        text: '📌 本店具体操作：店内 24 小时客服；打手一般 5–10 分钟内加您好友；白天基本秒接单，晚上可能需要点时间，客服也会帮您积极处理，还请老板们多点耐心。',
      },
      {
        type: 'tip',
        text: '💕 温馨提示：请打开公众号下发的订单通知，以便您及时了解订单进展状态！',
      },
      {
        type: 'warning',
        text: '⚠️ 安全第一：近期发现有打手私下联系客户。如有打手要私下加您联系，请您及时举报，会有打手全部押金奖励给您。',
      },
    ],
  },
  cs: {
    id: 'cs',
    title: '客服',
    icon: '💬',
    blocks: [
      {
        type: 'qrcode',
        headline: '迷因电竞 · 在线客服',
        footer: '添加客服微信 · 24 小时营业（二维码待配置）',
        items: [
          { name: '客服 1' },
          { name: '客服 2' },
        ],
      },
    ],
  },
  notice: {
    id: 'notice',
    title: '下单须知',
    icon: '📖',
    blocks: [
      {
        type: 'rich',
        parts: [
          { text: '服务保障：', tone: 'default' },
          { text: '追缴包补包赔 放心下单', tone: 'emphasis' },
        ],
      },
      {
        type: 'rich',
        parts: [
          { text: '服务时间：', tone: 'default' },
          { text: '全天 24 小时接单', tone: 'highlight' },
        ],
      },
      {
        type: 'rich',
        parts: [
          { text: '迷因电竞保障老板', tone: 'default' },
          { text: '游戏体验必须第一！', tone: 'highlight' },
        ],
      },
      {
        type: 'rich',
        parts: [
          { text: '打手态度 / 客服售后 ', tone: 'default' },
          { text: '全权维护到底！', tone: 'emphasis' },
        ],
      },
      {
        type: 'rich',
        parts: [
          { text: '接受', tone: 'default' },
          { text: '投诉批评', tone: 'emphasis' },
          { text: ' 加以改进！', tone: 'default' },
        ],
      },
      {
        type: 'rich',
        parts: [
          { text: '也欢迎老板投稿新的', tone: 'default' },
          { text: '创意单类', tone: 'link' },
        ],
      },
    ],
  },
  live: {
    id: 'live',
    title: '直播考核',
    icon: '🎮',
    blocks: [
      {
        type: 'paragraph',
        text: '抖音搜直播间：迷因电竞',
        center: true,
      },
    ],
  },
}

function getGuideById(id) {
  return GUIDES[id] || null
}

module.exports = {
  GUIDES,
  getGuideById,
}
