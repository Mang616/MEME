/**
 * 列表空态（订单 / 聊天 / 商品 / 优惠券等共用）
 *
 * size:
 *   default — 全页列表（订单、聊天、搜索）
 *   compact — 卡片内、弹层内
 *   mini    — 首页服务面板等小区域
 */
const { EMPTY_STATE_IMAGE, normalizeEmptySize } = require('../../utils/empty-state')

Component({
  properties: {
    image: {
      type: String,
      value: EMPTY_STATE_IMAGE,
    },
    text: {
      type: String,
      value: '暂无数据',
    },
    hint: {
      type: String,
      value: '',
    },
    size: {
      type: String,
      value: 'default',
    },
  },

  data: {
    sizeClass: '',
  },

  lifetimes: {
    attached() {
      this._applySize(this.properties.size)
    },
  },

  observers: {
    size(size) {
      this._applySize(size)
    },
  },

  methods: {
    _applySize(size) {
      const normalized = normalizeEmptySize(size)
      this.setData({
        sizeClass: normalized === 'default' ? '' : `list-empty--${normalized}`,
      })
    },
  },
})
