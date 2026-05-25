/**
 * Shared typed error classes for route helpers and domain logic.
 * Typed status codes let consuming code inspect error.status without `as any` casts.
 */

export class NotFoundError extends Error {
  readonly status = 404;
  override readonly name = 'NotFoundError';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
