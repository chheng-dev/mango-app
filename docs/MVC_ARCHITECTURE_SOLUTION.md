# MVC Architecture Implementation Guide

## Problem Solved: Duplicate Architecture

The original codebase had **architectural duplication** where both `BaseController` and `BaseService` were handling similar CRUD operations, creating confusion about layer responsibilities.

## Solution: Proper MVC Pattern

We've implemented a clean separation of concerns using the MVC pattern:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Models    │◄───│  Services   │◄───│ Controllers │
│ (Data Layer)│    │(Business    │    │(HTTP Layer) │
│             │    │ Logic)      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
   Direct DB          Validation           HTTP Requests
   Operations         Business Rules      Response Formatting
```

## Architecture Layers

### 1. Models (Data Access Layer)

**File**: `src/lib/models/BaseModel.ts`
**Purpose**: Handle direct database operations
**Responsibilities**:
- CRUD operations
- Query building
- Simple data validation
- Database transactions

**Example**: `RoleModel.ts`
```typescript
export class RoleModel extends BaseModel<RoleSelect, RoleInsert> {
  // Direct database operations only
  async findWithPermissions(roleId: number) {
    return await db.select(...).from(roles).where(...)
  }
}
```

### 2. Services (Business Logic Layer)

**File**: `src/lib/services/BaseService.ts`
**Purpose**: Business logic and orchestration
**Responsibilities**:
- Complex validation
- Business rules enforcement
- Data transformation
- Orchestrate between models
- Handle workflows

**Example**: `RoleService.ts`
```typescript
export class RoleService extends BaseService<RoleModel, RoleSelect, RoleInsert> {
  // Business logic only
  async createRole(data: RoleInsert) {
    // Validation
    const errors = this.validateData(data);
    
    // Business rules
    const businessCheck = await this.validateBusinessRules(data);
    
    // Delegate to model
    return await this.model.create(processedData);
  }
}
```

### 3. Controllers (HTTP API Layer)

**File**: `src/lib/controllers/RoleController.clean.ts`
**Purpose**: Handle HTTP requests and responses
**Responsibilities**:
- HTTP request/response handling
- Authentication/authorization
- Request validation
- Response formatting
- Status codes

**Example**: `RoleController.clean.ts`
```typescript
export class RoleController {
  // HTTP handling only
  async createRole(request: NextRequest) {
    const body = await request.json();
    
    // Basic request validation
    if (!body.name) {
      return NextResponse.json(error, { status: 400 });
    }
    
    // Delegate to service
    const result = await this.roleService.createRole(body);
    
    // Format response
    return NextResponse.json(this.formatResponse(result));
  }
}
```

### 4. Hooks (React Integration Layer)

**File**: `src/hooks/useRoles.clean.ts`
**Purpose**: React state management and UI integration
**Responsibilities**:
- React state management
- Cache management (TanStack Query)
- Loading/error states
- Optimistic updates

## Key Improvements

### ✅ Before (Problematic)
```typescript
// BaseController.ts - CRUD operations
class BaseController {
  async create(data) { /* DB operations */ }
  async getById(id) { /* DB operations */ }
}

// BaseService.ts - ALSO CRUD operations (DUPLICATE!)
class BaseService {
  async create(data) { /* SAME DB operations */ }
  async findById(id) { /* SAME DB operations */ }
}
```

### ✅ After (Clean MVC)
```typescript
// BaseModel.ts - Data access only
class BaseModel {
  async create(data) { /* DB operations */ }
  async findById(id) { /* DB operations */ }
}

// BaseService.ts - Business logic only
class BaseService {
  async create(data) {
    /* Validation + Business rules */
    return await this.model.create(processedData);
  }
}

// Controller.ts - HTTP handling only
class Controller {
  async createEndpoint(request) {
    /* Request validation + response formatting */
    return await this.service.create(requestData);
  }
}
```

## Usage Examples

### 1. In API Routes
```typescript
// app/api/roles/route.ts
import { roleController } from '@/lib/controllers/RoleController.clean';

export async function GET(request: NextRequest) {
  return await roleController.getAllRoles(request);
}

export async function POST(request: NextRequest) {
  return await roleController.createRole(request);
}
```

### 2. In React Components
```typescript
// components/RoleManager.tsx
import { useRoles, useCreateRole } from '@/hooks/useRoles.clean';

export function RoleManager() {
  const { data: roles, isLoading } = useRoles();
  const createRole = useCreateRole();
  
  // Component logic here
}
```

### 3. Direct Service Usage (Server-side)
```typescript
// Server-side operations
import { RoleService } from '@/lib/services/RoleService';

const roleService = new RoleService();
const result = await roleService.createRole(roleData);
```

## Benefits of This Architecture

### 🎯 **Clear Separation of Concerns**
- Each layer has a single responsibility
- No duplicate code between layers
- Easy to test and maintain

### 🔄 **Reusable Services**
- Services can be used in API routes, server actions, or background jobs
- Business logic is centralized
- Consistent validation across the app

### 🛡️ **Type Safety**
- Full TypeScript support
- Consistent interfaces across layers
- Better IDE support and error catching

### 🚀 **Scalable Structure**
- Easy to add new entities
- Consistent patterns
- Team-friendly codebase

## Migration Path

1. **Replace BaseController CRUD** → Use BaseModel for data access
2. **Simplify BaseService** → Focus only on business logic
3. **Create HTTP Controllers** → Handle API requests/responses
4. **Update Hooks** → Use services instead of direct API calls

## File Structure
```
src/lib/
├── models/
│   ├── BaseModel.ts      # Data access layer
│   └── RoleModel.ts      # Role-specific data operations
├── services/
│   ├── BaseService.ts    # Business logic layer
│   └── RoleService.ts    # Role business logic
├── controllers/
│   └── RoleController.clean.ts  # HTTP API layer
└── hooks/
    └── useRoles.clean.ts # React integration layer
```

This architecture eliminates the previous duplication and provides a clean, maintainable, and scalable codebase following proper MVC principles.
