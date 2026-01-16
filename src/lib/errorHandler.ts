import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class AppError extends Error {
  public statusCode: number = 500
  public isOperational: boolean = true
  public details?: unknown

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.details = details
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', {
    name: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      },
      { status: 400 }
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      Object.assign(
        { error: error.message },
        error.details ? { details: error.details } : {}
      ),
      { status: error.statusCode }
    )
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string; details?: string }

    const dbErrorMessages: Record<string, string> = {
      '23505': 'A record with this information already exists',
      '23503': 'Referenced record does not exist',
      '23502': 'Required field is missing or invalid',
      '42501': 'Insufficient permissions for this operation',
      'PGRST116': 'Invalid table or column name',
      'PGRST205': 'Table not found in schema'
    }

    if (dbError.code in dbErrorMessages) {
      return NextResponse.json(
        { error: dbErrorMessages[dbError.code] },
        { status: 400 }
      )
    }
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  )
}
