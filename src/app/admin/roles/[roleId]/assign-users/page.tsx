'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Users, 
  ArrowLeft,
  Search,
  UserCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  name: string;
  email: string;
  code: string;
  isActive: boolean;
  isVerified: boolean;
  roles?: Role[];
}

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
}

function AssignUsersPageContent() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.roleId as string;

  const [role, setRole] = useState<Role | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load role and user data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load role details
      const roleResponse = await fetch(`/api/rbac/roles/${roleId}`);
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        setRole(roleData.data);
      } else {
        throw new Error('Failed to load role details');
      }

      // Load all users
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const allUsers = usersData.data || [];

        // Separate assigned and available users
        const assigned = allUsers.filter((user: User) => 
          user.roles?.some(role => role.id === parseInt(roleId))
        );
        const available = allUsers.filter((user: User) => 
          !user.roles?.some(role => role.id === parseInt(roleId))
        );

        setAssignedUsers(assigned);
        setAvailableUsers(available);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId, loadData]);

  // Handle user selection
  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle assign users to role
  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/rbac/roles/${roleId}/assign-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers
        }),
      });

      if (response.ok) {
        setSuccess(`Successfully assigned ${selectedUsers.length} user(s) to ${role?.name}`);
        setSelectedUsers([]);
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign users');
      }
    } catch (error) {
      console.error('Error assigning users:', error);
      setError('Failed to assign users. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle remove user from role
  const handleRemoveUser = async (userId: number) => {
    const user = assignedUsers.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Remove ${user.name} from ${role?.name}?`)) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/rbac/roles/${roleId}/remove-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      });

      if (response.ok) {
        setSuccess(`Successfully removed ${user.name} from ${role?.name}`);
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      setError('Failed to remove user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filter available users based on search
  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!role) {
    return (
      <ProtectedRoute>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Role Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested role could not be found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Assign Users to Role
            </h1>
            <p className="text-muted-foreground">
              Manage user assignments for <strong>{role.name}</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleAssignUsers} 
              disabled={selectedUsers.length === 0 || saving}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Selected ({selectedUsers.length})
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

        {/* Role Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role: {role.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Slug</div>
                <div className="font-mono text-sm">{role.slug}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={role.isActive ? 'default' : 'secondary'}>
                  {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Permissions</div>
                <div className="text-sm">{role.permissions?.length || 0} permissions</div>
              </div>
            </div>
            {role.description && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">Description</div>
                <div className="text-sm">{role.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Assigned Users</p>
                  <div className="text-2xl font-bold text-green-600">{assignedUsers.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Available Users</p>
                  <div className="text-2xl font-bold text-blue-600">{availableUsers.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Selected</p>
                  <div className="text-2xl font-bold text-purple-600">{selectedUsers.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currently Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Assigned Users ({assignedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {assignedUsers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users assigned to this role yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`/placeholder-${user.id}.jpg`} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{user.code}</Badge>
                              <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {user.isVerified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          disabled={saving}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Available Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Available Users ({availableUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-[350px]">
                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No available users found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAvailableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserToggle(user.id)}
                          />
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`/placeholder-${user.id}.jpg`} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{user.code}</Badge>
                              <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {user.isVerified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AssignUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <AssignUsersPageContent />
    </Suspense>
  );
}
