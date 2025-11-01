/**
 * Insert Goldmine AI brand directly into Supabase database
 * Run with: node scripts/insert-goldmine-brand.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const brandData = {
  // Identity
  name: 'Goldmine AI',
  domain: 'goldmineai.com',
  subdomain: 'goldmine',
  is_active: true,

  // Theme Colors
  color_primary: '#d39c32', // Golden/mustard brown from logo
  color_secondary: '#1e3a8a', // Professional blue
  color_accent: '#d39c32', // Same as primary (golden)
  color_success: '#10B981', // Keep default green
  color_error: '#EF4444', // Keep default red

  // Branding Assets
  logo_url: 'https://goldmine-ai-website.vercel.app/Main_Logos_Icons/GoldMineAI.svg',
  favicon_url: 'https://goldmine-ai-website.vercel.app/favicon.ico',

  // Landing Page Copy
  hero_title: 'Recover Revenue From Lost Leads',
  hero_subtitle: 'AI-powered sales agent that re-engages cold leads using voice and SMS. Operate 24/7 to recover missed sales opportunities.',
  hero_cta_text: 'Start Recovering Revenue',
  hero_secondary_cta_text: 'See How It Works',

  // Features Section
  feature_1_title: 'AI Voice & SMS',
  feature_1_description: 'Conversational AI that reaches out via text and realistic voice calls',
  feature_2_title: '24/7 Lead Recovery',
  feature_2_description: 'Automatically re-engage dormant leads without additional staff',
  feature_3_title: 'Database Reactivation',
  feature_3_description: 'Turn cold leads into hot opportunities with intelligent follow-up',

  // Footer & Legal
  company_name: 'Goldmine AI',
  support_email: 'support@goldmineai.com',
}

async function insertBrand() {
  console.log('Inserting Goldmine AI brand...\n')

  const { data, error } = await supabase
    .from('brands')
    .insert([brandData])
    .select()
    .single()

  if (error) {
    console.error('Error inserting brand:', error)
    process.exit(1)
  }

  console.log('✅ Brand created successfully!')
  console.log('\nBrand Details:')
  console.log(JSON.stringify(data, null, 2))
  console.log('\nBrand ID:', data.id)
  console.log('Domain:', data.domain)
  console.log('Subdomain:', data.subdomain)
}

insertBrand()
