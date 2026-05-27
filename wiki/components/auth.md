# Authentication & Security

## Purpose

Authentication, session management, two-factor authentication, API key management, and request authorization for CareerPropel.

## Responsibilities

- Authenticate users via NextAuth v4 (session-based)
- Enforce TOTP-based two-factor authentication
- Issue and validate API keys for programmatic access
- Authorize API route access via session checks
- Log security-sensitive operations to audit log
- Detect and record threat events

## Dependencies

- `next-auth` — session and auth provider framework
- `speakeasy` — TOTP generation and verification
- `qrcode` — QR code generation for 2FA setup
- `@prisma/client` — user and session persistence
- `src/lib/logging/auditLog` — audit trail

## Public Interfaces

### Auth Middleware (`src/lib/middleware/auth.ts`)

```typescript
getAuthSession(): Promise<Session>
requireAuth(request: NextRequest): Promise<Session>
checkOwnership(userId: string, resourceOwnerId: string): void
getUserIdFromSession(session: any): string
getAuthContext(): Promise<{ userId, userEmail, session }>
```

`requireAuth` is the standard guard for protected API routes. Throws `ApiErrors.UNAUTHORIZED()` if no valid session.

`checkOwnership` throws `ApiErrors.FORBIDDEN('resource')` if `userId !== resourceOwnerId`.

### 2FA (`src/lib/security/twoFactor.ts`)

Setup flow:
1. `POST /api/auth/2fa/setup` — generate TOTP secret + QR code URI
2. User scans QR in authenticator app
3. `POST /api/auth/2fa/enable` — verify TOTP token, activate 2FA on account

### API Keys (`src/lib/security/apiKey.ts`)

```typescript
generateApiKey(): string
hashApiKey(key: string): string
validateApiKey(key: string): Promise<boolean>
```

- Keys are generated as random hex strings
- Only the SHA-256 hash is stored in DB
- Validation: hash incoming key → compare to stored hashes

API key management: `GET /api/api-keys`, `POST /api/api-keys`

### Error Codes (`src/lib/errors/ApiError.ts`)

```typescript
ApiErrors.UNAUTHORIZED()    // 401
ApiErrors.FORBIDDEN(resource)  // 403
ApiErrors.NOT_FOUND(resource)  // 404
ApiErrors.VALIDATION(message)  // 400
ApiErrors.INTERNAL()           // 500
```

### Audit Log (`src/lib/logging/auditLog.ts`)

Writes structured records to `AuditLog` DB table. Called for:
- Authentication events
- 2FA enable/disable
- API key creation/deletion
- Admin operations
- Security threat events

### Admin Endpoints

| Endpoint | Auth Required | Purpose |
|---|---|---|
| `GET /api/admin/users` | Admin session | User management |
| `GET /api/admin/threats` | Admin session | Security threat log |

## Internal Flow

### Standard Request Authorization

```
API Route handler
  → requireAuth(request)
       → getServerSession()
       → if no session → throw UNAUTHORIZED
  → getUserIdFromSession(session)
  → ... business logic ...
  → checkOwnership(userId, resource.userId)
       → if mismatch → throw FORBIDDEN
```

### 2FA Setup

```
POST /api/auth/2fa/setup
  → require authenticated session
  → speakeasy.generateSecret()
  → store secret (encrypted) on user record
  → return { qrCodeUri, secret }

POST /api/auth/2fa/enable
  → require authenticated session
  → speakeasy.totp.verify({ secret, token })
  → if valid → set user.twoFactorEnabled = true
  → write audit log entry
```

## Configuration

| Env Var | Purpose |
|---|---|
| `NEXTAUTH_URL` | Auth callback base URL |
| `NEXTAUTH_SECRET` | JWT signing secret (must be strong random value) |

## Failure Modes

| Failure | Behavior |
|---|---|
| No session | `UNAUTHORIZED` (401) |
| Session user mismatch | `FORBIDDEN` (403) |
| Invalid 2FA token | 400 error; max attempts should be enforced at route level |
| API key not found | `UNAUTHORIZED` (401) |

## Security Considerations

- Sessions use NextAuth JWT — `NEXTAUTH_SECRET` rotation requires all sessions to re-authenticate
- TOTP secrets should be stored encrypted at rest
- API keys stored as SHA-256 hash only; plaintext never persisted
- `requireAuth` is the gate — any route missing this call is unauthenticated

## Validation Required

The following behavior could not be fully verified from static analysis:
- Whether TOTP secrets are encrypted at rest in the DB
- Whether brute-force protection exists on 2FA verify endpoint
- Whether admin endpoint role check is enforced beyond session presence

## Related Components

- [Agent System](agent-system.md) — userId propagated through execution
- [Audit Log](../runbooks/ops-runbook.md)

## Last Updated
2026-05-27
