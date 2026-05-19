import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = registerSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.candidate.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      throw ApiErrors.CONFLICT('An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationTokenExp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.candidate.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationTokenExp,
      },
    })

    // Fire-and-forget — don't fail registration if email send fails
    sendVerificationEmail(normalizedEmail, name, emailVerificationToken).catch((err) =>
      console.error('[Register] Email send failed:', err)
    )

    return successResponse(
      { message: 'Account created. Check your email to verify your address.' },
      201
    )
  } catch (error) {
    return errorResponse(error)
  }
}
