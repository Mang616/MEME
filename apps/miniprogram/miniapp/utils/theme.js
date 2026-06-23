/**
 * 主题管理：浅色 / 深色，主色淡绿 #d1ffbd，点缀红 #ff3b30
 * - 持久化到本地存储
 * - 同步 TabBar、窗口背景、globalData
 * - 通过订阅通知各页面 behavior 刷新
 */

const STORAGE_KEY = 'app_theme'

const THEME_LIGHT = 'light'
const THEME_DARK = 'dark'
const DEFAULT_THEME = THEME_DARK

/** @type {Record<string, { color: string, selectedColor: string, backgroundColor: string, borderStyle: string }>} */
const TAB_BAR_STYLE = {
  [THEME_LIGHT]: {
    color: 'rgba(0,0,0,0.45)',
    selectedColor: '#6db85a',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
  },
  [THEME_DARK]: {
    /* 未选中文案：避免 0.45 透明度在真机上过暗 */
    color: '#B8B8B8',
    selectedColor: '#d1ffbd',
    backgroundColor: '#000000',
    borderStyle: 'black',
  },
}

/** @type {Record<string, { navColor: string, navBg: string, windowBg: string }>} */
const THEME_TOKENS = {
  [THEME_LIGHT]: {
    navColor: '#111111',
    navBg: '#ffffff',
    windowBg: '#ffffff',
  },
  [THEME_DARK]: {
    navColor: '#ffffff',
    navBg: '#000000',
    windowBg: '#000000',
  },
}

const THEME_LABEL = {
  [THEME_LIGHT]: '浅色',
  [THEME_DARK]: '深色',
}

/** @type {Set<(theme: string) => void>} */
const subscribers = new Set()

function isValidTheme(theme) {
  return theme === THEME_LIGHT || theme === THEME_DARK
}

function normalizeTheme(theme) {
  return isValidTheme(theme) ? theme : DEFAULT_THEME
}

function getTheme() {
  try {
    const stored = wx.getStorageSync(STORAGE_KEY)
    if (isValidTheme(stored)) return stored
  } catch (err) {
    console.warn('[theme] read storage failed', err)
  }
  return DEFAULT_THEME
}

function getThemeTokens(theme) {
  return THEME_TOKENS[normalizeTheme(theme)]
}

function getNavStyle(theme) {
  const { navColor, navBg } = getThemeTokens(theme)
  return { navColor, navBg }
}

function syncGlobalTheme(theme) {
  try {
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.theme = theme
    }
  } catch (err) {
    /* App 未就绪时忽略 */
  }
}

/** 同步原生导航栏与右上角胶囊（custom 导航下仍生效） */
function applyNavigationBarColor(theme) {
  const resolved = normalizeTheme(theme)
  const { navBg } = getThemeTokens(resolved)
  const frontColor = resolved === THEME_DARK ? '#ffffff' : '#000000'

  try {
    wx.setNavigationBarColor({
      frontColor,
      backgroundColor: navBg,
      animation: { duration: 0, timingFunc: 'easeIn' },
    })
  } catch (err) {
    console.warn('[theme] setNavigationBarColor failed', err)
  }
}

function applyNativeChrome(theme) {
  const resolved = normalizeTheme(theme)
  const tabStyle = TAB_BAR_STYLE[resolved]
  const { windowBg } = getThemeTokens(resolved)

  applyNavigationBarColor(resolved)

  try {
    wx.setTabBarStyle(tabStyle)
  } catch (err) {
    /* 非 Tab 页或模拟器未就绪 */
  }

  try {
    require('./tab-bar').applyTabBarIcons(resolved)
  } catch (err) {
    console.warn('[theme] applyTabBarIcons failed', err)
  }

  try {
    wx.setBackgroundColor({
      backgroundColor: windowBg,
      backgroundColorTop: windowBg,
      backgroundColorBottom: windowBg,
    })
  } catch (err) {
    /* 部分基础库不支持，忽略 */
  }
}

function notify(theme) {
  subscribers.forEach((fn) => {
    try {
      fn(theme)
    } catch (err) {
      console.error('[theme] subscriber error', err)
    }
  })
}

/**
 * 启动时调用一次，从存储恢复并应用到原生壳层
 */
function initTheme() {
  const theme = getTheme()
  syncGlobalTheme(theme)
  applyNativeChrome(theme)
  return theme
}

/**
 * 切换主题并持久化
 */
function setTheme(theme) {
  const resolved = normalizeTheme(theme)
  if (resolved === getTheme()) {
    return resolved
  }

  wx.setStorageSync(STORAGE_KEY, resolved)
  syncGlobalTheme(resolved)
  applyNativeChrome(resolved)
  notify(resolved)
  return resolved
}

function getThemeLabel(theme) {
  return THEME_LABEL[normalizeTheme(theme)] || ''
}

function subscribe(fn) {
  if (typeof fn === 'function') subscribers.add(fn)
}

function unsubscribe(fn) {
  subscribers.delete(fn)
}

module.exports = {
  STORAGE_KEY,
  THEME_LIGHT,
  THEME_DARK,
  DEFAULT_THEME,
  isValidTheme,
  normalizeTheme,
  getTheme,
  getThemeTokens,
  getNavStyle,
  getThemeLabel,
  applyNavigationBarColor,
  initTheme,
  setTheme,
  subscribe,
  unsubscribe,
}
