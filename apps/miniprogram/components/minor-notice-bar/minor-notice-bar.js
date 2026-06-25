/**
 * 未成年人下单提示条
 * @property {string} text 提示文案
 * @fires closetap 点击右侧关闭，由页面弹出年龄确认
 */
const { minorOrderNotice } = require('../../utils/config')

Component({
  properties: {
    text: {
      type: String,
      value: minorOrderNotice,
    },
  },

  methods: {
    onCloseTap() {
      this.triggerEvent('closetap', {}, { bubbles: true, composed: true })
    },
  },
})
