/**
 * 价格展示字体 PriceItalic（可选）
 * - Skyline 仅支持 https 或 Data URL，包内 ttf 需 readFile → base64
 * - 字库过大时 loadFontFace 易触发 timeout，超过阈值则仅用 CSS 斜体 + 系统字体回退
 */

const FONT_FAMILY = 'PriceItalic'
const FONT_PATH = '/assets/fonts/price-italic.ttf'
/** 超过该体积的 ttf 不再走 Data URL（当前 price-italic.ttf ~115KB 会跳过） */
const MAX_FONT_BYTES = 48 * 1024
const LOAD_DEFER_MS = 400
const LOAD_TIMEOUT_MS = 6000

let priceFontLoaded = false
let priceFontSkipped = false
let priceFontLoading = null

function loadPriceFont() {
  if (priceFontLoaded || priceFontSkipped) {
    return Promise.resolve()
  }
  if (priceFontLoading) {
    return priceFontLoading
  }

  priceFontLoading = new Promise((resolve) => {
    const fs = wx.getFileSystemManager()
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      priceFontLoading = null
      resolve()
    }

    const timer = setTimeout(() => {
      priceFontSkipped = true
      console.warn('[font] PriceItalic load timeout, use system italic fallback')
      done()
    }, LOAD_TIMEOUT_MS)

    fs.readFile({
      filePath: FONT_PATH,
      encoding: 'base64',
      success: (res) => {
        const approxBytes = Math.floor((res.data || '').length * 3 / 4)
        if (approxBytes > MAX_FONT_BYTES) {
          priceFontSkipped = true
          console.warn(
            `[font] skip PriceItalic (${approxBytes}B > ${MAX_FONT_BYTES}B), use system italic fallback`,
          )
          done()
          return
        }

        wx.loadFontFace({
          family: FONT_FAMILY,
          source: `url("data:font/ttf;base64,${res.data}")`,
          global: true,
          scopes: ['skyline'],
          success: () => {
            priceFontLoaded = true
            done()
          },
          fail: (err) => {
            priceFontSkipped = true
            console.warn('[font] load PriceItalic failed', err)
            done()
          },
        })
      },
      fail: (err) => {
        priceFontSkipped = true
        console.warn('[font] read font file failed', err)
        done()
      },
    })
  })

  return priceFontLoading
}

/** 延迟加载，避免 onLaunch 阶段阻塞或触发 WAService timeout */
function scheduleLoadPriceFont() {
  setTimeout(() => {
    loadPriceFont().catch(() => {})
  }, LOAD_DEFER_MS)
}

module.exports = {
  loadPriceFont,
  scheduleLoadPriceFont,
  FONT_FAMILY,
}
