# Authentication & Authorization System Implementation

## Overview

Successfully implemented a comprehensive authentication and authorization system that integrates with the BaseRoute pattern, providing secure access control for all RBAC API endpoints.

## 🔐 **Authentication & Authorization Components**

### 1. **AuthMiddleware (`/src/lib/middleware/AuthMiddleware.ts`)**
Complete JWT-based authentication system with permission checking:

```typescript
export interface AuthUser {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthContext {
  user: AuthUser;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}
```

### 2. **Permission Constants**
Standardized permission strings for consistent access control:

```typescript
export const PERMISSIONS = {
  // Role permissions
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create', 
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_MANAGE: 'roles:manage',

  // Permission permissions
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_CREATE: 'permissions:create',
  PERMISSIONS_UPDATE: 'permissions:update', 
  PERMISSIONS_DELETE: 'permissions:delete',
  PERMISSIONS_MANAGE: 'permissions:manage',

  // User permissions
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',

  // Admin permissions
  ADMIN_FULL: 'admin:full',
  SYSTEM_ADMIN: 'system:admin'
} as const;
```

### 3. **Enhanced BaseRoute with Authentication**
Extended BaseRoute with authenticated handlers:

```typescript
export interface RouteAuthOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;
  allowSelf?: boolean; // Allow user to access their own data
}
```

## 🛡️ **Authentication Flow**

### 1. **Token Extraction & Verification**
```typescript
// Extract Bearer token from Authorization header
const authHeader = request.headers.get('authorization');
const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

// Verify JWT with secret
const payload = verify(token, process.env.JWT_SECRET);
```

### 2. **User Context Creation**
```typescript
const user: AuthUser = {
  id: payload.id,
  email: payload.email,
  roles: payload.roles || [],
  permissions: payload.permissions || []
};

const context = AuthMiddleware.createAuthContext(user);
```

### 3. **Permission Checking**
```typescript
// Check specific permissions
const hasPermission = context.hasPermission('roles:read');

// Check multiple permissions (AND logic)
const hasAllPermissions = requiredPermissions.every(p => context.hasPermission(p));

// Check multiple permissions (OR logic)  
const hasAnyPermission = requiredPermissions.some(p => context.hasPermission(p));
```

## 🎯 **API Route Implementation**

### Before (No Authentication)
```typescript
export const GET = withErrorHandling(async (request, { params }) => {
  return BaseRoute.handleGetById(
    params,
    (id) => roleController.getById(id),
    'Role'
  );
}, 'GET Role');
```

### After (With Authentication & Authorization)
```typescript
export const GET = withErrorHandling(async (request, { params }) => {
  return BaseRoute.handleAuthenticatedGetById(
    request,
    params,
    (id, auth) => roleController.getById(id),
    'Role',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLES_READ],
      allowSelf: false
    }
  );
}, 'GET Role');
```

## 🔒 **Security Features Implemented**

### 1. **JWT Token Validation**
- ✅ Bearer token extraction from Authorization header
- ✅ JWT signature verification with secret
- ✅ Token expiration checking
- ✅ Proper error handling for invalid/expired tokens

### 2. **Permission-Based Access Control**
- ✅ Granular permissions (read, create, update, delete)
- ✅ Resource-specific permissions (roles:read, users:create, etc.)
- ✅ AND/OR logic for multiple permission requirements
- ✅ Role-based grouping of permissions

### 3. **Consistent Error Responses**
```typescript
// 401 - Authentication required
{ success: false, error: "Authorization header is required" }

// 403 - Insufficient permissions
{ success: false, error: "Insufficient permissions. Required: roles:read" }

// 403 - Insufficient roles
{ success: false, error: "Insufficient roles. Required: admin OR manager" }
```

### 4. **Self-Access Control**
```typescript
// Allow users to access their own data
{
  requireAuth: true,
  requiredPermissions: [PERMISSIONS.USERS_READ],
  allowSelf: true // User can read their own profile even without users:read
}
```

## 📊 **Protected API Endpoints**

### Roles API (Authentication Required)
- `GET /api/rbac/roles` - Requires: `roles:read`
- `POST /api/rbac/roles` - Requires: `roles:create`
- `GET /api/rbac/roles/[id]` - Requires: `roles:read`
- `PUT /api/rbac/roles/[id]` - Requires: `roles:update`
- `DELETE /api/rbac/roles/[id]` - Requires: `roles:delete`

### Permissions API (Authentication Required)
- `GET /api/rbac/permissions` - Requires: `permissions:read`
- `POST /api/rbac/permissions` - Requires: `permissions:create`
- `GET /api/rbac/permissions/[id]` - Requires: `permissions:read`
- `PUT /api/rbac/permissions/[id]` - Requires: `permissions:update`
- `DELETE /api/rbac/permissions/[id]` - Requires: `permissions:delete`

## 🔧 **Environment Setup**

### Required Environment Variables
```bash
# JWT Secret for token verification
JWT_SECRET=your-super-secure-jwt-secret-key

# Optional: Token expiration time
JWT_EXPIRES_IN=7d
```

## 🚀 **Usage Examples**

### 1. **Making Authenticated Requests**
```javascript
// Include JWT token in Authorization header
const response = await fetch('/api/rbac/roles', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});
```

### 2. **Creating Roles with Permissions**
```javascript
const response = await fetch('/api/rbac/roles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Manager',
    description: 'Manager role with limited permissions'
  })
});
```

### 3. **Token Payload Structure**
```typescript
// JWT token should contain:
{
  id: 123,
  email: 'user@example.com',
  roles: ['manager', 'user'],
  permissions: [
    'roles:read',
    'permissions:read', 
    'users:read',
    'users:update'
  ],
  iat: 1640995200,
  exp: 1641600000
}
```

## 🎉 **Benefits Achieved**

### 1. **Complete Security Coverage**
- ✅ All RBAC endpoints protected with authentication
- ✅ Granular permission-based authorization
- ✅ Consistent security across all routes

### 2. **Developer Experience**
- ✅ Simple, declarative security configuration
- ✅ Automatic token validation and error handling
- ✅ Clear permission constants and naming

### 3. **Scalability**
- ✅ Easy to add new protected routes
- ✅ Flexible permission system
- ✅ Role-based access control ready

### 4. **Maintainability**
- ✅ Centralized authentication logic
- ✅ Consistent error responses
- ✅ Type-safe permission checking

## 🔄 **Next Steps**

1. **Set up JWT_SECRET** in environment variables
2. **Create login endpoint** to issue JWT tokens
3. **Implement user registration** with role assignment  
4. **Add refresh token mechanism** for enhanced security
5. **Create admin dashboard** for user/role management

The authentication and authorization system is now fully integrated and ready to secure your RBAC API! 🎯🔒
