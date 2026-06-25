const themedPage = require('../../behaviors/themed-page')
const { buildSearchPageState } = require('../../utils/catalog')
const { openProductFromEvent, openOrderCreateFromEvent } = require('../../utils/nav')
const { withCatalog } = require('../../utils/page-data')

Page({
  behaviors: themedPage,

  data: {
    keyword: '',
    products: [],
    hasKeyword: false,
    resultCount: 0,
    emptyText: '输入关键词搜索全部商品',
    resultHint: '',
    focusInput: true,
  },

  onLoad(options) {
    const keyword = options.keyword ? decodeURIComponent(options.keyword) : ''
    withCatalog(() => {
      this.setData({
        ...buildSearchPageState(keyword),
        focusInput: true,
      })
    })
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onConfirm(e) {
    this.applySearch(e.detail.value)
  },

  onClear() {
    this.setData({ keyword: '' })
    this.applySearch('')
  },

  applySearch(keyword) {
    this.setData(buildSearchPageState(keyword))
  },

  onProductTap(e) {
    openProductFromEvent(e)
  },

  onBuy(e) {
    openOrderCreateFromEvent(e)
  },
})
