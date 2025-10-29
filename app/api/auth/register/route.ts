import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const supabase = await createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user record in users table
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: validatedData.email,
        phone: validatedData.phone,
        password_hash: '', // Auth handles this
        is_admin: false,
      }] as any)

    if (userError) {
      console.error('User record creation error:', userError)
      // Don't fail registration if user record fails
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
