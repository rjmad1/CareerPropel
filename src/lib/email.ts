/**
 * Email service using Resend.
 *
 * Required env vars:
 *   RESEND_API_KEY  — from resend.com (get a free key at https://resend.com)
 *   RESEND_FROM_EMAIL — sender address (default: noreply@careerpropel.app)
 *
 * If RESEND_API_KEY is not set, emails are logged to console instead (safe for dev).
 */

import { Resend } from 'resend'

const from = process.env.RESEND_FROM_EMAIL || 'CareerPropel <noreply@careerpropel.app>'
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.log(`[Email] No RESEND_API_KEY — would send "${subject}" to ${to}`)
    console.log(`[Email] Body (first 200 chars): ${html.slice(0, 200)}`)
    return
  }
  const { error } = await resend.emails.send({ from, to, subject, html })
  if (error) {
    console.error('[Email] Send failed:', error)
    throw new Error(`Email send failed: ${error.message}`)
  }
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const link = `${baseUrl}/verify-email?token=${token}`
  await sendEmail(
    to,
    'Verify your CareerPropel email',
    `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Welcome, ${name}!</h2>
      <p>Click the link below to verify your email address. The link expires in 1 hour.</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="color:#6b7280;font-size:13px;margin-top:24px">If you didn't create a CareerPropel account, you can ignore this email.</p>
    </div>`
  )
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const link = `${baseUrl}/reset-password?token=${token}`
  await sendEmail(
    to,
    'Reset your CareerPropel password',
    `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Password reset request</h2>
      <p>Hi ${name}, click the link below to reset your password. The link expires in 1 hour.</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="color:#6b7280;font-size:13px;margin-top:24px">If you didn't request a password reset, you can ignore this email — your password won't change.</p>
    </div>`
  )
}
