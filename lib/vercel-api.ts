/**
 * Vercel API client for domain management
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID // Optional

if (!VERCEL_TOKEN) {
  console.error('[VERCEL API] VERCEL_TOKEN environment variable is not set')
}

if (!VERCEL_PROJECT_ID) {
  console.error('[VERCEL API] VERCEL_PROJECT_ID environment variable is not set')
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (VERCEL_TOKEN) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${VERCEL_TOKEN}`
  }
  return headers
}

export interface VercelDomain {
  name: string
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
}

/**
 * Add a domain to Vercel project
 */
export async function addDomainToVercel(domain: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const url = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: domain }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Domain might already exist
      if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_exists') {
        return { success: true, data: { name: domain, verified: false } }
      }
      return { success: false, error: data.error?.message || 'Failed to add domain' }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get domain configuration from Vercel
 */
export async function getVercelDomain(domain: string): Promise<{ success: boolean; data?: VercelDomain; error?: string }> {
  try {
    const url = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.error?.message || 'Failed to get domain' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Check domain verification status
 */
export async function checkDomainVerification(domain: string): Promise<{
  verified: boolean
  error?: string
  dnsRecords?: Array<{ type: string; name: string; value: string }>
}> {
  const result = await getVercelDomain(domain)

  if (!result.success) {
    return { verified: false, error: result.error }
  }

  const domainData = result.data!

  return {
    verified: domainData.verified,
    dnsRecords: domainData.verification?.map(v => ({
      type: v.type,
      name: v.domain,
      value: v.value,
    })),
  }
}

/**
 * Remove domain from Vercel project
 */
export async function removeDomainFromVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.error?.message || 'Failed to remove domain' }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
