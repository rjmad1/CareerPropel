import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { ValidationError } from './auth';

/**
 * Validate request body against Zod schema
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema
): Promise<{ valid: true; data: T } | { valid: false; error: ValidationError }> {
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

    return { valid: true, data: result.data as T };
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
 * Format error response
 */
export function errorResponse(error: any, statusCode: number = 500) {
  console.error('API Error:', error);

  if (error.name === 'UnauthorizedError') {
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

  if (error.name === 'ForbiddenError') {
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

  if (error.name === 'ValidationError') {
    return validationErrorResponse(error);
  }

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      },
    },
    { status: statusCode }
  );
}

/**
 * Success response formatter
 */
export function successResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}
