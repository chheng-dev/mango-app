'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RBACDashboardWidget } from '@/components/ui/rbac-dashboard-widget';
import { 
  Users, 
  Database, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  UserPlus, 
  Settings,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '2,350',
    description: '+20.1% from last month',
    icon: Users,
    trend: '+20.1%',
  },
  {
    title: 'Database Queries',
    value: '14.2k',
    description: '+10.1% from last month',
    icon: Database,
    trend: '+10.1%',
  },
  {
    title: 'Active Sessions',
    value: '573',
    description: '+2.5% from last month',
    icon: Activity,
    trend: '+2.5%',
  },
  {
    title: 'Growth Rate',
    value: '94.7%',
    description: '+4.3% from last month',
    icon: TrendingUp,
    trend: '+4.3%',
  },
];

const quickActions = [
  {
    title: 'Create User',
    description: 'Add new user to the system',
    icon: UserPlus,
    href: '/admin/users/create',
  },
  {
    title: 'View Analytics',
    description: 'Monitor system performance',
    icon: BarChart3,
    href: '/admin/analytics',
  },
  {
    title: 'System Settings',
    description: 'Configure system preferences',
    icon: Settings,
    href: '/admin/settings',
  },
  {
    title: 'Security Center',
    description: 'Manage roles and permissions',
    icon: Shield,
    href: '/admin/security',
  },
];

const recentActivities = [
  {
    action: 'New user registration',
    user: 'john.doe@example.com',
    time: '5 minutes ago',
    icon: UserPlus,
    status: 'success',
  },
  {
    action: 'Database backup completed',
    user: 'System',
    time: '2 hours ago',
    icon: CheckCircle,
    status: 'success',
  },
  {
    action: 'Security scan completed',
    user: 'Security Bot',
    time: '4 hours ago',
    icon: Shield,
    status: 'info',
  },
  {
    action: 'System update applied',
    user: 'Admin',
    time: '1 day ago',
    icon: Settings,
    status: 'info',
  },
  {
    action: 'Failed login attempt',
    user: 'unknown@suspicious.com',
    time: '2 days ago',
    icon: AlertCircle,
    status: 'warning',
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <BarChart3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Overview of your application performance
            </p>
          </div>
        </div>
        
        <Badge variant="outline" className="text-slate-700 dark:text-slate-300">
          <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
          System Online
        </Badge>
      </div>

      {/* Stats Grid - Clean Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <stat.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Recent Activity
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              Latest system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">
                    <activity.icon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {activity.user}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Quick Actions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">
                      <action.icon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RBAC Widget */}
      <Card>
        <CardContent className="p-0">
          <RBACDashboardWidget />
        </CardContent>
      </Card>
    </div>
  );
}