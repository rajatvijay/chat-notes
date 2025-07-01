#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple blue 1x1 PNG as base64 (for placeholder)
const bluePNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]
const publicDir = path.join(__dirname, '..', 'public')

console.log('Creating placeholder PWA icons...')

iconSizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`
  const filepath = path.join(publicDir, filename)
  
  fs.writeFileSync(filepath, bluePNG)
  console.log(`Created placeholder: ${filename}`)
})

console.log('')
console.log('Placeholder icons created successfully!')
console.log('Note: These are minimal placeholders for PWA functionality.')
console.log('For production, replace with proper icons using:')
console.log('- icon.svg as source')
console.log('- Online tools like realfavicongenerator.net')
console.log('- Or the generate-icons.js script with Sharp installed')