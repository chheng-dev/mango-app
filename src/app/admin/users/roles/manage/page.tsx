'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  History,
  Filter,
  RotateCcw
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
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
  permissions?: Permission[];
}

function UserRoleManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [originalRoles, setOriginalRoles] = useState<number[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadData();
    } else {
      setError('No user ID provided');
    }
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load user data and role/permission data in parallel
      const [
        userResponse,
        rolesResponse,
        permissionsResponse
      ] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch('/api/rbac/roles'),
        fetch('/api/rbac/permissions')
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success && userData.data) {
          setUser(userData.data);
          const userRoleIds = userData.data.roles?.map((role: Role) => role.id) || [];
          const userPermissionIds = userData.data.permissions?.map((perm: Permission) => perm.id) || [];
          setSelectedRoles(userRoleIds);
          setSelectedPermissions(userPermissionIds);
          setOriginalRoles(userRoleIds);
          setOriginalPermissions(userPermissionIds);
        }
      } else {
        throw new Error('Failed to load user data');
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setAvailableRoles(rolesData.data || []);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setAvailablePermissions(permissionsData.data || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load user and role data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = useCallback((roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  }, []);

  const handlePermissionToggle = useCallback((permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/users/${user.id}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roles: selectedRoles,
          permissions: selectedPermissions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Changes saved successfully!');
        setOriginalRoles([...selectedRoles]);
        setOriginalPermissions([...selectedPermissions]);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to save changes');
      }

    } catch (error) {
      console.error('Error saving roles/permissions:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = useCallback(() => {
    setSelectedRoles([...originalRoles]);
    setSelectedPermissions([...originalPermissions]);
    setSuccess(null);
    setError(null);
  }, [originalRoles, originalPermissions]);

  const hasChanges = useCallback(() => {
    const rolesChanged = JSON.stringify(selectedRoles.sort()) !== JSON.stringify(originalRoles.sort());
    const permissionsChanged = JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(originalPermissions.sort());
    return rolesChanged || permissionsChanged;
  }, [selectedRoles, selectedPermissions, originalRoles, originalPermissions]);

  // Filter functions
  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPermissions = availablePermissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResource = filterResource === 'all' || permission.resource === filterResource;
    
    return matchesSearch && matchesResource;
  });

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const availableResources = [...new Set(availablePermissions.map(p => p.resource))];

  // Calculate progress
  const roleProgress = availableRoles.length > 0 ? (selectedRoles.length / availableRoles.length) * 100 : 0;
  const permissionProgress = availablePermissions.length > 0 ? (selectedPermissions.length / availablePermissions.length) * 100 : 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !user) {
    return (
      <ProtectedRoute>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Role Management</h1>
              <p className="text-muted-foreground">
                Manage user roles and permissions
              </p>
            </div>
          </div>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Role Management</h1>
              <p className="text-muted-foreground">
                Manage roles and permissions for {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => loadData()} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasChanges() && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasChanges()}
              className="min-w-[120px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`/placeholder-${user.id}.jpg`} />
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  <Badge variant="outline">{user.code}</Badge>
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
                <p className="text-muted-foreground mb-3">{user.email}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Current Roles
                    </div>
                    <div className="font-medium">{selectedRoles.length} of {availableRoles.length}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Current Permissions
                    </div>
                    <div className="font-medium">{selectedPermissions.length} of {availablePermissions.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Member Since</div>
                    <div className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-medium">{hasChanges() ? 'Unsaved Changes' : 'Up to Date'}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Overview */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Roles</span>
                    <span className="text-sm font-medium">{selectedRoles.length}/{availableRoles.length}</span>
                  </div>
                  <Progress value={roleProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Permissions</span>
                    <span className="text-sm font-medium">{selectedPermissions.length}/{availablePermissions.length}</span>
                  </div>
                  <Progress value={permissionProgress} className="h-2" />
                </div>
                {hasChanges() && (
                  <div className="pt-2 border-t">
                    <Badge variant="outline" className="w-full justify-center">
                      <History className="w-3 h-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Roles Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                  ) : (
                    availableRoles
                      .filter(role => selectedRoles.includes(role.id))
                      .map(role => (
                        <Badge key={role.id} variant="secondary" className="block text-center">
                          {role.name}
                        </Badge>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles and permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={filterResource}
                      onChange={(e) => setFilterResource(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="all">All Resources</option>
                      {availableResources.map(resource => (
                        <option key={resource} value={resource}>
                          {resource.charAt(0).toUpperCase() + resource.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roles ({selectedRoles.length})
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Permissions ({selectedPermissions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="roles" className="space-y-4">
                {filteredRoles.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No roles found matching your search.' : 'No roles available.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRoles.map((role) => (
                      <Card key={role.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={selectedRoles.includes(role.id)}
                              onCheckedChange={() => handleRoleToggle(role.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Label 
                                  htmlFor={`role-${role.id}`} 
                                  className="font-medium cursor-pointer"
                                >
                                  {role.name}
                                </Label>
                                {!role.isActive && (
                                  <Badge variant="secondary" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs mb-2">
                                {role.slug}
                              </Badge>
                              {role.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {role.description}
                                </p>
                              )}
                              {role.permissions && role.permissions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {role.permissions.slice(0, 2).map((permission) => (
                                    <Badge key={permission.id} variant="secondary" className="text-xs">
                                      {permission.action}
                                    </Badge>
                                  ))}
                                  {role.permissions.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{role.permissions.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            {selectedRoles.includes(role.id) && (
                              <ShieldCheck className="h-5 w-5 text-green-600 mt-1" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                {Object.keys(groupedPermissions).length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || filterResource !== 'all' ? 'No permissions found matching your filters.' : 'No permissions available.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <Card key={resource}>
                      <CardHeader>
                        <CardTitle className="text-lg capitalize flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {resource} Permissions
                          <Badge variant="outline" className="ml-auto">
                            {permissions.filter(p => selectedPermissions.includes(p.id)).length}/{permissions.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                            >
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <Label 
                                  htmlFor={`permission-${permission.id}`} 
                                  className="text-sm font-medium cursor-pointer block mb-1"
                                >
                                  {permission.name}
                                </Label>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {permission.action}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {permission.slug}
                                  </span>
                                </div>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                              {selectedPermissions.includes(permission.id) && (
                                <ShieldCheck className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function UserRoleManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <UserRoleManagementContent />
    </Suspense>
  );
}
