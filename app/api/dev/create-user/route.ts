import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be DOCTOR, RECEPTIONIST, or ADMIN' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as Role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

