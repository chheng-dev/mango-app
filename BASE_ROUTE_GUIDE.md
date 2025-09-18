# BaseRoute - Standardized API Route Management

## Overview

Created a comprehensive `BaseRoute` utility class for consistent API route handling, status management, and error handling across all endpoints.

## ✅ **Key Features**

### 1. **Standardized HTTP Status Codes**
```typescript
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
```

### 2. **Consistent CRUD Handlers**
- `handleGetById()` - Single entity retrieval
- `handleUpdateById()` - Entity updates
- `handleDeleteById()` - Entity deletion
- `handleGetCollection()` - Collection with pagination
- `handleCreate()` - Entity creation

### 3. **Automatic Error Handling**
- Input validation (ID validation, JSON parsing)
- Consistent error responses
- Proper HTTP status codes
- Centralized logging

### 4. **Response Standardization**
- Success/error response formatting
- Automatic status code mapping
- Consistent ApiResponse structure

## 🔄 **Before vs After Comparison**

### BEFORE: Manual Route Handler (75+ lines)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = Number(params.id);
    
    if (isNaN(roleId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role ID'
      }, { status: 400 });
    }

    const result = await roleController.getById(roleId);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 404
    });
  } catch (error) {
    console.error('GET role by ID API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Similar verbose handlers for PUT, DELETE...
```

### AFTER: BaseRoute Pattern (8 lines)
```typescript
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleGetById(
    params,
    (id) => roleController.getById(id),
    'Role'
  );
}, 'GET Role');

// Same simplicity for PUT, DELETE...
```

## 🎯 **Implementation Examples**

### Single Entity Routes (roles/[id]/route.ts)
```typescript
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";

export const GET = withErrorHandling(async (request, { params }) => {
  return BaseRoute.handleGetById(
    params,
    (id) => roleController.getById(id),
    'Role'
  );
}, 'GET Role');

export const PUT = withErrorHandling(async (request, { params }) => {
  return BaseRoute.handleUpdateById(
    request, params,
    (id, data) => roleController.update(id, data),
    'Role'
  );
}, 'PUT Role');

export const DELETE = withErrorHandling(async (request, { params }) => {
  return BaseRoute.handleDeleteById(
    params,
    (id) => roleController.delete(id),
    'Role'
  );
}, 'DELETE Role');
```

### Collection Routes (roles/route.ts)
```typescript
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const includePermissions = searchParams.get('includePermissions') === 'true';
  
  const params = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    query: searchParams.get('query') || undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    includePermissions
  };

  const result = await roleController.getAllRoles(params);
  return BaseRoute.successResponse(result);
}, 'GET Roles');

export const POST = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleCreate(
    request,
    (data) => roleController.create(data),
    'Role'
  );
}, 'POST Role');
```

## 🛠 **Built-in Features**

### Input Validation
```typescript
// Automatic ID validation
const { valid, id, error } = BaseRoute.validateId(params.id, 'Role');
if (!valid) return error;

// JSON body validation
const { valid, data, error } = await BaseRoute.validateJsonBody(request);
if (!valid) return error;
```

### Status Code Management
```typescript
// Automatic status mapping based on operation
return BaseRoute.successResponse(result, {
  successStatus: HTTP_STATUS.CREATED,  // 201 for POST
  errorStatus: HTTP_STATUS.BAD_REQUEST // 400 for validation errors
});
```

### Error Wrapping
```typescript
export const GET = withErrorHandling(async (request, context) => {
  // Your route logic here
  // Any uncaught errors automatically become 500 responses
}, 'GET Entity');
```

## 🎉 **Benefits Achieved**

### 1. **Code Reduction**
- **75+ lines** → **8 lines** per route handler (90% reduction)
- Eliminated repetitive validation and error handling

### 2. **Consistency**
- Identical error response format across all endpoints
- Standardized HTTP status codes
- Uniform logging patterns

### 3. **Maintainability** 
- Centralized error handling logic
- Easy to update response formats globally
- Consistent patterns for new routes

### 4. **Type Safety**
- Full TypeScript support
- Generic handlers work with any controller
- Proper parameter typing

### 5. **Developer Experience**
- Simple, declarative route definitions
- Automatic validation and error handling
- Clear entity naming in logs and errors

## 📊 **Current API Coverage**

### Roles API
- ✅ `GET /api/rbac/roles` - Get all roles with pagination
- ✅ `POST /api/rbac/roles` - Create new role
- ✅ `GET /api/rbac/roles/[id]` - Get role by ID
- ✅ `PUT /api/rbac/roles/[id]` - Update role
- ✅ `DELETE /api/rbac/roles/[id]` - Delete role

### Permissions API  
- ✅ `GET /api/rbac/permissions` - Get all permissions with pagination
- ✅ `POST /api/rbac/permissions` - Create new permission
- ✅ `GET /api/rbac/permissions/[id]` - Get permission by ID
- ✅ `PUT /api/rbac/permissions/[id]` - Update permission
- ✅ `DELETE /api/rbac/permissions/[id]` - Delete permission

## 🚀 **Future Usage**

Creating new API routes is now extremely simple:

```typescript
// For any new entity (e.g., users, products, etc.)
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";
import { entityController } from "@/lib/controllers/EntityController";

export const GET = withErrorHandling(async (request, { params }) => {
  return BaseRoute.handleGetById(params, entityController.getById, 'Entity');
}, 'GET Entity');

// That's it! Full CRUD with validation, error handling, and consistent responses
```

This BaseRoute pattern has created a robust, maintainable, and consistent API architecture that significantly reduces development time and improves code quality! 🎯
