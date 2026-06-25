const themedPage = require('../../behaviors/themed-page')
const { loadLegalPageState } = require('../../utils/legal-page')

Page({
  behaviors: themedPage,

  data: {
    title: '',
    summary: '',
    updatedAt: '',
    docKind: 'agreement',
    sections: [],
  },

  onLoad(options) {
    const type = options && options.type ? options.type : 'agreement'
    void loadLegalPageState(type).then((state) => this.setData(state))
  },
})
