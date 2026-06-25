const themedPage = require('../../behaviors/themed-page')
const { buildMinorGuidePageState } = require('../../utils/minor-guide-page')

Page({
  behaviors: themedPage,

  data: buildMinorGuidePageState(),
})
