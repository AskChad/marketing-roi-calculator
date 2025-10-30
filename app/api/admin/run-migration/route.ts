import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

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

  try {
    const { migrationFile } = await request.json()

    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFile)
    const sql = await readFile(migrationPath, 'utf-8')

    // Execute SQL via Supabase RPC
    const { error } = await (supabase.rpc as any)('exec_sql', { sql_query: sql })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Migration executed successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
