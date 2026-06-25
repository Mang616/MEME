/**
 * 商品玩法介绍 — 转为 rich-text nodes
 * 后续可由 CMS / 接口返回 HTML 或 nodes
 */

function textNode(text) {
  return { type: 'text', text }
}

function heading(text) {
  return {
    name: 'h3',
    attrs: {
      style: 'font-size:15px;font-weight:700;margin:18px 0 8px;line-height:1.4',
    },
    children: [textNode(text)],
  }
}

function paragraph(text) {
  return {
    name: 'p',
    attrs: {
      style: 'font-size:14px;line-height:1.7;margin:0 0 10px',
    },
    children: [textNode(text)],
  }
}

function labeledParagraph(label, content) {
  return {
    name: 'p',
    attrs: { style: 'font-size:14px;line-height:1.7;margin:0 0 10px' },
    children: [
      {
        name: 'strong',
        attrs: { style: 'font-weight:700' },
        children: [textNode(label)],
      },
      textNode(content),
    ],
  }
}

function bulletList(items) {
  return {
    name: 'ul',
    attrs: { style: 'padding-left:20px;margin:0 0 14px' },
    children: items.map((item) => ({
      name: 'li',
      attrs: { style: 'font-size:14px;line-height:1.7;margin-bottom:6px' },
      children: [textNode(item)],
    })),
  }
}

function tipParagraph(text) {
  return {
    name: 'p',
    attrs: {
      style:
        'font-size:13px;line-height:1.6;margin:12px 0 0;padding:10px 12px;border-radius:8px;background:rgba(109,184,90,0.12)',
    },
    children: [textNode(text)],
  }
}

/** @param {Array<{type:string,text?:string,items?:string[],label?:string,content?:string}>} sections */
function buildIntroNodes(sections) {
  const children = []
  sections.forEach((s) => {
    if (s.type === 'h') children.push(heading(s.text))
    else if (s.type === 'p') children.push(paragraph(s.text))
    else if (s.type === 'label') children.push(labeledParagraph(s.label, s.content))
    else if (s.type === 'ul') children.push(bulletList(s.items))
    else if (s.type === 'tip') children.push(tipParagraph(s.text))
  })
  return [
    {
      name: 'div',
      attrs: { style: 'font-size:14px;line-height:1.7' },
      children,
    },
  ]
}

const INTRO_SECTIONS = {
  p1: [
    { type: 'h', text: '玩法说明' },
    {
      type: 'p',
      text: '本单为绝密模式体验护航，下单后由认证车队邀请组队，全程语音沟通路线与撤离点。适合想体验高端局节奏、又希望有保底收益的玩家。',
    },
    { type: 'label', label: '保底范围：', content: '单局保底 3.33m～10m 哈夫币（以客服说明为准）。' },
    { type: 'label', label: '服务特点：', content: '无上限续打，炸单不中断，按规则赠送额外局数。' },
    { type: 'h', text: '炸单赠送规则' },
    {
      type: 'ul',
      items: [
        '炸 4 把送 1 把，炸 7 把送 2 把',
        '炸 11 把送 3 把，炸 15 把送 4 把',
        '炸 19 把送 5 把，炸 23 把送 6 把',
        '炸 27 把送 7 把，炸 31 把送 8 把',
        '炸 35 把送 9 把，炸 39 把送 10 把',
      ],
    },
    { type: 'h', text: '下单须知' },
    {
      type: 'ul',
      items: [
        '每人限购 1 单，请勿重复下单',
        '请保持游戏与微信在线，按客服指引进组',
        '护航过程中请勿恶意挂机、辱骂队友',
        '如有争议请在订单完成后 24 小时内联系客服',
      ],
    },
    {
      type: 'tip',
      text: '温馨提示：绝密局风险较高，请提前备好装备与药品。平台仅提供组队护航服务，不涉及代练、装备交易。',
    },
  ],
  p2: [
    { type: 'h', text: '玩法说明' },
    {
      type: 'p',
      text: '「拯救老板」面向破产或急需回本的玩家：车队以清图、击杀、协助撤离为目标，帮助老板在高压局里重新积累资源。',
    },
    { type: 'label', label: '核心目标：', content: '累计击杀 30 名敌方干员，并协助老板成功撤离。' },
    { type: 'h', text: '服务流程' },
    {
      type: 'ul',
      items: [
        '下单后客服确认地图、时段与联系方式',
        '打手进组后全程报点，优先保护老板存活',
        '达成击杀与撤离条件后截图结算',
        '若因不可抗力未撤离，按平台规则协商补单或退款',
      ],
    },
    { type: 'h', text: '适合人群' },
    {
      type: 'ul',
      items: [
        '仓库见底、需要快速回血的玩家',
        '希望有人带队、减少野排风险的玩家',
        '可配合语音、听从战术安排的玩家',
      ],
    },
    {
      type: 'tip',
      text: '下单前请关闭会影响上号的二级密码限制，并确保账号可正常登录。',
    },
  ],
  p3: [
    { type: 'h', text: '活动玩法' },
    {
      type: 'p',
      text: '五红对对碰为福利专区活动：在指定局数内，消除任意两枚红色品质战利品即可视为达成活动条件，门槛低于常规护航单。',
    },
    { type: 'label', label: '结算条件：', content: '消除任意两红后，按客服要求上传截图审核。' },
    { type: 'h', text: '参与说明' },
    {
      type: 'ul',
      items: [
        '活动库存有限，售罄后自动下架',
        '每人限购 2 单，与日常护航规则不同',
        '出红认定以平台审核为准，请勿 P 图',
        '审核通过后 24 小时内完成结算',
      ],
    },
    {
      type: 'tip',
      text: '本活动侧重体验「出红」氛围，不承诺固定收益金额，详情以活动页说明为准。',
    },
  ],
  p4: [
    { type: 'h', text: '商品说明' },
    {
      type: 'p',
      text: '折扣区 AW 子弹包，包含 5 发 AW 相关服务（具体交付形式以游戏版本与客服说明为准）。适合需要指定弹药、又不想全价购买的玩家。',
    },
    { type: 'h', text: '交付流程' },
    {
      type: 'ul',
      items: [
        '下单后 30 分钟内客服主动联系',
        '确认游戏 ID、在线时段与交付方式',
        '完成后双方确认，订单完结',
        '版本更新导致无法交付时，可协商退款或置换',
      ],
    },
    { type: 'h', text: '注意事项' },
    {
      type: 'ul',
      items: [
        '每人限购 3 单',
        '折扣商品不支持七天无理由',
        '请勿在交付过程中修改密码或顶号',
      ],
    },
    {
      type: 'tip',
      text: '本商品为折扣特价项，价格随活动调整，以下单页显示为准。',
    },
  ],
  p5: [
    { type: 'h', text: '陪玩说明' },
    {
      type: 'p',
      text: '娱乐陪玩 1 小时：语音开黑、娱乐局为主，不限段位与地图。陪玩师负责活跃气氛、基础报点与娱乐组队，非强制上分。',
    },
    { type: 'h', text: '服务内容' },
    {
      type: 'ul',
      items: [
        '微信/游戏语音连线，时长 60 分钟',
        '可备注：娱乐唠嗑 / 轻度教学 / 方言偏好等',
        '支持常规地图，极端模式需提前沟通',
        '禁止辱骂、挂机、广告引流等行为',
      ],
    },
    { type: 'h', text: '下单建议' },
    {
      type: 'ul',
      items: [
        '预约时段请尽量准确，迟到可能压缩时长',
        '不满意可在订单完成后 24 小时内申诉',
        '未成年人请在监护人同意下使用',
      ],
    },
    {
      type: 'tip',
      text: '陪玩师均通过平台基础考核，匹配结果以客服安排为准。',
    },
  ],
  p6: [
    { type: 'h', text: '陪玩说明' },
    {
      type: 'p',
      text: '上分陪玩 2 小时：由高分段陪玩师带队，侧重胜率与打法复盘，适合希望提升段位或隐藏分的玩家。',
    },
    { type: 'label', label: '服务时长：', content: '连续 2 小时（可协商分段，需提前说明）。' },
    { type: 'h', text: '服务重点' },
    {
      type: 'ul',
      items: [
        '进组前沟通当前段位、常用地图与打法风格',
        '局内指挥节奏、报点、关键团战提醒',
        '局后简要复盘失误点（时间允许范围内）',
        '不保证段位必定上升，但承诺尽力打好每一局',
      ],
    },
    { type: 'h', text: '适合人群' },
    {
      type: 'ul',
      items: [
        '有上分目标、能配合战术的玩家',
        '愿意听指挥、可开麦交流的玩家',
        '希望减少野排不确定性的玩家',
      ],
    },
    {
      type: 'tip',
      text: '请如实告知段位与账号情况，以便匹配合适陪玩师。恶意隐瞒可能导致服务体验下降。',
    },
  ],
}

const DEFAULT_INTRO = [
  { type: 'h', text: '玩法说明' },
  {
    type: 'p',
    text: '本商品为平台标准服务，下单后请保持联系方式畅通，按客服指引完成组队与服务。具体规则以订单页与客服说明为准。',
  },
]

function getIntroNodes(productId) {
  const sections = INTRO_SECTIONS[productId] || DEFAULT_INTRO
  return buildIntroNodes(sections)
}

module.exports = {
  INTRO_SECTIONS,
  buildIntroNodes,
  getIntroNodes,
}
