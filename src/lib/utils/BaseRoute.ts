import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/controllers/BaseController';
import { AuthMiddleware } from '@/lib/middleware/AuthMiddleware';
import { AuthContext } from '@/lib/types/auth';

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
 * Base route handler for consistent API responses and error handling
 */
export class BaseRoute {
  
  /**
   * Handle GET request for single entity by ID
   */
  static async handleGetById<T>(
    params: { id: string } | Promise<{ id: string }>,
    getByIdFn: (id: number) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity'
  ): Promise<NextResponse> {
    try {
      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id) || id <= 0) {
        return this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST);
      }

      const result = await getByIdFn(id);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.NOT_FOUND
      });
    } catch (error) {
      console.error(`GET ${entityName} by ID error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle PUT request for updating entity by ID
   */
  static async handleUpdateById<T>(
    request: NextRequest,
    params: { id: string } | Promise<{ id: string }>,
    updateFn: (id: number, data: any) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity'
  ): Promise<NextResponse> {
    try {
      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id) || id <= 0) {
        return this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST);
      }

      let body;
      try {
        body = await request.json();
      } catch (error) {
        return this.errorResponse('Invalid JSON in request body', HTTP_STATUS.BAD_REQUEST);
      }

      if (!body || typeof body !== 'object') {
        return this.errorResponse('Request body is required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await updateFn(id, body);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`PUT ${entityName} error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle DELETE request for entity by ID
   */
  static async handleDeleteById<T>(
    params: { id: string } | Promise<{ id: string }>,
    deleteFn: (id: number) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity'
  ): Promise<NextResponse> {
    try {
      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id) || id <= 0) {
        return this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST);
      }

      const result = await deleteFn(id);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`DELETE ${entityName} error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle GET request for collection with query parameters
   */
  static async handleGetCollection<T>(
    request: NextRequest,
    getCollectionFn: (params: any) => Promise<ApiResponse<T[]>>,
    entityName: string = 'Entities'
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        query: searchParams.get('query') || undefined,
        sortBy: searchParams.get('sortBy') || undefined,
        sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
        // Add any additional common parameters here
      };

      // Validate pagination parameters
      if (params.page < 1) params.page = 1;
      if (params.limit < 1 || params.limit > 100) params.limit = 10;

      const result = await getCollectionFn(params);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`GET ${entityName} collection error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle POST request for creating new entity
   */
  static async handleCreate<T>(
    request: NextRequest,
    createFn: (data: any) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity'
  ): Promise<NextResponse> {
    try {
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return this.errorResponse('Invalid JSON in request body', HTTP_STATUS.BAD_REQUEST);
      }

      if (!body || typeof body !== 'object') {
        return this.errorResponse('Request body is required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await createFn(body);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.CREATED,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`POST ${entityName} error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle authenticated GET request for single entity by ID
   */
  static async handleAuthenticatedGetById<T>(
    request: NextRequest,
    params: { id: string } | Promise<{ id: string }>,
    getByIdFn: (id: number, auth?: AuthContext) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity',
    authOptions: RouteAuthOptions = { requireAuth: true }
  ): Promise<NextResponse> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request, authOptions);
      if (!authResult.success) {
        return authResult.response || this.errorResponse('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
      }

      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id) || id <= 0) {
        return this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if user can access this specific resource
      if (authOptions.allowSelf && authResult.auth) {
        const canAccessSelf = await this.checkSelfAccess(authResult.auth, id, entityName);
        if (!canAccessSelf.allowed && !authResult.hasRequiredPermissions) {
          return this.errorResponse(
            canAccessSelf.reason || `Access denied to ${entityName.toLowerCase()}`,
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      const result = await getByIdFn(id, authResult.auth);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.NOT_FOUND
      });
    } catch (error) {
      console.error(`Authenticated GET ${entityName} by ID error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle authenticated PUT request for updating entity by ID
   */
  static async handleAuthenticatedUpdateById<T>(
    request: NextRequest,
    params: { id: string } | Promise<{ id: string }>,
    updateFn: (id: number, data: any, auth?: AuthContext) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity',
    authOptions: RouteAuthOptions = { requireAuth: true }
  ): Promise<NextResponse> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request, authOptions);
      if (!authResult.success) {
        return authResult.response || this.errorResponse('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
      }

      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id) || id <= 0) {
        return this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST);
      }

      let body;
      try {
        body = await request.json();
      } catch (error) {
        return this.errorResponse('Invalid JSON in request body', HTTP_STATUS.BAD_REQUEST);
      }

      if (!body || typeof body !== 'object') {
        return this.errorResponse('Request body is required', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if user can modify this specific resource
      if (authOptions.allowSelf && authResult.auth) {
        const canAccessSelf = await this.checkSelfAccess(authResult.auth, id, entityName);
        if (!canAccessSelf.allowed && !authResult.hasRequiredPermissions) {
          return this.errorResponse(
            canAccessSelf.reason || `Access denied to modify ${entityName.toLowerCase()}`,
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      const result = await updateFn(id, body, authResult.auth);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`Authenticated PUT ${entityName} error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle authenticated DELETE request for entity by ID
   */
  static async handleAuthenticatedDeleteById<T>(
    request: NextRequest,
    params: { id: string } | Promise<{ id: string }>,
    deleteFn: (id: number, auth?: AuthContext) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity',
    authOptions: RouteAuthOptions = { requireAuth: true }
  ): Promise<NextResponse> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request, authOptions);
      if (!authResult.success) {
        return authResult.response || this.errorResponse('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
      }

      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id) || id <= 0) {
        return this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if user can delete this specific resource
      if (authOptions.allowSelf && authResult.auth) {
        const canAccessSelf = await this.checkSelfAccess(authResult.auth, id, entityName);
        if (!canAccessSelf.allowed && !authResult.hasRequiredPermissions) {
          return this.errorResponse(
            canAccessSelf.reason || `Access denied to delete ${entityName.toLowerCase()}`,
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      const result = await deleteFn(id, authResult.auth);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`Authenticated DELETE ${entityName} error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle authenticated GET request for collection
   */
  static async handleAuthenticatedGetCollection<T>(
    request: NextRequest,
    getCollectionFn: (params: any, auth?: AuthContext) => Promise<ApiResponse<T[]>>,
    entityName: string = 'Entities',
    authOptions: RouteAuthOptions = { requireAuth: true }
  ): Promise<NextResponse> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request, authOptions);
      if (!authResult.success) {
        return authResult.response || this.errorResponse('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
      }

      const { searchParams } = new URL(request.url);
      
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        query: searchParams.get('query') || undefined,
        sortBy: searchParams.get('sortBy') || undefined,
        sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      };

      // Validate pagination parameters
      if (params.page < 1) params.page = 1;
      if (params.limit < 1 || params.limit > 100) params.limit = 10;

      const result = await getCollectionFn(params, authResult.auth);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.OK,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`Authenticated GET ${entityName} collection error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Handle authenticated POST request for creating new entity
   */
  static async handleAuthenticatedCreate<T>(
    request: NextRequest,
    createFn: (data: any, auth?: AuthContext) => Promise<ApiResponse<T>>,
    entityName: string = 'Entity',
    authOptions: RouteAuthOptions = { requireAuth: true }
  ): Promise<NextResponse> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request, authOptions);
      if (!authResult.success) {
        return authResult.response || this.errorResponse('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
      }

      let body;
      try {
        body = await request.json();
      } catch (error) {
        return this.errorResponse('Invalid JSON in request body', HTTP_STATUS.BAD_REQUEST);
      }

      if (!body || typeof body !== 'object') {
        return this.errorResponse('Request body is required', HTTP_STATUS.BAD_REQUEST);
      }

      const result = await createFn(body, authResult.auth);
      
      return this.successResponse(result, {
        successStatus: HTTP_STATUS.CREATED,
        errorStatus: HTTP_STATUS.BAD_REQUEST
      });
    } catch (error) {
      console.error(`Authenticated POST ${entityName} error:`, error);
      return this.internalServerError();
    }
  }

  /**
   * Authenticate request and check permissions
   */
  static async authenticateRequest(
    request: NextRequest,
    authOptions: RouteAuthOptions
  ): Promise<{
    success: boolean;
    response?: NextResponse;
    auth?: AuthContext;
    hasRequiredPermissions?: boolean;
  }> {
    try {
      // Skip authentication if not required
      if (!authOptions.requireAuth) {
        return { success: true };
      }

      // Authenticate user
      const authResult = await AuthMiddleware.authenticate(request);
      if (!authResult.authenticated || !authResult.context) {
        return {
          success: false,
          response: NextResponse.json(
            authResult.error || { success: false, error: 'Authentication required' },
            { status: HTTP_STATUS.UNAUTHORIZED }
          )
        };
      }

      const auth = authResult.context;

      // Check required permissions
      if (authOptions.requiredPermissions && authOptions.requiredPermissions.length > 0) {
        const permissionCheck = AuthMiddleware.checkPermissions(
          auth,
          authOptions.requiredPermissions,
          authOptions.requireAllPermissions
        );

        if (!permissionCheck.authorized) {
          return {
            success: false,
            response: NextResponse.json(
              permissionCheck.error || { success: false, error: 'Insufficient permissions' },
              { status: HTTP_STATUS.FORBIDDEN }
            )
          };
        }
      }

      // Check required roles
      if (authOptions.requiredRoles && authOptions.requiredRoles.length > 0) {
        const roleCheck = AuthMiddleware.checkRoles(
          auth,
          authOptions.requiredRoles,
          authOptions.requireAllRoles
        );

        if (!roleCheck.authorized) {
          return {
            success: false,
            response: NextResponse.json(
              roleCheck.error || { success: false, error: 'Insufficient roles' },
              { status: HTTP_STATUS.FORBIDDEN }
            )
          };
        }
      }

      return {
        success: true,
        auth,
        hasRequiredPermissions: true
      };
    } catch (error) {
      console.error('Authentication request error:', error);
      return {
        success: false,
        response: this.internalServerError('Authentication failed')
      };
    }
  }

  /**
   * Check if user can access their own data
   */
  static async checkSelfAccess(
    auth: AuthContext,
    resourceId: number,
    entityName: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // For user entities, check if the resource ID matches the user ID
      if (entityName.toLowerCase() === 'user') {
        if (auth.user.id === resourceId) {
          return { allowed: true };
        }
        return { 
          allowed: false, 
          reason: 'You can only access your own user data' 
        };
      }

      // For other entities, you might want to check ownership
      // This would require additional logic based on your data model
      // For now, we'll return false for non-user entities
      return { 
        allowed: false, 
        reason: `Self-access not applicable for ${entityName}` 
      };
    } catch (error) {
      console.error('Self access check error:', error);
      return { 
        allowed: false, 
        reason: 'Failed to verify access permissions' 
      };
    }
  }

  /**
   * Create success response based on ApiResponse
   */
  static successResponse<T>(
    result: ApiResponse<T>,
    options: {
      successStatus?: number;
      errorStatus?: number;
    } = {}
  ): NextResponse {
    const {
      successStatus = HTTP_STATUS.OK,
      errorStatus = HTTP_STATUS.BAD_REQUEST
    } = options;

    return NextResponse.json(result, {
      status: result.success ? successStatus : errorStatus
    });
  }

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
   * Validate ID parameter
   */
  static validateId(id: string, entityName: string = 'Entity'): { valid: boolean; id?: number; error?: NextResponse } {
    const parsedId = Number(id);
    
    if (isNaN(parsedId) || parsedId <= 0) {
      return {
        valid: false,
        error: this.errorResponse(`Invalid ${entityName.toLowerCase()} ID`, HTTP_STATUS.BAD_REQUEST)
      };
    }

    return { valid: true, id: parsedId };
  }

  /**
   * Validate and parse JSON body
   */
  static async validateJsonBody(request: NextRequest): Promise<{ valid: boolean; data?: any; error?: NextResponse }> {
    try {
      const body = await request.json();
      
      if (!body || typeof body !== 'object') {
        return {
          valid: false,
          error: this.errorResponse('Request body is required', HTTP_STATUS.BAD_REQUEST)
        };
      }

      return { valid: true, data: body };
    } catch (error) {
      return {
        valid: false,
        error: this.errorResponse('Invalid JSON in request body', HTTP_STATUS.BAD_REQUEST)
      };
    }
  }
}

/**
 * Authentication and authorization options for routes
 */
export interface RouteAuthOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;
  allowSelf?: boolean; // Allow user to access their own data
}

/**
 * Extended route context with authentication
 */
export interface AuthenticatedRouteContext extends RouteContext {
  auth?: AuthContext;
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
 * Type for route handler context
 */
export interface RouteContext {
  params: Record<string, string>;
}

/**
 * Type for collection query parameters
 */
export interface CollectionParams {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
