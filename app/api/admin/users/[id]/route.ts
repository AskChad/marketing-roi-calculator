import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  is_admin: z.boolean().optional(),
})

/**
 * PATCH /api/admin/users/[id]
 * Update user details (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = (userData as any)?.is_admin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Prepare update data
    const updateData: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string | null
      is_admin?: boolean
    } = {}
    if (validatedData.firstName !== undefined) updateData.first_name = validatedData.firstName
    if (validatedData.lastName !== undefined) updateData.last_name = validatedData.lastName
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.is_admin !== undefined) updateData.is_admin = validatedData.is_admin

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      // @ts-ignore - Supabase type inference issue
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user: ' + updateError.message },
        { status: 500 }
      )
    }

    // Also update the corresponding lead_capture entry if name was changed
    if ((validatedData.firstName !== undefined || validatedData.lastName !== undefined) && (updatedUser as any)?.email) {
      const leadUpdateData: {
        first_name?: string
        last_name?: string
      } = {}
      if (validatedData.firstName !== undefined) leadUpdateData.first_name = validatedData.firstName
      if (validatedData.lastName !== undefined) leadUpdateData.last_name = validatedData.lastName

      await supabase
        .from('lead_captures')
        // @ts-ignore
        .update(leadUpdateData)
        .eq('email', (updatedUser as any).email)
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
