import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { can } from '@/lib/security/authorization/authorizationService'
import AdminShell from './AdminShell'

export const metadata = { title: 'Admin Console — CareerPropel' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login?callbackUrl=/admin')

  const hasAccess = await can(session.user.email, 'system.admin.access', {
    actorId: session.user.id,
    skipAuditLog: true,
  })
  if (!hasAccess) redirect('/?error=forbidden')

  return <AdminShell email={session.user.email}>{children}</AdminShell>
}
