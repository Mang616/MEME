/**
 * 自定义导航栏
 *
 * navVariant:
 *   default — 左操作 + 标题在屏幕水平正中（绝对定位于内容栏）
 *   home    — Logo、品牌名、推广按钮
 *
 * 高度：utils/nav-layout.js → --nav-safe-top / --nav-bar-h / --nav-total-h
 */
const { buildNavBarMetrics } = require('../../utils/nav-layout')
const { THEME_TOGGLE_ICONS } = require('../../utils/constants')

Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    extClass: { type: String, value: '' },
    navVariant: { type: String, value: 'default' },
    title: { type: String, value: '' },
    background: { type: String, value: '' },
    color: { type: String, value: '' },
    back: { type: Boolean, value: false },
    loading: { type: Boolean, value: false },
    showSearch: { type: Boolean, value: false },
    showThemeToggle: { type: Boolean, value: false },
    brandName: { type: String, value: '' },
    showPromo: { type: Boolean, value: false },
    promoLabel: { type: String, value: '推广活动' },
    logoSrc: { type: String, value: '/assets/brand/logo.png' },
    theme: { type: String, value: 'dark' },
    showNavAction: { type: Boolean, value: false },
    navActionIcon: { type: String, value: '' },
    navActionLabel: { type: String, value: '' },
    animated: { type: Boolean, value: true },
    show: { type: Boolean, value: true, observer: '_onShowChange' },
    delta: { type: Number, value: 1 },
  },

  data: {
    displayStyle: '',
    isHome: false,
    metricsStyle: '',
    isIos: true,
    themeIconDark: THEME_TOGGLE_ICONS.DARK,
    themeIconLight: THEME_TOGGLE_ICONS.LIGHT,
  },

  observers: {
    navVariant(variant) {
      this.setData({ isHome: variant === 'home' })
    },
  },

  lifetimes: {
    attached() {
      const metrics = buildNavBarMetrics()
      this.setData({
        isHome: this.properties.navVariant === 'home',
        metricsStyle: metrics.metricsStyle,
        isIos: metrics.isIos,
      })
    },
  },

  methods: {
    _onShowChange(show) {
      const { animated } = this.data
      const displayStyle = animated
        ? `opacity:${show ? 1 : 0};transition:opacity 0.5s`
        : `display:${show ? '' : 'none'}`
      this.setData({ displayStyle })
    },

    back() {
      const { delta } = this.data
      if (delta) wx.navigateBack({ delta })
      this.triggerEvent('back', { delta })
    },

    onSearchTap() {
      this.triggerEvent('search')
    },

    onThemeToggleTap() {
      const next = this.properties.theme === 'dark' ? 'light' : 'dark'
      this.triggerEvent('themechange', { theme: next })
    },

    onPromoTap() {
      this.triggerEvent('promo')
    },

    onNavActionTap() {
      this.triggerEvent('navaction')
    },
  },
})
