import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '../controllers/BaseController';

/**
 * Simplified API handler that works with any controller
 * No longer tied specifically to BaseController class
 */
export class BaseApiHandler<T = any> {
  constructor(private controller: any) {}

  /**
   * Handle GET requests
   * - GET /api/resource -> getAll()
   * - GET /api/resource/123 -> getById(123)
   * - GET /api/resource/search?q=term -> searchUsers() for UserController
   */
  async handleGET(request: NextRequest, context?: { params?: Promise<{ id?: string }> | { id?: string } }) {
    try {
      const { searchParams } = new URL(request.url);
      const params = context?.params ? await context.params : undefined;
      
      // Handle search
      if (params?.id === 'search') {
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '10');
        
        if (this.controller.searchUsers) {
          const result = await this.controller.searchUsers(query, limit);
          return this.createResponse(result);
        }
        
        return NextResponse.json({ 
          success: false, 
          error: 'Search not supported' 
        }, { status: 400 });
      }

      // Handle get by ID
      if (params?.id) {
        const id = parseInt(params.id);
        if (isNaN(id)) {
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid ID' 
          }, { status: 400 });
        }

        const result = await this.controller.getById(id);
        return this.createResponse(result);
      }

      // Handle get all with query parameters
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const query = searchParams.get('query') || undefined;
      const sortBy = searchParams.get('sortBy') || undefined;
      const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
      const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
      const isVerified = searchParams.get('isVerified') ? searchParams.get('isVerified') === 'true' : undefined;
      const includeRoles = searchParams.get('includeRoles') === 'true';

      const result = await this.controller.getAll({
        page,
        limit,
        query,
        sortBy,
        sortOrder,
        isActive,
        isVerified,
        includeRoles
      });

      return this.createResponse(result);
    } catch (error) {
      console.error('GET handler error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  }

  /**
   * Handle POST requests - Create new resource
   */
  async handlePOST(request: NextRequest) {
    try {
      const data = await request.json();
      const result = await this.controller.create(data);
      return this.createResponse(result, 201);
    } catch (error) {
      console.error('POST handler error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  }

  /**
   * Handle PUT requests - Update resource
   */
  async handlePUT(request: NextRequest, context?: { params?: Promise<{ id?: string }> | { id?: string } }) {
    try {
      const params = context?.params ? await context.params : undefined;
      
      if (!params?.id) {
        return NextResponse.json({ 
          success: false, 
          error: 'ID is required for updates' 
        }, { status: 400 });
      }

      const id = parseInt(params.id);
      if (isNaN(id)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid ID' 
        }, { status: 400 });
      }

      const data = await request.json();
      const result = await this.controller.update(id, data);
      return this.createResponse(result);
    } catch (error) {
      console.error('PUT handler error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  }

  /**
   * Handle DELETE requests - Delete resource
   */
  async handleDELETE(request: NextRequest, context?: { params?: Promise<{ id?: string }> | { id?: string } }) {
    try {
      const params = context?.params ? await context.params : undefined;
      
      if (!params?.id) {
        return NextResponse.json({ 
          success: false, 
          error: 'ID is required for deletion' 
        }, { status: 400 });
      }

      const id = parseInt(params.id);
      if (isNaN(id)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid ID' 
        }, { status: 400 });
      }

      const result = await this.controller.delete(id);
      return this.createResponse(result);
    } catch (error) {
      console.error('DELETE handler error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  }

  /**
   * Handle PATCH requests - Partial update
   */
  async handlePATCH(request: NextRequest, context?: { params?: Promise<{ id?: string }> | { id?: string } }) {
    try {
      const params = context?.params ? await context.params : undefined;
      
      if (!params?.id) {
        return NextResponse.json({ 
          success: false, 
          error: 'ID is required for updates' 
        }, { status: 400 });
      }

      const id = parseInt(params.id);
      if (isNaN(id)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid ID' 
        }, { status: 400 });
      }

      const data = await request.json();
      const result = await this.controller.update(id, data);
      return this.createResponse(result);
    } catch (error) {
      console.error('PATCH handler error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  }

  /**
   * Create standardized response
   */
  private createResponse(result: ApiResponse<any>, successStatus: number = 200) {
    if (result.success) {
      return NextResponse.json(result, { status: successStatus });
    } else {
      const status = result.error?.includes('not found') ? 404 : 400;
      return NextResponse.json(result, { status });
    }
  }
}

/**
 * Factory function to create API handlers
 */
export function createApiHandler<T>(controller: any) {
  const handler = new BaseApiHandler<T>(controller);
  
  return {
    GET: handler.handleGET.bind(handler),
    POST: handler.handlePOST.bind(handler),
    PUT: handler.handlePUT.bind(handler),
    DELETE: handler.handleDELETE.bind(handler),
    PATCH: handler.handlePATCH.bind(handler)
  };
}

/**
 * Utility to create controller-specific handlers
 */
export function createControllerApi<T>(controller: any) {
  return createApiHandler<T>(controller);
}
