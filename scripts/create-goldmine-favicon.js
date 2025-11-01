/**
 * Create Goldmine AI favicon from logo
 * Run with: node scripts/create-goldmine-favicon.js
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const https = require('https')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath)
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close()
        resolve()
      })
      fileStream.on('error', reject)
    }).on('error', reject)
  })
}

async function createFavicon() {
  console.log('📥 Downloading Goldmine AI logo...')

  const logoUrl = 'https://goldmine-ai-website.vercel.app/Main_Logos_Icons/GoldMineAI.png'
  const tempLogo = '/tmp/goldmine-logo.png'
  const faviconSizes = [16, 32, 48]

  await downloadImage(logoUrl, tempLogo)
  console.log('✅ Logo downloaded')

  // Create public directory for brands if it doesn't exist
  const publicBrandsDir = path.join(process.cwd(), 'public', 'brands', 'goldmine')
  if (!fs.existsSync(publicBrandsDir)) {
    fs.mkdirSync(publicBrandsDir, { recursive: true })
    console.log('📁 Created brands directory')
  }

  console.log('🔄 Creating favicon sizes...')

  // Create multiple sizes for ICO (16x16, 32x32, 48x48)
  const pngPromises = faviconSizes.map(async (size) => {
    const outputPath = path.join(publicBrandsDir, `favicon-${size}x${size}.png`)
    await sharp(tempLogo)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath)
    console.log(`  ✓ Created ${size}x${size} favicon`)
    return outputPath
  })

  await Promise.all(pngPromises)

  // Also create a standard 32x32 favicon.ico
  const icoPath = path.join(publicBrandsDir, 'favicon.ico')
  await sharp(tempLogo)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFormat('png')
    .toFile(icoPath)

  console.log(`  ✓ Created favicon.ico`)

  // Create logo at standard size (256x256)
  const logoPath = path.join(publicBrandsDir, 'logo.png')
  await sharp(tempLogo)
    .resize(256, 256, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(logoPath)

  console.log(`  ✓ Created logo.png (256x256)`)

  console.log('\n✅ All favicon files created successfully!')
  console.log(`\nFiles saved to: ${publicBrandsDir}`)
  console.log('  - favicon.ico (32x32)')
  console.log('  - favicon-16x16.png')
  console.log('  - favicon-32x32.png')
  console.log('  - favicon-48x48.png')
  console.log('  - logo.png (256x256)')

  // Update the brand record with the new favicon URL
  console.log('\n🔄 Updating brand record...')

  const faviconUrl = '/brands/goldmine/favicon.ico'
  const logoUrl256 = '/brands/goldmine/logo.png'

  const { data, error } = await supabase
    .from('brands')
    .update({
      favicon_url: faviconUrl,
      logo_url: logoUrl256
    })
    .eq('subdomain', 'goldmine')
    .select()

  if (error) {
    console.error('❌ Error updating brand:', error)
  } else {
    console.log('✅ Brand record updated successfully!')
    console.log('  - Favicon URL:', faviconUrl)
    console.log('  - Logo URL:', logoUrl256)
  }

  // Clean up temp file
  fs.unlinkSync(tempLogo)
}

createFavicon().catch(console.error)
