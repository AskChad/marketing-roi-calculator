import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !(userData as any)?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get optional cache type from request body
    const body = await request.json().catch(() => ({}))
    const cacheType = body.cacheType || 'all' // 'all', 'path', or 'tag'

    let clearedItems: string[] = []

    // Clear Next.js cache based on type
    if (cacheType === 'all' || cacheType === 'path') {
      // Revalidate all major paths
      const pathsToClear = [
        '/',
        '/dashboard',
        '/admin',
        '/calculator',
        '/demo-calculator',
        '/roi-analytics',
        '/login',
        '/register',
      ]

      for (const path of pathsToClear) {
        try {
          revalidatePath(path)
          clearedItems.push(`path:${path}`)
        } catch (err) {
          console.error(`Error clearing path ${path}:`, err)
        }
      }

      // Also revalidate with layout option
      try {
        revalidatePath('/', 'layout')
        clearedItems.push('path:/ (layout)')
      } catch (err) {
        console.error('Error clearing root layout:', err)
      }
    }

    // Note: Next.js doesn't have a built-in way to clear all cache programmatically
    // The revalidatePath calls above will clear the cache for those specific routes
    // For Supabase query caching, we rely on the automatic cache invalidation

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      clearedItems,
      timestamp: new Date().toISOString(),
      note: 'Next.js cache has been revalidated for major routes. Supabase caching is handled automatically.'
    })

  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
