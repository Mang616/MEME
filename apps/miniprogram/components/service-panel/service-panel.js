/**
 * 首页护航/陪玩面板
 *
 * @property {Array}  tabs        normalizeTabs(SERVICE_TYPES)，含 id / label / tabImage
 * @property {string} activeType  escort | companion
 * @property {Array}  products    当前类型商品（mapProductForDisplay）
 *
 * @fires tabchange   detail.id
 * @fires producttap  detail 同 product-card
 */
const { SERVICE_TYPE } = require('../../utils/constants')
const { getTabChangeId } = require('../../utils/line-tabs')

Component({
  options: {
    virtualHost: true,
  },

  properties: {
    tabs: {
      type: Array,
      value: [],
    },
    activeType: {
      type: String,
      value: SERVICE_TYPE.ESCORT,
    },
    products: {
      type: Array,
      value: [],
    },
  },

  methods: {
    onTabTap(e) {
      const id = getTabChangeId(
        { detail: { id: e.currentTarget.dataset.id } },
        this.properties.activeType,
      )
      if (!id) return
      this.triggerEvent('tabchange', { id })
    },

    onProductTap(e) {
      this.triggerEvent('producttap', e.detail)
    },
  },
})
