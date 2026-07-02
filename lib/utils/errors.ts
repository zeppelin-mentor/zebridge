export class ZeBridgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ZeBridgeError'
  }
}

export class AuthenticationError extends ZeBridgeError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401)
  }
}

export class RateLimitError extends ZeBridgeError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429)
  }
}

export class ValidationError extends ZeBridgeError {
  constructor(message: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ZeBridgeError) {
    return {
      error: error.message,
      code: error.code,
      details: error instanceof ValidationError ? error.details : undefined,
    }
  }

  console.error('Unexpected error:', error)
  return {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  }
}
