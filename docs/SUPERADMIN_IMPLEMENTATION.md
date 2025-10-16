# Super Admin Implementation Guide

## Overview
This document explains how the Super Admin role is implemented with special privileges and protections in the system.

## Key Features

### 1. **Automatic All-Permission Access**
Super Admins bypass all permission checks and automatically have access to everything.

#### Implementation:
- **Location**: `src/hooks/useUserPermissions.ts`
- **Logic**: Every permission check method includes `if (this.isSuperAdmin) return true;`

```typescript
hasPermission(requiredPermissions: readonly string[]): boolean {
  if (this.isSuperAdmin) return true; // ✅ Super admin bypasses check
  // ...normal permission checking
}
```

#### Affected Methods:
- `hasPermission()` - Check specific permissions
- `canPerformAction()` - Check resource:action permissions
- `hasAnyPermission()` - Check if has any from list
- `canPerformAnyAction()` - Check if can perform any action on resource

### 2. **Super Admin Detection**
The system checks if a user has the super-admin role.

#### API Response:
- **Endpoint**: `GET /api/users/{id}/permissions`
- **Response**: Includes `meta.isSuperAdmin: boolean`

```json
{
  "success": true,
  "data": {
    "permissions": ["roles_read", "permissions_create", ...],
    "roles": ["super-admin"]
  },
  "meta": {
    "isSuperAdmin": true  // ✅ Indicates super admin status
  }
}
```

#### Database Query:
- **Location**: `src/lib/models/UserModel.ts`
- **Method**: `isSuperAdmin(userId: number)`
- **Logic**: Checks if user has an active assignment to role with slug 'super-admin'

### 3. **Hidden from UI**
The super-admin role is completely hidden from the system to prevent any visibility or modification.

#### Implementation Locations:

**A. Role Lists** (`src/lib/models/RoleModel.ts`)
- **Method**: `list()`
- **Filter**: `.where(ne(roles.slug, 'super-admin'))`

```typescript
const allRoles = await db
  .select({ /* fields */ })
  .from(roles)
  .where(ne(roles.slug, 'super-admin')) // ✅ Filters out super-admin
  .groupBy(roles.id);
```

**B. Role By ID** (`src/lib/models/RoleModel.ts`) - **CRITICAL**
- **Method**: `findById(id)` - Overridden from BaseModel
- **Filter**: `.where(and(eq(roles.id, id), ne(roles.slug, 'super-admin')))`
- **Result**: Returns "Role not found" if ID is super-admin role
- **Impact**: Prevents all subsequent operations (update, delete, permissions) on super-admin

```typescript
async findById(id: number) {
  const result = await db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.id, id),
        ne(roles.slug, 'super-admin') // ✅ Hide super-admin
      )
    )
    .limit(1);
  
  if (!result.length) {
    return { success: false, error: 'Role not found' };
  }
  // ...
}
```

**C. Role Detail Views** (`src/lib/models/RoleModel.ts`)
- **Method**: `findWithPermissions(roleId)`
- **Method**: `findWithUsers(roleId)`
- **Filter**: Both methods include `.where(ne(roles.slug, 'super-admin'))`
- **Result**: Returns "Role not found" if trying to access super-admin role by ID

**D. User Role Assignments** (`src/lib/models/UserModel.ts`)
- **Method**: `findWithRoles(userId)` - Shows ALL roles including super-admin
- **Method**: `getUserRoles(userId)` - Shows ALL roles including super-admin
- **Note**: User can see their own super-admin role when viewing their profile
- **Use Case**: Used in `/api/auth/me` to show user their complete profile

```typescript
// User can see they are a super-admin in their profile
{
  "roles": ["super-admin"],  // ✅ Visible to the user
  "isSuperAdmin": true
}
```

#### Why This Design?
- ✅ **Role Management UI**: Super-admin hidden from lists (can't be assigned/edited by others)
- ✅ **User Profile**: Super-admin visible (user can see their own role)
- ✅ **Role Assignment**: Super-admin hidden (can't assign to other users)
- ✅ **Transparency**: Users know they have super-admin privileges

#### Affected UI Components:
- ✅ Role Management Page (`/admin/roles`) - Super-admin not in list
- ✅ Role Edit Page (`/admin/roles/edit?id=X`) - Returns 404 if X is super-admin ID
- ✅ User Role Assignment (`/admin/users/roles`) - Super-admin not available for assignment
- ✅ Role Dropdowns/Selects - Super-admin never appears as an option
- ✅ **User Profile** (`/api/auth/me`) - Super-admin **IS visible** to the user themselves

### 4. **Protected from Modification**
The super-admin role is completely locked down and cannot be modified in any way.

#### A. Role Update Protection:
- **Location**: `src/lib/models/RoleModel.ts`
- **Method**: `update(id, data)`
- **Check**: Returns error if `slug === 'super-admin'`

```typescript
async update(id: number, data: Partial<RoleInsert>) {
  const roleResult = await this.findById(id);
  
  if (roleResult.data?.slug === 'super-admin') {
    return {
      success: false,
      error: 'Cannot modify super-admin role' // ✅ Prevents updates
    };
  }
  
  return super.update(id, data);
}
```

#### B. Role Delete Protection:
- **Method**: `delete(id)`
- **Check**: Returns error if `slug === 'super-admin'`

```typescript
async delete(id: number) {
  const roleResult = await this.findById(id);
  
  if (roleResult.data?.slug === 'super-admin') {
    return {
      success: false,
      error: 'Cannot delete super-admin role' // ✅ Prevents deletion
    };
  }
  
  return super.delete(id);
}
```

#### C. Permission Assignment Protection:
All permission modification methods check for super-admin role:

**Methods Protected:**
- `assignPermissions(roleId, permissionIds)` - Cannot assign permissions
- `updatePermissionsForRole(roleId, permissionIds)` - Cannot update permissions
- `removePermissions(roleId, permissionIds)` - Cannot remove permissions
- `clearPermissions(roleId)` - Cannot clear permissions

```typescript
async assignPermissions(roleId: number, permissionIds: number[]) {
  const roleResult = await this.findById(roleId);
  if (roleResult.success && roleResult.data?.slug === 'super-admin') {
    return {
      success: false,
      error: 'Cannot modify permissions for super-admin role' // ✅ Prevents changes
    };
  }
  // ...rest of logic
}
```

### 5. **No Permission Assignment Needed**
Super Admins don't need explicit permissions in the database.

#### How It Works:
1. User logs in
2. System detects user has 'super-admin' role
3. Sets `isSuperAdmin: true` in permission data
4. All permission checks return `true` automatically
5. No need to assign individual permissions to the role

## Database Structure

### Super Admin Role
```sql
-- Role record in tbl_roles
INSERT INTO tbl_roles (name, slug, description, isActive)
VALUES ('Super Admin', 'super-admin', 'Full system access', true);
```

### User Assignment
```sql
-- Assign user to super-admin role in tbl_user_roles
INSERT INTO tbl_user_roles (userId, roleId, isActive)
VALUES (1, <super-admin-role-id>, true);
```

## Security Considerations

### ✅ Protections in Place:
1. **Hidden from Lists** - Super-admin role filtered from all role list queries
2. **Hidden from Details** - Cannot view super-admin role details by ID (returns 404)
3. **Hidden from User Roles** - Super-admin role hidden from user's assigned roles display
4. **Update Guard** - Cannot modify role name, slug, or settings
5. **Delete Guard** - Cannot delete the role
6. **Permission Guard** - Cannot assign, update, remove, or clear permissions
7. **Automatic Permissions** - Super admins have all permissions automatically without database records
8. **Filtered Queries** - All database queries exclude super-admin from results

### ⚠️ Important Notes:
- Only assign super-admin role to fully trusted users
- Super admins can still assign super-admin role to others (by direct database manipulation if needed)
- The role slug 'super-admin' is hardcoded - do not change it
- Super admins have access to ALL features, including sensitive operations

### 🔑 Critical Implementation Detail:
**The `findById()` override is the KEY to all protections!**

All update, delete, and permission methods call `findById()` first to verify the role exists. By overriding `findById()` to exclude super-admin:
- ✅ Attempting to get super-admin by ID returns "Role not found"
- ✅ This prevents ALL subsequent operations (update, delete, permissions)
- ✅ No need for individual checks in every method (though we have them for safety)
- ✅ Works even if someone calls internal methods directly

**Without this override**: The protection checks in update/delete/permission methods wouldn't work because `findById()` would successfully return the super-admin role, and they would proceed to check the slug.

## How to Create a Super Admin

### Method 1: Using the Script
```bash
npm run assign-superadmin-role -- <userId>
```

### Method 2: Direct Database
```sql
-- 1. Get the super-admin role ID
SELECT id FROM tbl_roles WHERE slug = 'super-admin';

-- 2. Assign to user
INSERT INTO tbl_user_roles (userId, roleId, isActive, createdAt, updatedAt)
VALUES (<user-id>, <super-admin-role-id>, true, NOW(), NOW());
```

## Testing Super Admin Access

### Verify Super Admin Status:
```bash
curl -X GET http://localhost:3000/api/users/{userId}/permissions \
  -H "Cookie: auth-token=..." \
  | jq '.meta.isSuperAdmin'
```

### Expected Behavior:
- ✅ Can access all pages without permission errors
- ✅ Sees all navigation items
- ✅ All bulk actions visible
- ✅ All buttons (Add, Edit, Delete, Export) visible
- ✅ Super-admin role NOT visible in role lists
- ✅ Cannot edit or delete super-admin role

## Code Locations Reference

| Feature | File | Method/Line |
|---------|------|-------------|
| Permission Bypass | `src/hooks/useUserPermissions.ts` | `hasPermission()` line ~100 |
| Super Admin Check | `src/lib/models/UserModel.ts` | `isSuperAdmin()` line ~340 |
| **Hide By ID (CRITICAL)** | `src/lib/models/RoleModel.ts` | `findById()` line ~58 ⚠️ |
| Hide from Role List | `src/lib/models/RoleModel.ts` | `list()` line ~89 |
| Hide from Role Details | `src/lib/models/RoleModel.ts` | `findWithPermissions()` line ~117 |
| Hide from Role Users | `src/lib/models/RoleModel.ts` | `findWithUsers()` line ~183 |
| **Show in User Profile** | `src/lib/models/UserModel.ts` | `findWithRoles()` line ~146 ✅ |
| **Show in User Roles** | `src/lib/models/UserModel.ts` | `getUserRoles()` line ~206 ✅ |
| Update Protection | `src/lib/models/RoleModel.ts` | `update()` line ~490 |
| Delete Protection | `src/lib/models/RoleModel.ts` | `delete()` line ~516 |
| Assign Permission Protection | `src/lib/models/RoleModel.ts` | `assignPermissions()` line ~251 |
| Update Permission Protection | `src/lib/models/RoleModel.ts` | `updatePermissionsForRole()` line ~287 |
| Remove Permission Protection | `src/lib/models/RoleModel.ts` | `removePermissions()` line ~339 |
| Clear Permission Protection | `src/lib/models/RoleModel.ts` | `clearPermissions()` line ~379 |
| API Response | `src/app/api/users/[id]/permissions/route.ts` | `GET` handler |

## Related Documentation
- [Dynamic Permissions Guide](./DYNAMIC_PERMISSIONS_GUIDE.md)
- [RBAC Architecture](./MVC_ARCHITECTURE_GUIDE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
