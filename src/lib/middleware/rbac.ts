import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticatedRequest } from './auth';
import { RBACService } from '../services/rbac-service';

export interface PermissionRequest extends AuthenticatedRequest {
  userPermissions?: string[];
}

/**
 * Higher-order function to protect API routes with permission checking
 */
export function withPermission(permission: string) {
  return function (handler: (request: PermissionRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // First authenticate the user
      const auth = await authenticateRequest(request);
      
      if (!auth.success) {
        return NextResponse.json(
          {
            success: false,
            error: auth.error
          },
          { status: 401 }
        );
      }

      // Check if user has the required permission
      const hasPermission = await RBACService.hasPermission(auth.user.userId, permission);
      if (!hasPermission) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: `Permission '${permission}' required`
          },
          { status: 403 }
        );
      }

      // Add user and permissions to request object
      const permissionRequest = request as PermissionRequest;
      permissionRequest.user = auth.user;
      
      // Optionally add user permissions to the request
      const userPermissions = await RBACService.getUserPermissions(auth.user.userId);
      permissionRequest.userPermissions = userPermissions;

      return handler(permissionRequest);
    };
  };
}

/**
 * Higher-order function to protect API routes with role checking
 */
export function withRole(role: string) {
  return function (handler: (request: PermissionRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // First authenticate the user
      const auth = await authenticateRequest(request);
      
      if (!auth.success) {
        return NextResponse.json(
          {
            success: false,
            error: auth.error
          },
          { status: 401 }
        );
      }

      // Check if user has the required role
      const hasRole = await RBACService.hasRole(auth.user.userId, role);
      if (!hasRole) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden", 
            message: `Role '${role}' required`
          },
          { status: 403 }
        );
      }

      // Add user to request object
      const permissionRequest = request as PermissionRequest;
      permissionRequest.user = auth.user;
      
      // Optionally add user permissions to the request
      const userPermissions = await RBACService.getUserPermissions(auth.user.userId);
      permissionRequest.userPermissions = userPermissions;

      return handler(permissionRequest);
    };
  };
}

/**
 * Higher-order function that combines authentication with API handler
 */
export function withAuthAndPermission(permission: string, apiHandler: any) {
  return withPermission(permission)(async (request: PermissionRequest) => {
    // Create API handler instance and call appropriate method
    const handler = typeof apiHandler === 'function' ? apiHandler : apiHandler.constructor;
    const instance = new handler();
    
    if (request.method === 'GET') {
      return instance.handleGET ? await instance.handleGET(request) : await instance.GET(request);
    } else if (request.method === 'POST') {
      return instance.handlePOST ? await instance.handlePOST(request) : await instance.POST(request);
    } else if (request.method === 'PUT') {
      return instance.handlePUT ? await instance.handlePUT(request) : await instance.PUT(request);
    } else if (request.method === 'DELETE') {
      return instance.handleDELETE ? await instance.handleDELETE(request) : await instance.DELETE(request);
    }
    
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  });
}
