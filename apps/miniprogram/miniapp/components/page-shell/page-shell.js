/**
 * 统一页面壳：主题容器 + 自定义导航栏 + 默认插槽
 *
 * navVariant:
 *   default — 居中标题 + 左操作（返回/搜索/主题）
 *   home    — 仅首页：Logo、品牌名、推广按钮
 */
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

  methods: {
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
