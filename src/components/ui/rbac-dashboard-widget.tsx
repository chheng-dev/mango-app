'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  Activity,
  ExternalLink
} from 'lucide-react';

interface RBACStats {
  totalRoles: number;
  activeRoles: number;
  totalPermissions: number;
  totalUsers: number;
  usersWithRoles: number;
  mostUsedRole: {
    name: string;
    userCount: number;
  } | null;
  recentActivity: {
    type: 'role_assigned' | 'role_removed' | 'role_created';
    description: string;
    timestamp: string;
  }[];
}

interface RBACDashboardWidgetProps {
  className?: string;
}

export function RBACDashboardWidget({ className }: RBACDashboardWidgetProps) {
  const [stats, setStats] = useState<RBACStats>({
    totalRoles: 0,
    activeRoles: 0,
    totalPermissions: 0,
    totalUsers: 0,
    usersWithRoles: 0,
    mostUsedRole: null,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would fetch this from your API
      // For now, we'll simulate the data
      const [rolesResponse, permissionsResponse, usersResponse] = await Promise.all([
        fetch('/api/rbac/roles'),
        fetch('/api/rbac/permissions'),
        fetch('/api/users')
      ]);

      const roles = rolesResponse.ok ? (await rolesResponse.json()).data || [] : [];
      const permissions = permissionsResponse.ok ? (await permissionsResponse.json()).data || [] : [];
      const users = usersResponse.ok ? (await usersResponse.json()).data || [] : [];

      // Calculate stats
      const activeRoles = roles.filter((role: any) => role.isActive);
      const usersWithRoles = users.filter((user: any) => user.roles && user.roles.length > 0);
      
      // Mock most used role (in real app, this would come from analytics)
      const mostUsedRole = roles.length > 0 ? {
        name: roles[0]?.name || 'Admin',
        userCount: Math.floor(users.length * 0.3)
      } : null;

      // Mock recent activity
      const recentActivity = [
        {
          type: 'role_assigned' as const,
          description: 'Admin role assigned to John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'role_created' as const,
          description: 'New "Manager" role created',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'role_removed' as const,
          description: 'User role removed from Jane Smith',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ];

      setStats({
        totalRoles: roles.length,
        activeRoles: activeRoles.length,
        totalPermissions: permissions.length,
        totalUsers: users.length,
        usersWithRoles: usersWithRoles.length,
        mostUsedRole,
        recentActivity
      });
    } catch (error) {
      setError('Failed to load RBAC statistics');
      console.error('Error loading RBAC stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const accessCoveragePercentage = stats.totalUsers > 0 
    ? Math.round((stats.usersWithRoles / stats.totalUsers) * 100)
    : 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'role_assigned':
        return <Users className="h-3 w-3 text-green-600" />;
      case 'role_removed':
        return <Users className="h-3 w-3 text-red-600" />;
      case 'role_created':
        return <Shield className="h-3 w-3 text-blue-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
            <Button variant="outline" onClick={loadStats} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Management
            </CardTitle>
            <CardDescription>
              Roles, permissions, and user access overview
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/roles'}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Roles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.totalRoles}</span>
              <Badge variant="outline" className="text-xs">
                {stats.activeRoles} active
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Permissions</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalPermissions}</div>
          </div>
        </div>

        {/* Access Coverage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Access Coverage</span>
            <span className="text-sm text-muted-foreground">
              {stats.usersWithRoles} of {stats.totalUsers} users
            </span>
          </div>
          <Progress value={accessCoveragePercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{accessCoveragePercentage}% of users have roles assigned</span>
            <TrendingUp className="h-3 w-3" />
          </div>
        </div>

        {/* Most Used Role */}
        {stats.mostUsedRole && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Most Used Role</span>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="font-medium">{stats.mostUsedRole.name}</span>
              <Badge variant="secondary">
                {stats.mostUsedRole.userCount} users
              </Badge>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Recent Activity</span>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-xs">
                {getActivityIcon(activity.type)}
                <span className="flex-1">{activity.description}</span>
                <span className="text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.location.href = '/admin/users/roles'}
          >
            <Users className="h-4 w-4 mr-1" />
            User Access
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.location.href = '/admin/roles'}
          >
            <Shield className="h-4 w-4 mr-1" />
            Roles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
