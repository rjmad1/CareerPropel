import { NextResponse } from 'next/server'
import { ApiError, ApiErrorResponse } from '@/lib/errors/ApiError'
import { ZodError } from 'zod'

/**
 * Standardized API Response Helper
 * Ensures all responses follow the same format
 */

export interface SuccessResponse<T> {
  data: T
  success: true
}

/**
 * Handle successful responses
 */
export function successResponse<T>(
  data: T,
  statusCode = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ data, success: true }, { status: statusCode })
}

/**
 * Handle error responses
 */
export function errorResponse(
  error: ApiError | Error | unknown,
  statusCode?: number
): NextResponse<ApiErrorResponse> {
  let apiError: ApiError

  // Convert different error types to ApiError
  if (error instanceof ApiError) {
    apiError = error
  } else if (error instanceof ZodError) {
    // Handle Zod validation errors
    const fieldErrors = error.flatten().fieldErrors
    const message = Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${errors?.[0] || 'Invalid'}`)
      .join(', ')
    apiError = new ApiError(400, 'VALIDATION_ERROR', message)
  } else if (error instanceof Error) {
    apiError = new ApiError(500, 'INTERNAL_ERROR', error.message, error)
  } else {
    apiError = new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred')
  }

  // Log the error
  apiError.log()

  // Use provided statusCode or from ApiError
  const responseStatus = statusCode || apiError.statusCode

  return NextResponse.json(apiError.toJSON(true), { status: responseStatus })
}

/**
 * Wrapper for try-catch error handling
 * Usage in route handlers:
 *   try {
 *     const result = await doSomething()
 *     return successResponse(result)
 *   } catch (error) {
 *     return errorResponse(error)
 *   }
 */
export async function handleApiRequest<T>(
  handler: () => Promise<T>,
  successStatus = 200
): Promise<NextResponse<SuccessResponse<T> | ApiErrorResponse>> {
  try {
    const result = await handler()
    return successResponse(result, successStatus)
  } catch (error) {
    return errorResponse(error)
  }
}
