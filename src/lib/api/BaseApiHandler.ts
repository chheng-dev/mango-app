import { NextRequest, NextResponse } from 'next/server';
import { BaseController, PaginationOptions, SearchOptions } from '../controllers/BaseController';

export class BaseApiHandler<TSelect, TInsert> {
  constructor(private controller: BaseController<TSelect, TInsert>) {}

  /**
   * Handle GET requests
   * GET /api/resource - Get all resources
   * GET /api/resource?id=123 - Get specific resource by ID
   */
  async handleGet(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (id) {
        // Get single resource by ID
        const result = await this.controller.getById(parseInt(id));
        return NextResponse.json(result, { 
          status: result.success ? 200 : 404 
        });
      }

      // Get all resources with pagination and search
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
      const query = searchParams.get('q') || searchParams.get('search');

      // Build filters from search params (exclude known pagination params)
      const filters: Record<string, string> = {};
      for (const [key, value] of searchParams.entries()) {
        if (!['page', 'limit', 'sortBy', 'sortOrder', 'q', 'search', 'id'].includes(key)) {
          filters[key] = value;
        }
      }

      const options: PaginationOptions & SearchOptions = {
        page,
        limit,
        sortBy,
        sortOrder,
        query: query || undefined,
        filters
      };

      const result = await this.controller.getAll(options);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });

    } catch (error) {
      console.error('GET request error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  }

  /**
   * Handle POST requests
   * POST /api/resource - Create new resource
   * POST /api/resource/bulk - Bulk create resources
   */
  async handlePost(request: NextRequest): Promise<NextResponse> {
    try {
      const { pathname } = new URL(request.url);
      const body = await request.json();

      if (pathname.endsWith('/bulk')) {
        // Bulk create
        if (!Array.isArray(body)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Request body must be an array for bulk operations'
            },
            { status: 400 }
          );
        }

        const result = await this.controller.bulkCreate(body);
        return NextResponse.json(result, { 
          status: result.success ? 201 : 400 
        });
      }

      // Single create
      const result = await this.controller.create(body);
      return NextResponse.json(result, { 
        status: result.success ? 201 : 400 
      });

    } catch (error) {
      console.error('POST request error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  }

  /**
   * Handle PUT requests
   * PUT /api/resource?id=123 - Update specific resource by ID
   */
  async handlePut(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID parameter is required for updates'
          },
          { status: 400 }
        );
      }

      const body = await request.json();
      const result = await this.controller.update(parseInt(id), body);
      
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });

    } catch (error) {
      console.error('PUT request error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  }

  /**
   * Handle DELETE requests
   * DELETE /api/resource?id=123 - Delete specific resource by ID
   * DELETE /api/resource?id=123&soft=true - Soft delete (if supported)
   */
  async handleDelete(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      const soft = searchParams.get('soft') === 'true';

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID parameter is required for deletion'
          },
          { status: 400 }
        );
      }

      const result = soft 
        ? await this.controller.softDelete(parseInt(id))
        : await this.controller.delete(parseInt(id));
      
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });

    } catch (error) {
      console.error('DELETE request error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  }

  /**
   * Create API route handlers for all HTTP methods
   * Use this in your route.ts files
   */
  createRoutes() {
    return {
      GET: (request: NextRequest) => this.handleGet(request),
      POST: (request: NextRequest) => this.handlePost(request),
      PUT: (request: NextRequest) => this.handlePut(request),
      DELETE: (request: NextRequest) => this.handleDelete(request),
    };
  }

  /**
   * Helper method to handle all requests with method routing
   */
  async handleRequest(request: NextRequest): Promise<NextResponse> {
    const method = request.method;

    switch (method) {
      case 'GET':
        return this.handleGet(request);
      case 'POST':
        return this.handlePost(request);
      case 'PUT':
        return this.handlePut(request);
      case 'DELETE':
        return this.handleDelete(request);
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Method ${method} not allowed`
          },
          { status: 405 }
        );
    }
  }
}

/**
 * Helper function to create API handlers for a controller
 */
export function createApiRoutes<TSelect, TInsert>(
  controller: BaseController<TSelect, TInsert>
) {
  const handler = new BaseApiHandler(controller);
  return handler.createRoutes();
}
