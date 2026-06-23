/**
 * 解析小程序根目录（兼容本地 Esports 与 MEME monorepo）
 *
 * MEME 仓库：https://github.com/Mang616/MEME
 * 小程序路径：apps/miniprogram/miniapp/
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..', '..', '..')

const CANDIDATES = [
  process.env.MINIPROGRAM_ROOT,
  path.join(REPO_ROOT, 'apps', 'miniprogram', 'miniapp'),
  path.join(REPO_ROOT, 'apps', 'miniprogram'),
  path.join(REPO_ROOT, 'miniapp'),
].filter(Boolean)

function hasMiniProgramRoot(dir) {
  return fs.existsSync(path.join(dir, 'app.json'))
}

export function resolveMiniprogramRoot() {
  for (const dir of CANDIDATES) {
    const resolved = path.resolve(dir)
    if (hasMiniProgramRoot(resolved)) return resolved
  }
  return path.join(REPO_ROOT, 'apps', 'miniprogram', 'miniapp')
}

export { REPO_ROOT }
