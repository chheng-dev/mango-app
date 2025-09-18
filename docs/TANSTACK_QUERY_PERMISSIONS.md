# TanStack Query Permission System

## Overview
Migrated from manual state management to TanStack Query for better server synchronization, automatic caching, and error handling in the permission system.

## Key Components

### 1. `usePermissions` Hook (`/hooks/usePermissions.ts`)
- **TanStack Query Integration**: Uses `useQuery` for automatic caching and background refetching
- **Server Synchronization**: Automatically syncs with server state on window focus, mount, etc.
- **Proper Loading States**: Handles auth loading and permission loading separately
- **Error Handling**: Built-in error states and retry logic
- **Cache Management**: 5-minute stale time, 10-minute garbage collection time

```typescript
const { 
  permissions, 
  isSuperAdmin, 
  isLoading, 
  hasPermission, 
  refetch, 
  isError 
} = usePermissions();
```

### 2. Query Keys (`/lib/queries/queryKeys.ts`)
- **Centralized Management**: All query keys in one place
- **Type Safety**: Typed query keys for better IntelliSense
- **Consistent Naming**: Standardized query key structure

### 3. Cache Invalidation (`/hooks/useInvalidateQueries.ts`)
- **Targeted Invalidation**: Invalidate specific user permissions
- **Bulk Operations**: Invalidate all users, roles, or RBAC queries
- **Manual Control**: Clear all cache when needed

```typescript
const { 
  invalidateUserPermissions, 
  invalidateAll 
} = useInvalidateQueries();
```

## Benefits

### ✅ **Automatic Server Synchronization**
- No more lost permissions on page refresh
- Automatic background updates when window regains focus
- Smart caching prevents unnecessary API calls

### ✅ **Better Performance**
- 5-minute cache reduces server load
- Background refetching keeps data fresh
- Optimistic updates possible

### ✅ **Enhanced Developer Experience**
- Built-in loading states
- Automatic error handling and retry
- DevTools integration for debugging

### ✅ **Consistent State Management**
- Single source of truth for permissions
- Automatic cache invalidation when roles change
- Predictable data flow

## Usage Examples

### Basic Permission Checking
```typescript
const { hasPermission, isSuperAdmin } = usePermissions();

// Check specific permissions
if (hasPermission(['users:read', 'users:list'])) {
  // Show user management
}

// Super admin bypass
if (isSuperAdmin) {
  // Show all features
}
```

### Cache Management
```typescript
// Refresh permissions manually
const { refetch } = usePermissions();
refetch();

// Invalidate when roles change
const { invalidateUserPermissions } = useInvalidateQueries();
invalidateUserPermissions(userId);
```

### Loading and Error States
```typescript
const { isLoading, isError } = usePermissions();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage />;
```

## Migration Benefits

### Before (Manual State)
- Manual useEffect dependency management
- Race conditions on page refresh
- Manual error handling
- Custom caching implementation
- Lost state on refresh

### After (TanStack Query)
- Automatic dependency management
- No race conditions
- Built-in error handling
- Professional caching with configurable policies
- Persistent state across refreshes
- Background updates
- DevTools integration

## Query Configuration

```typescript
useQuery({
  queryKey: queryKeys.auth.permissions(userId),
  queryFn: () => fetchUserPermissions(userId),
  enabled: !!(isAuthenticated && userId && !authLoading),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
  retry: 2,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
});
```

This configuration ensures:
- Data is considered fresh for 5 minutes
- Cached data is kept for 10 minutes
- 2 retry attempts on failure
- No refetch on window focus (to prevent unnecessary calls)
- Always refetch on component mount
