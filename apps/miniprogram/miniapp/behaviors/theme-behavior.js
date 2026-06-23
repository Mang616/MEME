/**
 * 页面主题 behavior：注入 theme / navColor / navBg，并订阅全局切换
 * 用法：Page({ behaviors: require('.../themed-page') })
 */
const theme = require('../utils/theme')

function buildThemeState(themeId) {
  const resolved = theme.normalizeTheme(themeId)
  const nav = theme.getNavStyle(resolved)
  return {
    theme: resolved,
    navColor: nav.navColor,
    navBg: nav.navBg,
  }
}

module.exports = Behavior({
  data: buildThemeState(theme.DEFAULT_THEME),

  lifetimes: {
    attached() {
      this._onThemeChange = (next) => this._updateThemeState(next)
      theme.subscribe(this._onThemeChange)
    },
    detached() {
      theme.unsubscribe(this._onThemeChange)
      this._onThemeChange = null
    },
  },

  pageLifetimes: {
    /** Tab 切回时与存储对齐（防止其他入口改主题） */
    show() {
      this._updateThemeState(theme.getTheme())
    },
  },

  methods: {
    _updateThemeState(themeId) {
      const next = buildThemeState(themeId)
      if (
        next.theme === this.data.theme &&
        next.navColor === this.data.navColor &&
        next.navBg === this.data.navBg
      ) {
        return
      }
      this.setData(next)
      theme.applyNavigationBarColor(next.theme)
    },
  },
})
