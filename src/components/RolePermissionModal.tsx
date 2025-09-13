'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Search, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: Permission[];
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface RolePermissionModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedRoleIds: string[]) => Promise<void>;
}

export function RolePermissionModal({ 
  user, 
  open, 
  onOpenChange, 
  onSave 
}: RolePermissionModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPermissions, setShowPermissions] = useState<Set<string>>(new Set());

  // Load data when modal opens
  useEffect(() => {
    if (open && user) {
      fetchData();
    }
  }, [open, user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Fetch all roles
      const rolesResponse = await fetch('/api/rbac/roles');
      if (!rolesResponse.ok) throw new Error('Failed to fetch roles');
      const rolesData = await rolesResponse.json();
      
      if (!rolesData.success) throw new Error(rolesData.error);
      setAllRoles(rolesData.data || []);

      // Fetch user roles
      const userRolesResponse = await fetch(`/api/users/${user.id}/roles`);
      if (!userRolesResponse.ok) throw new Error('Failed to fetch user roles');
      const userRolesData = await userRolesResponse.json();
      
      if (!userRolesData.success) throw new Error(userRolesData.error);
      const currentRoleIds = (userRolesData.data || []).map((role: any) => role.roleId?.toString() || role.id?.toString());
      setUserRoles(currentRoleIds);
      setSelectedRoles([...currentRoleIds]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on search
  const filteredRoles = allRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle role selection
  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Handle permission view toggle
  const togglePermissions = (roleId: string) => {
    setShowPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await onSave(selectedRoles);
      
      setSuccess('User roles updated successfully!');
      
      // Update local state
      setUserRoles([...selectedRoles]);
      
      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);

    } catch (error) {
      console.error('Error saving roles:', error);
      setError(error instanceof Error ? error.message : 'Failed to save roles');
    } finally {
      setSaving(false);
    }
  };

  // Handle close
  const handleClose = () => {
    // Reset to original state
    setSelectedRoles([...userRoles]);
    setSearchTerm('');
    setShowPermissions(new Set());
    setError(null);
    setSuccess(null);
    onOpenChange(false);
  };

  // Check if there are changes
  const hasChanges = selectedRoles.length !== userRoles.length ||
    selectedRoles.some(roleId => !userRoles.includes(roleId));

  // Calculate stats
  const totalPermissions = new Set();
  selectedRoles.forEach(roleId => {
    const role = allRoles.find(r => r.id === roleId);
    if (role) {
      role.permissions.forEach(p => totalPermissions.add(p.id));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span>Manage Roles</span>
              <div className="text-sm font-normal text-muted-foreground">
                {user?.name} ({user?.email})
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Assign or remove roles for this user. Each role grants specific permissions.
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedRoles.length}</div>
            <div className="text-sm text-blue-600">Assigned Roles</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPermissions.size}</div>
            <div className="text-sm text-green-600">Total Permissions</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{allRoles.length}</div>
            <div className="text-sm text-purple-600">Available Roles</div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading roles...</span>
          </div>
        ) : (
          /* Roles List */
          <ScrollArea className="h-96 mb-4">
            <div className="space-y-3">
              {filteredRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                const wasOriginallyAssigned = userRoles.includes(role.id);
                
                return (
                  <div
                    key={role.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                          disabled={role.isSystem}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{role.name}</h4>
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: `${role.color}20`,
                                borderColor: role.color,
                                color: role.color
                              }}
                            >
                              {role.permissions.length} permissions
                            </Badge>
                            {role.isSystem && (
                              <Badge variant="secondary">System</Badge>
                            )}
                            {wasOriginallyAssigned && (
                              <Badge variant="default">Currently Assigned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePermissions(role.id)}
                      >
                        {showPermissions.has(role.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Permissions Details */}
                    {showPermissions.has(role.id) && (
                      <div className="mt-3 pt-3 border-t">
                        <h5 className="font-medium mb-2 text-sm">Permissions</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {role.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {permission.resource}:{permission.action}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredRoles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No roles found matching your search</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || !hasChanges || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
