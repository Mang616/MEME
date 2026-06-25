/**
 * 统一页面壳：主题容器 + 自定义导航栏 + 默认插槽
 */
const { buildPageShellStyle } = require('../../utils/page-layout')

Component({
  options: {
    multipleSlots: false,
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: false,
    },
    theme: {
      type: String,
      value: 'dark',
    },
    navColor: {
      type: String,
      value: '#ffffff',
    },
    navBg: {
      type: String,
      value: '#000000',
    },
    subpage: {
      type: Boolean,
      value: false,
    },
    navVariant: {
      type: String,
      value: 'default',
    },
    navSearch: {
      type: Boolean,
      value: false,
    },
    navThemeToggle: {
      type: Boolean,
      value: false,
    },
    brandName: {
      type: String,
      value: '',
    },
    navPromo: {
      type: Boolean,
      value: false,
    },
    promoLabel: {
      type: String,
      value: '推广活动',
    },
    logoSrc: {
      type: String,
      value: '/assets/brand/logo.png',
    },
    navAction: {
      type: Boolean,
      value: false,
    },
    navActionIcon: {
      type: String,
      value: '',
    },
    navActionLabel: {
      type: String,
      value: '',
    },
  },

  data: {
    layoutStyle: '',
  },

  lifetimes: {
    attached() {
      this.applyLayoutStyle()
    },
  },

  pageLifetimes: {
    show() {
      this.applyLayoutStyle()
    },
  },

  methods: {
    applyLayoutStyle() {
      this.setData({ layoutStyle: buildPageShellStyle() })
    },

    onNavSearchTap() {
      this.triggerEvent('search')
    },

    onNavThemeChange(e) {
      this.triggerEvent('themechange', e.detail)
    },

    onNavPromoTap() {
      this.triggerEvent('promo')
    },

    onNavActionTap() {
      this.triggerEvent('navaction')
    },
  },
})
