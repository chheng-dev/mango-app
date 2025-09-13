'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Grid3x3,
  ArrowRight,
  RefreshCw,
  Lock,
  Unlock,
  UserCheck,
  Activity
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    verified: number;
    withRoles: number;
  };
  roles: {
    total: number;
    active: number;
    inactive: number;
    avgPermissions: number;
  };
  permissions: {
    total: number;
    inUse: number;
    resources: number;
    actions: number;
  };
  recent: {
    recentRoleAssignments: Array<{
      id: number;
      userName: string;
      roleName: string;
      assignedAt: string;
    }>;
    recentPermissionChanges: Array<{
      id: number;
      roleName: string;
      permissionName: string;
      action: 'added' | 'removed';
      changedAt: string;
    }>;
  };
}

export default function RBACDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you'd have a dedicated dashboard API endpoint
      // For now, we'll simulate the data or make multiple API calls
      const mockStats: DashboardStats = {
        users: {
          total: 156,
          active: 142,
          verified: 138,
          withRoles: 124
        },
        roles: {
          total: 8,
          active: 7,
          inactive: 1,
          avgPermissions: 12
        },
        permissions: {
          total: 48,
          inUse: 35,
          resources: 6,
          actions: 8
        },
        recent: {
          recentRoleAssignments: [
            {
              id: 1,
              userName: 'John Doe',
              roleName: 'Editor',
              assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              userName: 'Jane Smith',
              roleName: 'Moderator',
              assignedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 3,
              userName: 'Bob Wilson',
              roleName: 'Viewer',
              assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          recentPermissionChanges: [
            {
              id: 1,
              roleName: 'Editor',
              permissionName: 'posts.create',
              action: 'added',
              changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              roleName: 'Moderator',
              permissionName: 'users.delete',
              action: 'removed',
              changedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">RBAC Dashboard</h1>
              <p className="text-muted-foreground">
                Role-Based Access Control overview and management
              </p>
            </div>
            <Button onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    );
  }

  if (!stats) return null;

  const userRolePercentage = stats.users.total > 0 ? (stats.users.withRoles / stats.users.total) * 100 : 0;
  const permissionUsagePercentage = stats.permissions.total > 0 ? (stats.permissions.inUse / stats.permissions.total) * 100 : 0;
  const activeRolePercentage = stats.roles.total > 0 ? (stats.roles.active / stats.roles.total) * 100 : 0;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RBAC Dashboard</h1>
            <p className="text-muted-foreground">
              Role-Based Access Control overview and management
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push('/admin/roles/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Quick Setup
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <Users className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span>With Roles</span>
                  <span>{userRolePercentage.toFixed(0)}%</span>
                </div>
                <Progress value={userRolePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-blue-600">{stats.roles.total}</div>
                <Shield className="h-4 w-4 ml-auto text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground">System Roles</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span>Active</span>
                  <span>{activeRolePercentage.toFixed(0)}%</span>
                </div>
                <Progress value={activeRolePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-purple-600">{stats.permissions.total}</div>
                <ShieldCheck className="h-4 w-4 ml-auto text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">Permissions</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span>In Use</span>
                  <span>{permissionUsagePercentage.toFixed(0)}%</span>
                </div>
                <Progress value={permissionUsagePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">{stats.permissions.resources}</div>
                <Grid3x3 className="h-4 w-4 ml-auto text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground">Resources</p>
              <div className="mt-4">
                <Badge variant="outline" className="text-xs">
                  {stats.permissions.actions} Actions
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/users')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">
                    View and assign roles to users
                  </p>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/roles/new')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Manage Roles</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and configure system roles
                  </p>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/permissions')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Manage Permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure system permissions
                  </p>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Overview of your RBAC system status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">User Coverage</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.users.withRoles} of {stats.users.total} users have roles
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Good
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Lock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Permission Usage</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.permissions.inUse} of {stats.permissions.total} permissions in use
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {permissionUsagePercentage.toFixed(0)}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <UserCheck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">User Verification</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.users.verified} of {stats.users.total} users verified
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                  {((stats.users.verified / stats.users.total) * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest role assignments and permission changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Role Assignments</h4>
                  <div className="space-y-2">
                    {stats.recent.recentRoleAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <Users className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{assignment.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              assigned to <span className="font-medium">{assignment.roleName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(assignment.assignedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Permission Changes</h4>
                  <div className="space-y-2">
                    {stats.recent.recentPermissionChanges.map((change) => (
                      <div key={change.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded ${change.action === 'added' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {change.action === 'added' ? (
                              <Lock className="h-3 w-3 text-green-600" />
                            ) : (
                              <Unlock className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{change.roleName}</div>
                            <div className="text-xs text-muted-foreground">
                              {change.action} <span className="font-medium">{change.permissionName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(change.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="font-medium">{stats.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="font-medium">{stats.users.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Verified Users</span>
                <span className="font-medium">{stats.users.verified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Users with Roles</span>
                <span className="font-medium">{stats.users.withRoles}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Roles</span>
                <span className="font-medium">{stats.roles.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Roles</span>
                <span className="font-medium">{stats.roles.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Inactive Roles</span>
                <span className="font-medium">{stats.roles.inactive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Permissions</span>
                <span className="font-medium">{stats.roles.avgPermissions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permission Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Permissions</span>
                <span className="font-medium">{stats.permissions.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">In Use</span>
                <span className="font-medium">{stats.permissions.inUse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resources</span>
                <span className="font-medium">{stats.permissions.resources}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Actions</span>
                <span className="font-medium">{stats.permissions.actions}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
