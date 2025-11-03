import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard HTTP status codes for consistent API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Clean BaseRoute class - focused on utilities, not authentication
 * Authentication is handled by src/lib/auth/unified.ts
 */
export class BaseRoute {

  /**
   * Create error response
   */
  static errorResponse(message: string, status: number = HTTP_STATUS.BAD_REQUEST): NextResponse {
    return NextResponse.json({
      success: false,
      error: message
    }, { status });
  }

  /**
   * Create internal server error response
   */
  static internalServerError(message: string = 'Internal server error'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  /**
   * Handle database errors and return user-friendly messages
   */
  static handleDatabaseError(error: any): { message: string; details?: string } {
    if (!error) {
      return { message: 'Unknown database error occurred' };
    }

    const errorMessage = error.message || error.toString();

    // Handle unique constraint violations (PostgreSQL and SQLite patterns)
    if (errorMessage.includes('duplicate key value violates unique constraint') || 
        errorMessage.includes('UNIQUE constraint failed') ||
        errorMessage.includes('violates unique constraint')) {
      
      // Check for specific fields
      if (errorMessage.includes('email') || errorMessage.includes('users_email')) {
        return { message: 'Email address already exists' };
      }
      if (errorMessage.includes('slug') || errorMessage.includes('_slug_')) {
        return { message: 'Slug already exists' };
      }
      if (errorMessage.includes('name') || errorMessage.includes('_name_')) {
        return { message: 'Name already exists' };
      }
      if (errorMessage.includes('phone') || errorMessage.includes('phone_number')) {
        return { message: 'Phone number already exists' };
      }
      if (errorMessage.includes('code') || errorMessage.includes('_code_')) {
        return { message: 'Code already exists' };
      }
      
      return { message: 'This record already exists' };
    }

    // Handle foreign key constraint violations
    if (errorMessage.includes('foreign key constraint') || 
        errorMessage.includes('FOREIGN KEY constraint failed') ||
        errorMessage.includes('violates foreign key constraint')) {
      return { message: 'Cannot perform this action due to related data' };
    }

    // Handle NOT NULL constraint violations
    if (errorMessage.includes('not null constraint') || 
        errorMessage.includes('NOT NULL constraint failed') ||
        errorMessage.includes('violates not-null constraint')) {
      const field = this.extractFieldFromError(errorMessage);
      return { message: `${field || 'Required field'} cannot be empty` };
    }

    // Handle check constraint violations
    if (errorMessage.includes('check constraint') || 
        errorMessage.includes('CHECK constraint failed')) {
      return { message: 'Invalid data format or value' };
    }

    // Handle connection errors
    if (errorMessage.includes('connect') || errorMessage.includes('connection')) {
      return { message: 'Database connection error' };
    }

    // Handle timeout errors
    if (errorMessage.includes('timeout')) {
      return { message: 'Database operation timed out' };
    }

    // Handle SQL syntax and generic database errors
    if (this.isDatabaseError(errorMessage)) {
      const cleanMessage = this.extractCleanErrorMessage(errorMessage);
      return { 
        message: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? cleanMessage : undefined
      };
    }

    // Return original message for development, generic for production
    return {
      message: process.env.NODE_ENV === 'development' 
        ? errorMessage 
        : 'An error occurred while processing your request'
    };
  }

  /**
   * Check if error is a database-related error
   */
  private static isDatabaseError(errorMessage: string): boolean {
    const dbErrorPatterns = [
      'Failed query:',
      'insert into',
      'update.*set',
      'delete from',
      'select.*from',
      'relation.*does not exist',
      'column.*does not exist',
      'syntax error',
      'invalid input syntax',
      'permission denied for',
      'pg_',
      'postgres',
      'sqlite',
      'mysql'
    ];

    return dbErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Extract field name from error message
   */
  private static extractFieldFromError(errorMessage: string): string | null {
    // Try to extract field name from common error patterns
    const patterns = [
      /column "(\w+)"/i,
      /field (\w+)/i,
      /constraint.*"(\w+)"/i,
      /"(\w+)" cannot be null/i
    ];

    for (const pattern of patterns) {
      const match = errorMessage.match(pattern);
      if (match) {
        // Convert snake_case to Title Case
        return match[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    return null;
  }

  /**
   * Extract clean error message from verbose database errors
   */
  private static extractCleanErrorMessage(errorMessage: string): string {
    let cleaned = errorMessage;
    
    // Remove common prefixes
    cleaned = cleaned.replace(/^Failed query:\s*/i, '');
    cleaned = cleaned.replace(/^Error:\s*/i, '');
    cleaned = cleaned.replace(/^Database error:\s*/i, '');
    
    // Remove SQL parameters section if present
    cleaned = cleaned.replace(/\nparams:[\s\S]*$/, '');
    cleaned = cleaned.replace(/\s*\nparams:.*$/, '');
    
    // Remove stack traces
    cleaned = cleaned.replace(/\s*at\s+[\s\S]*$/, '');
    
    // If it's a SQL query, try to extract just the operation type
    if (cleaned.toLowerCase().includes('insert into')) {
      return 'Failed to create record - data may already exist';
    }
    if (cleaned.toLowerCase().includes('update') && cleaned.toLowerCase().includes('set')) {
      return 'Failed to update record';
    }
    if (cleaned.toLowerCase().includes('delete from')) {
      return 'Failed to delete record - it may be referenced by other data';
    }
    if (cleaned.toLowerCase().includes('select') && cleaned.toLowerCase().includes('from')) {
      return 'Failed to retrieve data';
    }
    
    // Truncate very long messages
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 150) + '...';
    }

    return cleaned || 'Database operation failed';
  }

  /**
   * Create error response with database error handling
   */
  static databaseErrorResponse(error: any, customMessage?: string): NextResponse {
    const { message, details } = this.handleDatabaseError(error);
    
    return NextResponse.json({
      success: false,
      error: customMessage || message,
      ...(details && { details })
    }, { status: HTTP_STATUS.BAD_REQUEST });
  }
}

/**
 * Utility function to wrap async route handlers with error handling
 */
export function withErrorHandling(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  entityName: string = 'API'
) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`${entityName} route error:`, error);
      return BaseRoute.internalServerError();
    }
  };
}

/**
 * Parse request body from various content types
 */
export async function parseRequestBody(req: NextRequest): Promise<any> {
  const contentType = (req.headers.get('content-type') || '').toLowerCase();

  if (!contentType) {
    try { return await req.json(); } catch { return {}; }
  }

  if (contentType.includes('application/json')) {
    try { return await req.json(); } catch { return {}; }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const out: Record<string, any> = {};
    params.forEach((v, k) => {
      try { out[k] = JSON.parse(v); } catch { out[k] = v; }
    });
    return out;
  }

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    const out: Record<string, any> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === 'string') {
        try { out[k] = JSON.parse(v); } catch { out[k] = v; }
      } else {
        out[k] = v; // File object
      }
    }
    return out;
  }

  // fallback: try json then text
  try { return await req.json(); } catch {
    try {
      const txt = await req.text();
      if (!txt) return {};
      try { return JSON.parse(txt); } catch {
        const params = new URLSearchParams(txt);
        if ([...params.keys()].length) {
          const o: Record<string, any> = {};
          params.forEach((v, k) => { o[k] = v; });
          return o;
        }
        return { raw: txt };
      }
    } catch { return {}; }
  }
}

/**
 * Handle API response consistently
 */
export const handleApiResponse = (result: any, userEmail?: string) => {
  if (userEmail) {
    console.log(`API Response for ${userEmail}:`, result.success ? 'Success' : 'Failed');
  }

  // If the result contains a database error, clean it up
  if (!result.success && result.error) {
    const { message, details } = BaseRoute.handleDatabaseError(result.error);
    result = {
      ...result,
      error: message,
      ...(details && { details })
    };
  }
  
  return NextResponse.json(result, { 
    status: result.success ? 200 : 400 
  });
};
