'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  code: string;
  isActive: boolean;
  isVerified: boolean;
  phoneNumber?: string;
  createdAt: string;
  roles?: Role[];
}

interface ChangeTracker {
  type: 'role';
  action: 'add' | 'remove';
  item: Role;
  timestamp: Date;
}

function UserRoleManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Available data
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  
  // User's current assignments
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  
  // Selected state (what will be saved)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  
  // Change tracking
  const [changes, setChanges] = useState<ChangeTracker[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  // Track changes when selections change
  useEffect(() => {
    trackChanges();
  }, [selectedRoles, userRoles, availableRoles]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all data in parallel
      const [
        userResponse,
        rolesResponse,
        permissionsResponse,
        userRolesResponse,
        userPermissionsResponse
      ] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch('/api/rbac/roles'),
        fetch('/api/rbac/permissions'),
        fetch(`/api/users/${userId}/roles`),
        fetch(`/api/users/${userId}/permissions`)
      ]);

      if (!userResponse.ok) {
        throw new Error('Failed to load user data');
      }

      const userData = await userResponse.json();
      setUser(userData.data);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setAvailableRoles(rolesData.data || []);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setAvailablePermissions(permissionsData.data || []);
      }

      if (userRolesResponse.ok) {
        const userRolesData = await userRolesResponse.json();
        const roles = userRolesData.data || [];
        setUserRoles(roles);
        setSelectedRoles(roles.map((role: Role) => role.id));
      }

      if (userPermissionsResponse.ok) {
        const userPermissionsData = await userPermissionsResponse.json();
        const permissions = userPermissionsData.data || [];
        setUserPermissions(permissions);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const trackChanges = () => {
    const newChanges: ChangeTracker[] = [];
    const currentRoleIds = userRoles.map(role => role.id);
    
    // Track role additions
    selectedRoles.forEach(roleId => {
      if (!currentRoleIds.includes(roleId)) {
        const role = availableRoles.find(r => r.id === roleId);
        if (role) {
          newChanges.push({
            type: 'role',
            action: 'add',
            item: role,
            timestamp: new Date()
          });
        }
      }
    });
    
    // Track role removals
    currentRoleIds.forEach(roleId => {
      if (!selectedRoles.includes(roleId)) {
        const role = userRoles.find(r => r.id === roleId);
        if (role) {
          newChanges.push({
            type: 'role',
            action: 'remove',
            item: role,
            timestamp: new Date()
          });
        }
      }
    });
    
    setChanges(newChanges);
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!user || changes.length === 0) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use the bulk update endpoint
      const response = await fetch(`/api/users/${user.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roleIds: selectedRoles,
          assignedBy: 1 // TODO: Get current user ID from auth context
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update roles');
      }

      setSuccess(`Successfully updated ${changes.length} role assignment${changes.length !== 1 ? 's' : ''}`);
      setChanges([]);
      
      // Reload data to get updated state
      await loadData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/users');
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleSelectAll = () => {
    setSelectedRoles(availableRoles.filter(role => role.isActive).map(role => role.id));
  };

  const handleClearAll = () => {
    setSelectedRoles([]);
  };

  // Filtering and grouping
  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPermissions = availablePermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Calculate derived permissions from selected roles
  const derivedPermissions = selectedRoles.reduce((acc, roleId) => {
    const role = availableRoles.find(r => r.id === roleId);
    if (role && role.permissions) {
      role.permissions.forEach(permission => {
        if (!acc.find(p => p.id === permission.id)) {
          acc.push(permission);
        }
      });
    }
    return acc;
  }, [] as Permission[]);

  // Statistics
  const stats = {
    totalRoles: availableRoles.length,
    activeRoles: availableRoles.filter(r => r.isActive).length,
    selectedCount: selectedRoles.length,
    changesCount: changes.length,
    permissionsGranted: derivedPermissions.length
  };

  if (!userId) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            User ID is required. Please select a user from the users page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Manage User Access
          </h1>
          <p className="text-muted-foreground">
            {user ? `Configure roles and permissions for ${user.name}` : 'Loading user...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || changes.length === 0} 
            className="min-w-[140px]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes ({changes.length})
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {loading && !user ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : user ? (
        <>
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Current user details and access summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/api/users/${user.id}/avatar`} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{user.code}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="flex flex-col gap-1 mt-1">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.isVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <UserX className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Access</Label>
                    <div className="mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        {userRoles.length} Role{userRoles.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ShieldCheck className="h-4 w-4" />
                        {userPermissions.length} Permission{userPermissions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Pending Changes</Label>
                    <div className="mt-1">
                      {changes.length > 0 ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {changes.length} change{changes.length !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          No changes
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Total Roles</p>
                    <p className="text-2xl font-bold">{stats.totalRoles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-green-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Active Roles</p>
                    <p className="text-2xl font-bold">{stats.activeRoles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Selected</p>
                    <p className="text-2xl font-bold">{stats.selectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Changes</p>
                    <p className="text-2xl font-bold">{stats.changesCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Permissions</p>
                    <p className="text-2xl font-bold">{stats.permissionsGranted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles and permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSelectAll} variant="outline" size="sm">
                    Select All Active
                  </Button>
                  <Button onClick={handleClearAll} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Tracker */}
          {changes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pending Changes
                </CardTitle>
                <CardDescription>
                  Changes that will be applied when you save
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {changes.map((change, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      {change.action === 'add' ? (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {change.action === 'add' ? 'Add' : 'Remove'} {change.type}: {change.item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{change.item.slug}</p>
                      </div>
                      <Badge variant={change.action === 'add' ? 'default' : 'secondary'} className="text-xs">
                        {change.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Roles ({selectedRoles.length})
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Permissions ({derivedPermissions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Available Roles</h3>
                        <p className="text-sm text-muted-foreground">
                          Select roles to assign to this user
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress 
                          value={(selectedRoles.length / Math.max(stats.activeRoles, 1)) * 100} 
                          className="w-32" 
                        />
                        <Badge variant="outline">
                          {selectedRoles.length} of {filteredRoles.length} selected
                        </Badge>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[600px]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-4">
                        {filteredRoles.map((role) => {
                          const isSelected = selectedRoles.includes(role.id);
                          const isCurrentRole = userRoles.some(ur => ur.id === role.id);
                          const isChanged = isSelected !== isCurrentRole;
                          
                          return (
                            <Card 
                              key={role.id} 
                              className={`transition-all cursor-pointer hover:shadow-md ${
                                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                              } ${isChanged ? 'border-orange-300' : ''}`}
                              onClick={() => handleRoleToggle(role.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <div className="flex items-center pt-1">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleRoleToggle(role.id)}
                                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium">{role.name}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {role.slug}
                                      </Badge>
                                      {!role.isActive && (
                                        <Badge variant="secondary" className="text-xs">
                                          Inactive
                                        </Badge>
                                      )}
                                      {isChanged && (
                                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                                          Changed
                                        </Badge>
                                      )}
                                    </div>
                                    {role.description && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {role.description}
                                      </p>
                                    )}
                                    {role.permissions && role.permissions.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {role.permissions.slice(0, 3).map((permission) => (
                                          <Badge key={permission.id} variant="secondary" className="text-xs">
                                            {permission.slug}
                                          </Badge>
                                        ))}
                                        {role.permissions.length > 3 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{role.permissions.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <ShieldCheck className="h-5 w-5 text-green-600 mt-1" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="permissions">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Derived Permissions</h3>
                        <p className="text-sm text-muted-foreground">
                          Permissions granted through selected roles (read-only)
                        </p>
                      </div>
                      <Badge variant="outline">
                        {Object.keys(groupedPermissions).length} resource{Object.keys(groupedPermissions).length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4 pr-4">
                        {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                          <Card key={resource}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base capitalize flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {resource} Permissions
                              </CardTitle>
                              <CardDescription>
                                {permissions.length} permission{permissions.length !== 1 ? 's' : ''} in this resource
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {permissions.map((permission) => {
                                  const isGranted = derivedPermissions.some(dp => dp.id === permission.id);
                                  
                                  return (
                                    <div
                                      key={permission.id}
                                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                        isGranted
                                          ? 'bg-green-50 border-green-200'
                                          : 'bg-muted/30 border-muted'
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={isGranted}
                                          disabled={true}
                                          className="h-4 w-4 text-primary border-gray-300 rounded"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-medium">
                                          {permission.name}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {permission.action}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {permission.slug}
                                          </span>
                                        </div>
                                        {permission.description && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {permission.description}
                                          </p>
                                        )}
                                      </div>
                                      {isGranted && (
                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default function UserRolePermissionPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      }>
        <UserRoleManagementContent />
      </Suspense>
    </ProtectedRoute>
  );
}
