/**
 * Create Goldmine AI brand in the database
 * Run with: node scripts/create-goldmine-brand.js
 */

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

console.log('Goldmine AI Brand Data:')
console.log(JSON.stringify(brandData, null, 2))
console.log('\nTo create this brand, use the admin panel at /admin or make a POST request to /api/admin/brands')

module.exports = brandData
