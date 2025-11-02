import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface VercelDNSConfig {
  name: string
  apexName: string
  projectId: string
  redirect: string | null
  redirectStatusCode: number | null
  cnames?: string[]
  aValues?: string[]
  conflicts?: any[]
  acceptedChallenges?: any[]
  misconfigured: boolean
  serviceType?: string
  cNameStatus?: string
  ipStatus?: string
  recommendedIPv4?: Array<{ rank: number; value: string[] }>
  recommendedCNAME?: Array<{ rank: number; value: string }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!(userData as any)?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get brand
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('domain')
      .eq('id', params.brandId)
      .single()

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const domain = (brand as any).domain
    if (!domain) {
      return NextResponse.json({ error: 'No domain configured for this brand' }, { status: 400 })
    }

    // Fetch DNS config from Vercel
    const vercelToken = process.env.VERCEL_TOKEN
    if (!vercelToken) {
      return NextResponse.json({ error: 'VERCEL_TOKEN not configured' }, { status: 500 })
    }

    const vercelResponse = await fetch(
      `https://api.vercel.com/v6/domains/${domain}/config?teamId=team_KzpYM41aHOiRDBCR2b2xdUAC`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    )

    if (!vercelResponse.ok) {
      const error = await vercelResponse.text()
      console.error('Vercel API error:', error)
      return NextResponse.json({
        error: 'Failed to fetch DNS config from Vercel',
        details: error
      }, { status: vercelResponse.status })
    }

    const dnsConfig: VercelDNSConfig = await vercelResponse.json()

    // Determine domain type and DNS instructions
    const isApexDomain = domain === dnsConfig.apexName
    const isWildcard = domain.startsWith('*.')

    let dnsInstructions

    if (isWildcard) {
      // Wildcard domains need nameservers method
      dnsInstructions = {
        type: 'wildcard',
        message: 'Wildcard domains require nameserver configuration',
        instructions: 'Contact your DNS provider to configure nameservers for this wildcard domain'
      }
    } else if (isApexDomain) {
      // Apex domain - needs A record
      const recommendedIP = dnsConfig.recommendedIPv4?.[0]?.value?.[0] || '76.76.21.21'
      dnsInstructions = {
        type: 'A',
        recordType: 'A',
        name: '@',
        value: recommendedIP,
        message: `Add an A record pointing to ${recommendedIP}`,
        ttl: 3600
      }
    } else {
      // Subdomain - needs CNAME
      const recommendedCNAME = dnsConfig.recommendedCNAME?.[0]?.value || 'cname.vercel-dns.com'
      const cleanCNAME = recommendedCNAME.replace(/\.$/, '') // Remove trailing dot
      dnsInstructions = {
        type: 'CNAME',
        recordType: 'CNAME',
        name: domain.replace(`.${dnsConfig.apexName}`, ''),
        value: cleanCNAME,
        message: `Add a CNAME record pointing to ${cleanCNAME}`,
        ttl: 3600
      }
    }

    return NextResponse.json({
      success: true,
      domain,
      apexName: dnsConfig.apexName,
      isApexDomain,
      isWildcard,
      dnsInstructions,
      misconfigured: dnsConfig.misconfigured,
      vercelConfig: {
        cnames: dnsConfig.cnames,
        aValues: dnsConfig.aValues,
        recommendedIPv4: dnsConfig.recommendedIPv4,
        recommendedCNAME: dnsConfig.recommendedCNAME,
        ipStatus: dnsConfig.ipStatus,
        cNameStatus: dnsConfig.cNameStatus,
      }
    })

  } catch (error) {
    console.error('Error fetching DNS config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DNS configuration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
