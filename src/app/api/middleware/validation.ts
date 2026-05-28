import { NextRequest, NextResponse } from 'next/server';
import { ZodTypeAny } from 'zod';
import { ValidationError, UnauthorizedError, ForbiddenError } from './auth';
import { ApiError } from '@/lib/errors/ApiError';

/**
 * Validate request body against Zod schema
 * Returns properly typed data based on schema
 */
export async function validateRequest<T extends ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<{ valid: true; data: T['_output'] } | { valid: false; error: ValidationError }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const details: Record<string, string[]> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(error.message);
      });
      return {
        valid: false,
        error: new ValidationError('Validation failed', details),
      };
    }

    return { valid: true, data: result.data };
  } catch (error) {
    return {
      valid: false,
      error: new ValidationError('Invalid request body'),
    };
  }
}

/**
 * Format validation error response
 */
export function validationErrorResponse(error: ValidationError) {
  return NextResponse.json(
    {
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
      },
    },
    { status: 400 }
  );
}

/**
 * Success response formatter
 */
export function successResponse(data: unknown, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Error response formatter
 */
export function errorResponse(error: unknown, statusCode: number = 500) {
  // Handle ApiError (thrown by getAuthContext and other lib/middleware utilities)
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }

  // Handle custom error classes via instanceof (safer than checking .name strings)
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: error.message || 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: error.message || 'Access denied',
        },
      },
      { status: 403 }
    );
  }

  if (error instanceof ValidationError) {
    // details is always present on ValidationError instances
    return validationErrorResponse(error);
  }

  const errObj = error as { message?: string };
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? errObj.message : 'Internal server error',
      },
    },
    { status: statusCode }
  );
}
