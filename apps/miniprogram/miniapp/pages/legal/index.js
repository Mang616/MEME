const themedPage = require('../../behaviors/themed-page')
const { buildLegalPageState } = require('../../utils/legal-page')

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
    this.setData(buildLegalPageState(type))
  },
})
