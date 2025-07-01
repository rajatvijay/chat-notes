#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public')
const logoPath = path.join(publicDir, 'logo.png')

console.log('PWA Icon Generation from Logo')
console.log('=============================')
console.log('')

if (!fs.existsSync(logoPath)) {
  console.error('❌ logo.png not found in public folder')
  console.log('Please ensure logo.png is in the public/ directory')
  process.exit(1)
}

console.log('✅ Found logo.png')
console.log('')

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

console.log('Icon generation options:')
console.log('')
console.log('🔧 Option 1: Use online tools (Recommended)')
console.log('   1. Go to https://realfavicongenerator.net/')
console.log('   2. Upload logo.png')
console.log('   3. Download generated icons')
console.log('   4. Replace files in public/ folder')
console.log('')
console.log('🔧 Option 2: Use ImageMagick (if installed)')
console.log('   Run: npm run generate-icons:imagemagick')
console.log('')
console.log('🔧 Option 3: Use Sharp (requires installation)')
console.log('   Run: npm install sharp && npm run generate-icons:sharp')
console.log('')

// ImageMagick commands (if available)
console.log('ImageMagick Commands (copy and run manually):')
iconSizes.forEach(size => {
  console.log(`convert "${logoPath}" -resize ${size}x${size} "${path.join(publicDir, `icon-${size}x${size}.png`)}"`)
})

console.log('')
console.log('Required icon files:')
iconSizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`
  const exists = fs.existsSync(path.join(publicDir, filename))
  const status = exists ? '✅' : '❌'
  console.log(`${status} ${filename}`)
})

console.log('')
console.log('💡 Tip: For best quality, create icons manually or use professional tools')
console.log('    The logo will be automatically used for favicons and PWA icons once generated.')