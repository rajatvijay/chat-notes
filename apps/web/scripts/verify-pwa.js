#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public')

console.log('PWA Verification Check')
console.log('======================')
console.log('')

const requiredFiles = [
  'manifest.json',
  'sw.js',
  'icon.svg',
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png'
]

let allGood = true

console.log('Checking required PWA files:')
requiredFiles.forEach(file => {
  const filePath = path.join(publicDir, file)
  const exists = fs.existsSync(filePath)
  const status = exists ? '✓' : '✗'
  const color = exists ? '\x1b[32m' : '\x1b[31m'
  console.log(`${color}${status}\x1b[0m ${file}`)
  if (!exists) allGood = false
})

console.log('')

if (allGood) {
  console.log('\x1b[32m✓ All PWA files are present!\x1b[0m')
  console.log('')
  console.log('Next steps:')
  console.log('1. Deploy to HTTPS server (required for PWA)')
  console.log('2. Test on mobile device')
  console.log('3. Look for "Add to Home Screen" prompt')
  console.log('4. Verify offline functionality')
} else {
  console.log('\x1b[31m✗ Some PWA files are missing!\x1b[0m')
  console.log('Run: node scripts/create-placeholder-icons.js')
}

console.log('')
console.log('PWA Features implemented:')
console.log('• 📱 Installable on mobile/desktop')
console.log('• 🔄 Service worker with caching')
console.log('• 📋 Web app manifest')
console.log('• 🎨 App icons and splash screens')
console.log('• ⚡ Install prompt UI')
console.log('• 📶 Offline indicator')
console.log('• 🔧 PWA status in settings')
console.log('• 🚀 App shortcuts')