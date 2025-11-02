import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addDomainToVercel, checkDomainVerification } from '@/lib/vercel-api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
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

  try {
    const { brandId } = await params

    // Get brand
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single()

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const domain = (brand as any).domain
    const subdomain = (brand as any).subdomain

    // If it's a subdomain, we don't need to verify (wildcard handles it)
    if (!domain || domain.includes('localhost')) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Subdomain does not require verification',
      })
    }

    // Add domain to Vercel if not already added
    const addResult = await addDomainToVercel(domain)
    if (!addResult.success) {
      return NextResponse.json({
        success: false,
        error: addResult.error,
      }, { status: 500 })
    }

    // Check verification status
    const verificationResult = await checkDomainVerification(domain)

    // Update brand with verification status
    await (supabase
      .from('brands') as any)
      .update({
        domain_verified: verificationResult.verified,
        domain_verification_checked_at: new Date().toISOString(),
      })
      .eq('id', brandId)

    return NextResponse.json({
      success: true,
      verified: verificationResult.verified,
      dnsRecords: verificationResult.dnsRecords,
      error: verificationResult.error,
    })
  } catch (error: any) {
    console.error('Domain verification error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
