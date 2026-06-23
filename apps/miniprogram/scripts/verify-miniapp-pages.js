#!/usr/bin/env node
/**
 * 校验 miniapp app.json 中登记的每个页面是否具备 index.wxml / index.js
 * 用法：node apps/miniprogram/scripts/verify-miniapp-pages.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { resolveMiniprogramRoot } from './resolve-miniprogram-root.js'

const root = resolveMiniprogramRoot()
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const pages = app.pages || []

let failed = 0
pages.forEach((pagePath) => {
  const wxml = path.join(root, `${pagePath}.wxml`)
  const js = path.join(root, `${pagePath}.js`)
  if (!fs.existsSync(wxml)) {
    console.error('MISSING WXML:', pagePath)
    failed += 1
  }
  if (!fs.existsSync(js)) {
    console.error('MISSING JS:', pagePath)
    failed += 1
  }
})

if (failed === 0) {
  console.log(`OK: ${pages.length} pages verified at ${root}`)
  process.exit(0)
}

console.error(`\n${failed} issue(s). Fix app.json or add page files.`)
process.exit(1)
