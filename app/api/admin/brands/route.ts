import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all brands (admin only)
export async function GET() {
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

  // Fetch all brands
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(brands)
}

// POST create new brand (admin only)
export async function POST(request: Request) {
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

  const body = await request.json()

  console.log('Creating new brand with data:', body)

  // Insert brand
  const { data: brand, error } = await (supabase
    .from('brands') as any)
    .insert([body])
    .select()
    .single()

  if (error) {
    console.error('Brand creation error:', error)
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }

  console.log('Brand created successfully:', brand)
  return NextResponse.json(brand)
}

// PUT update brand (admin only)
export async function PUT(request: Request) {
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

  const body = await request.json()
  const { id, ...updates } = body

  console.log('Updating brand:', id, 'with updates:', updates)

  // Update brand
  const { data: brand, error } = await (supabase
    .from('brands') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Brand update error:', error)
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }

  console.log('Brand updated successfully:', brand)
  return NextResponse.json(brand)
}
