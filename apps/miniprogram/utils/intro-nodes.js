/**
 * 商品玩法介绍 — rich-text nodes 构建（数据来自 /content/product-intros）
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

function buildIntroNodes(sections) {
  const children = []
  ;(sections || []).forEach((s) => {
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

module.exports = {
  buildIntroNodes,
}
