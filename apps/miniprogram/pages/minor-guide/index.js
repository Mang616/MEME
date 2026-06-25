const themedPage = require('../../behaviors/themed-page')
const { loadMinorGuidePageState } = require('../../utils/minor-guide-page')

Page({
  behaviors: themedPage,

  data: {
    title: '',
    summary: '',
    notice: '',
    updatedAt: '',
    sections: [],
  },

  onLoad() {
    void loadMinorGuidePageState().then((state) => this.setData(state))
  },
})
