# Dynamic RBAC Permissions System

## Overview

This system now dynamically loads user permissions and roles from the database during authentication, providing real-time access control based on the user's current role assignments.

## How It Works

### 1. **Dynamic Permission Loading**

When a user is authenticated, the system:
1. Verifies the JWT token
2. Fetches the user's current roles from the database
3. Fetches all permissions associated with those roles
4. Creates an `AuthContext` with live permission data

```typescript
// AuthMiddleware automatically fetches permissions
const context: AuthContext = {
  user: {
    id: payload.userId,
    email: payload.email,
    code: payload.code,
    isVerified: payload.isVerified,
    roles: userRoles,        // Fetched from DB
    permissions: userPermissions // Fetched from DB
  },
  token,
  isAuthenticated: true
};
```

### 2. **Database Schema**

The RBAC system uses these tables:
- `users` - User accounts
- `roles` - Available roles (admin, user, etc.)
- `permissions` - Available permissions (users:read, roles:create, etc.)
- `user_roles` - Many-to-many: users ↔ roles
- `role_permissions` - Many-to-many: roles ↔ permissions

### 3. **Permission Checking**

The system provides multiple ways to check permissions:

#### Route-Level Protection
```typescript
// API Route with permission requirement
export const GET = withErrorHandling(async (request: NextRequest, { params }) => {
  return BaseRoute.handleAuthenticatedGetById(
    request,
    params,
    (id, auth) => roleController.getById(id),
    'Role',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLES_READ], // Dynamic check
      allowSelf: false
    }
  );
}, 'GET Role');
```

#### Manual Permission Checks
```typescript
// Check if user has specific permission
const hasPermission = AuthMiddleware.hasUserPermission(userId, PERMISSIONS.USERS_CREATE);

// Check multiple permissions
const canManageRoles = AuthMiddleware.hasAllPermissions(context, [
  PERMISSIONS.ROLES_READ,
  PERMISSIONS.ROLES_UPDATE
]);

// Check roles
const isAdmin = AuthMiddleware.hasUserRole(userId, 'admin');
```

## Key Features

### 1. **Real-Time Updates**
- Permissions are fetched fresh on each request
- Changes to user roles immediately affect access
- No need to re-login when permissions change

### 2. **Efficient Database Queries**
```typescript
// Single query to get all user permissions through role relationships
export async function getUserPermissions(userId: number): Promise<string[]> {
  const rows = await db
    .select({ slug: permissions.slug })
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
    .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true),
        eq(roles.isActive, true),
        or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, now))
      )
    );
}
```

### 3. **Permission Constants**
```typescript
export const PERMISSIONS = {
  // User permissions
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Role permissions
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  
  // Permission permissions
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_CREATE: 'permissions:create',
  PERMISSIONS_UPDATE: 'permissions:update',
  PERMISSIONS_DELETE: 'permissions:delete',
} as const;
```

## Usage Examples

### 1. **Protecting API Routes**
```typescript
// Require specific permissions
{
  requireAuth: true,
  requiredPermissions: [PERMISSIONS.USERS_READ],
  allowSelf: false
}

// Allow multiple permissions (OR logic)
{
  requireAuth: true,
  requiredPermissions: [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_READ],
  requireAllPermissions: false
}

// Require all permissions (AND logic)
{
  requireAuth: true,
  requiredPermissions: [PERMISSIONS.USERS_UPDATE, PERMISSIONS.ADMIN_WRITE],
  requireAllPermissions: true
}
```

### 2. **Manual Checks in Controllers**
```typescript
export class UserController extends BaseController {
  async getUsers(auth?: AuthContext) {
    // Check if user can read users
    if (!AuthMiddleware.hasAnyPermission(auth, [PERMISSIONS.USERS_READ])) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Proceed with operation
    return await this.service.getAll();
  }
}
```

### 3. **Conditional UI Logic**
```typescript
// In React components
const canCreateUsers = AuthMiddleware.hasUserPermission(user.id, PERMISSIONS.USERS_CREATE);
const canManageRoles = AuthMiddleware.hasAllPermissions(authContext, [
  PERMISSIONS.ROLES_READ,
  PERMISSIONS.ROLES_UPDATE
]);

return (
  <div>
    {canCreateUsers && <CreateUserButton />}
    {canManageRoles && <ManageRolesSection />}
  </div>
);
```

## Helper Functions

### AuthMiddleware Utilities
```typescript
// Refresh user context (when permissions change)
const updatedContext = await AuthMiddleware.refreshUserContext(currentContext);

// Get fresh context by user ID
const context = await AuthMiddleware.getUserContextById(userId);

// Quick permission checks
const hasPermission = await AuthMiddleware.hasUserPermission(userId, permission);
const hasRole = await AuthMiddleware.hasUserRole(userId, role);

// Batch permission checks
const hasAny = AuthMiddleware.hasAnyPermission(context, permissionArray);
const hasAll = AuthMiddleware.hasAllPermissions(context, permissionArray);
```

## Benefits

1. **Security**: Real-time permission enforcement
2. **Flexibility**: Easy to add/remove permissions without code changes
3. **Performance**: Efficient database queries with proper joins
4. **Maintainability**: Centralized permission logic
5. **Scalability**: Supports complex role hierarchies

## Management

### Adding New Permissions
1. Add to `PERMISSIONS` constants
2. Run sync script to update database
3. Assign to appropriate roles
4. Use in route protection or manual checks

### Assigning Permissions to Users
1. Create/update user roles in `user_roles` table
2. Permissions are automatically inherited from roles
3. Changes take effect immediately on next request

This dynamic system ensures that access control is always up-to-date with the current state of the database!
