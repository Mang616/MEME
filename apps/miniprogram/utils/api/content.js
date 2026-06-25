/**
 * CMS 文案缓存（协议、帮助、VIP 配置等）
 */
const { request } = require('./request')

const cache = new Map()
const tasks = new Map()

async function fetchContent(slug) {
  if (cache.has(slug)) return cache.get(slug)
  if (!tasks.has(slug)) {
    tasks.set(
      slug,
      request(`/content/${encodeURIComponent(slug)}`)
        .then((data) => {
          cache.set(slug, data)
          tasks.delete(slug)
          return data
        })
        .catch((err) => {
          tasks.delete(slug)
          throw err
        }),
    )
  }
  return tasks.get(slug)
}

function getCached(slug) {
  return cache.get(slug) || null
}

function resetContentCache() {
  cache.clear()
  tasks.clear()
}

module.exports = {
  fetchContent,
  getCached,
  resetContentCache,
}
