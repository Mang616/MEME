/**
 * TabBar 图标与主题联动（app.json 仅作首帧占位，以 initTheme / setTheme 为准）
 *
 * 资源命名：
 *   浅色 theme=light → {key}.png / {key}-active.png
 *   深色 theme=dark  → {key}-dark.png / {key}-dark-active.png
 */
const { THEME_LIGHT, THEME_DARK, normalizeTheme } = require('./theme')

const TAB_ITEMS = [
  { index: 0, key: 'home', text: '首页' },
  { index: 1, key: 'products', text: '商品' },
  { index: 2, key: 'order', text: '订单' },
  { index: 3, key: 'chat', text: '聊天' },
  { index: 4, key: 'profile', text: '我的' },
]

const TAB_ICONS = {
  [THEME_LIGHT]: {
    home: {
      iconPath: 'assets/tab/home.png',
      selectedIconPath: 'assets/tab/home-active.png',
    },
    products: {
      iconPath: 'assets/tab/products.png',
      selectedIconPath: 'assets/tab/products-active.png',
    },
    order: {
      iconPath: 'assets/tab/order.png',
      selectedIconPath: 'assets/tab/order-active.png',
    },
    chat: {
      iconPath: 'assets/tab/chat.png',
      selectedIconPath: 'assets/tab/chat-active.png',
    },
    profile: {
      iconPath: 'assets/tab/profile.png',
      selectedIconPath: 'assets/tab/profile-active.png',
    },
  },
  [THEME_DARK]: {
    home: {
      iconPath: 'assets/tab/home-dark.png',
      selectedIconPath: 'assets/tab/home-dark-active.png',
    },
    products: {
      iconPath: 'assets/tab/products-dark.png',
      selectedIconPath: 'assets/tab/products-dark-active.png',
    },
    order: {
      iconPath: 'assets/tab/order-dark.png',
      selectedIconPath: 'assets/tab/order-dark-active.png',
    },
    chat: {
      iconPath: 'assets/tab/chat-dark.png',
      selectedIconPath: 'assets/tab/chat-dark-active.png',
    },
    profile: {
      iconPath: 'assets/tab/profile-dark.png',
      selectedIconPath: 'assets/tab/profile-dark-active.png',
    },
  },
}

function getTabIconSet(theme) {
  return TAB_ICONS[normalizeTheme(theme)] || TAB_ICONS[THEME_DARK]
}

/** 按主题刷新全部 Tab 图标（配合 wx.setTabBarStyle） */
function applyTabBarIcons(theme) {
  const iconSet = getTabIconSet(theme)
  TAB_ITEMS.forEach(({ index, key, text }) => {
    const paths = iconSet[key]
    if (!paths) return
    try {
      wx.setTabBarItem({
        index,
        text,
        iconPath: paths.iconPath,
        selectedIconPath: paths.selectedIconPath,
      })
    } catch (err) {
      console.warn('[tab-bar] setTabBarItem failed', index, err)
    }
  })
}

module.exports = {
  TAB_ITEMS,
  getTabIconSet,
  applyTabBarIcons,
}
