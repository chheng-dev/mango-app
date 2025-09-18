'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Search,
  UserCheck,
  UserX
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
  roles?: Role[];
  permissions?: Permission[];
}

interface RolePermissionModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading?: boolean;
}

export function RolePermissionModal({
  user,
  isOpen,
  onClose,
  onSave,
  loading = false
}: RolePermissionModalProps) {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setError(null);
      loadInitialData();
    }
  }, [isOpen, user]);

  const loadInitialData = async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      // Load available roles and permissions
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/rbac/roles'),
        fetch('/api/rbac/permissions')
      ]);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setAvailableRoles(rolesData.data || []);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setAvailablePermissions(permissionsData.data || []);
      }

      // Load user's current roles and permissions
      if (user?.roles) {
        setUserRoles(user.roles);
        setSelectedRoles(user.roles.map(role => role.id));
      }

      if (user?.permissions) {
        setUserPermissions(user.permissions);
        setSelectedPermissions(user.permissions.map(perm => perm.id));
      }

    } catch (error) {
      console.error('Error loading role/permission data:', error);
      setError('Failed to load roles and permissions. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const data = {
        userId: user.id,
        roles: selectedRoles,
        permissions: selectedPermissions
      };
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving roles/permissions:', error);
      setError('Failed to save changes. Please try again.');
    }
  };

  const resetForm = () => {
    setActiveTab('roles');
    setSearchTerm('');
    setSelectedRoles([]);
    setSelectedPermissions([]);
    setError(null);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Roles & Permissions
          </DialogTitle>
          <DialogDescription>
            Assign roles and permissions to <strong>{user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* User Info Card */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/placeholder-${user.id}.jpg`} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
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
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {userRoles.length} Role{userRoles.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {userPermissions.length} Permission{userPermissions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles and permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Roles ({selectedRoles.length})
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Permissions ({selectedPermissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loadingData ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRoles.map((role) => (
                    <Card key={role.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={selectedRoles.includes(role.id)}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Label 
                                htmlFor={`role-${role.id}`} 
                                className="font-medium cursor-pointer"
                              >
                                {role.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {role.slug}
                              </Badge>
                              {!role.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {role.description}
                              </p>
                            )}
                            {role.permissions && role.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
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
                          {selectedRoles.includes(role.id) && (
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loadingData ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <Card key={resource}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base capitalize flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {resource} Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <Label 
                                  htmlFor={`permission-${permission.id}`} 
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
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
                              {selectedPermissions.includes(permission.id) && (
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || loadingData}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
