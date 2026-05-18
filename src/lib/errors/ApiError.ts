export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public internalError?: Error | unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toJSON(includeDetails = false): ApiErrorResponse {
    const isDevelopment = process.env.NODE_ENV === 'development'

    return {
      error: {
        code: this.code,
        message: this.message,
        ...(isDevelopment && includeDetails && this.internalError
          ? {
              details: {
                internal: String(this.internalError),
                stack: this.internalError instanceof Error ? this.internalError.stack : undefined,
              },
            }
          : {}),
      },
    }
  }

  log(): void {
    console.error(`[${this.code}] ${this.message}`, {
      statusCode: this.statusCode,
      internalError: this.internalError,
      stack: this.stack,
    })
  }
}

export const ApiErrors = {
  VALIDATION_ERROR: (details: string) =>
    new ApiError(
      400,
      'VALIDATION_ERROR',
      `Request validation failed: ${details}`
    ),

  UNAUTHORIZED: () =>
    new ApiError(
      401,
      'UNAUTHORIZED',
      'You must be logged in to access this resource'
    ),

  FORBIDDEN: (resource = 'resource') =>
    new ApiError(
      403,
      'FORBIDDEN',
      `You do not have permission to access this ${resource}`
    ),

  NOT_FOUND: (resource = 'resource') =>
    new ApiError(
      404,
      'NOT_FOUND',
      `The requested ${resource} was not found`
    ),

  CONFLICT: (details: string) =>
    new ApiError(
      409,
      'CONFLICT',
      `Conflict: ${details}`
    ),

  RATE_LIMIT: () =>
    new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.'
    ),

  INTERNAL_ERROR: (internalError?: Error | unknown) =>
    new ApiError(
      500,
      'INTERNAL_ERROR',
      'An unexpected error occurred. Please try again later.',
      internalError
    ),

  DATABASE_ERROR: (internalError?: Error | unknown) =>
    new ApiError(
      500,
      'DATABASE_ERROR',
      'A database error occurred. Please try again later.',
      internalError
    ),

  INVALID_REQUEST: (details: string) =>
    new ApiError(
      400,
      'INVALID_REQUEST',
      `Invalid request: ${details}`
    ),
}
