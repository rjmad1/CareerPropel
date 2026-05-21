# API Contract: [Resource / Feature Name]

**Version**: v1  
**Status**: Draft | Stable | Deprecated  
**Owner**: [Name]  
**Last Updated**: YYYY-MM-DD  
**Technical Spec**: [TECH-number or N/A]

---

## Overview

<!-- What domain does this API serve? What is the high-level responsibility? -->

**Base path**: `/api/[resource]`  
**Authentication**: Required (NextAuth session cookie)  
**Authorization**: [Candidate-scoped / Admin-only / Public]

---

## Endpoints

### `GET /api/[resource]`

**Purpose**: [What this returns]

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `page` | `number` | No | Page number (default: 1) |
| `limit` | `number` | No | Items per page (default: 20, max: 100) |

**Response `200 OK`**:
```json
{
  "data": [
    {
      "id": "string",
      "field": "value"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

### `POST /api/[resource]`

**Purpose**: [What this creates/triggers]

**Request Body**:
```json
{
  "requiredField": "string",
  "optionalField": "string | undefined"
}
```

**Validation Rules**:
- `requiredField`: Required, non-empty string, max 255 chars
- `optionalField`: Optional, enum of `["value1", "value2"]`

**Response `201 Created`**:
```json
{
  "data": {
    "id": "cuid-string",
    "createdAt": "ISO-8601"
  }
}
```

**Idempotency**: [Is this idempotent? If yes, what key?]

---

### `PUT /api/[resource]/[id]`

**Purpose**: Full replacement update

**Ownership Check**: Verifies `resource.candidateId === session.user.id`

**Response `200 OK`**: Updated resource (same shape as GET single)

---

### `DELETE /api/[resource]/[id]`

**Purpose**: [Soft delete / hard delete]

**Ownership Check**: Yes

**Response `204 No Content`**

---

## Error Taxonomy

| HTTP Status | Code | When |
|---|---|---|
| `400 Bad Request` | `VALIDATION_ERROR` | Invalid input shape or value |
| `401 Unauthorized` | `UNAUTHENTICATED` | No valid session |
| `403 Forbidden` | `FORBIDDEN` | Session valid but user lacks access |
| `404 Not Found` | `NOT_FOUND` | Resource doesn't exist or user can't see it |
| `409 Conflict` | `CONFLICT` | Duplicate creation attempt |
| `422 Unprocessable` | `BUSINESS_RULE_VIOLATION` | Valid input but violates business logic |
| `429 Too Many Requests` | `RATE_LIMITED` | Rate limit exceeded |
| `500 Internal Error` | `INTERNAL_ERROR` | Unexpected server error (never expose details) |

**Error response shape**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": {}
  }
}
```

## Rate Limiting

- **Limit**: 100 requests / minute per authenticated user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Fail-open**: Rate limiter degrades gracefully if Redis unavailable (see DEBT-002)

## Versioning Strategy

- Current version: v1 (path prefix not yet used; implicit)
- Breaking changes require: new path version `/api/v2/[resource]` + deprecation notice
- Non-breaking additions (new optional fields) do not require versioning

## Changelog

| Date | Version | Change |
|---|---|---|
| YYYY-MM-DD | v1 | Initial contract |
