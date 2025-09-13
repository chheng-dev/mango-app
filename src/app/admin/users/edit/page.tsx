'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Save, Eye, EyeOff, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/lib/api/UserService';

interface UserFormData {
  name: string;
  email: string;
  code: string;
  password: string;exit
  passwordConfirmation: string;
  phoneNumber: string;
  dob: string;
  isActive: boolean;
  isVerified: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  const { users, updateUser, deleteUser } = useUsers();
  
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    code: '',
    password: '',
    passwordConfirmation: '',
    phoneNumber: '',
    dob: '',
    isActive: true,
    isVerified: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find and load user data
  useEffect(() => {
    if (userId && users.length > 0) {
      const foundUser = users.find(u => u.id === parseInt(userId));
      if (foundUser) {
        setUser(foundUser);
        setFormData({
          name: foundUser.name || '',
          email: foundUser.email || '',
          code: foundUser.code || '',
          password: '',
          passwordConfirmation: '',
          phoneNumber: foundUser.phoneNumber || '',
          dob: foundUser.dob || '',
          isActive: foundUser.isActive ?? true,
          isVerified: foundUser.isVerified ?? false,
        });
      } else {
        // User not found, redirect back
        router.push('/admin/users');
      }
    }
  }, [userId, users, router]);

  const handleInputChange = useCallback((field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'User code is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'User code must contain only uppercase letters and numbers';
    }

    // Password validation only if password is provided
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
      if (formData.password !== formData.passwordConfirmation) {
        newErrors.passwordConfirmation = 'Passwords do not match';
      }
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        code: formData.code,
        phoneNumber: formData.phoneNumber || undefined,
        dob: formData.dob || undefined,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateUser(user.id, updateData);
      
      if (result.success) {
        router.push('/admin/users');
      } else {
        setErrors({ email: result.error || 'Failed to update user' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ email: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    try {
      const result = await deleteUser(user.id);
      if (result.success) {
        router.push('/admin/users');
      } else {
        alert(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An unexpected error occurred while deleting the user');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading user...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Edit User
            </h1>
            <p className="text-muted-foreground">
              Update user information and settings
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            disabled={loading || deleteLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Delete User Account</h3>
                  <p className="text-red-800 mb-4">
                    Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
                    All user data and associated records will be permanently removed.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      size="sm"
                    >
                      {deleteLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Deleting...
                        </div>
                      ) : (
                        'Yes, Delete User'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteLoading}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid gap-6">
            {/* User Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>
                  Current user account information and status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/placeholder-${user.id}.jpg`} />
                    <AvatarFallback className="text-lg">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{user.code}</Badge>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={user.isVerified ? 'default' : 'secondary'} 
                             className={user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Created: {new Date(user.createdAt).toLocaleDateString()} • 
                      Last updated: {new Date(user.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the user's personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="user@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">User Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="USER001"
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security & Authentication</CardTitle>
                <CardDescription>
                  Update the user's password. Leave blank to keep current password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter new password (optional)"
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep current password
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirmation">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="passwordConfirmation"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        value={formData.passwordConfirmation}
                        onChange={(e) => handleInputChange('passwordConfirmation', e.target.value)}
                        placeholder="Confirm new password"
                        className={errors.passwordConfirmation ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.passwordConfirmation && <p className="text-sm text-red-500">{errors.passwordConfirmation}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Configure the user's account status and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="text-base">Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable user account access
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
                    />
                    <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isVerified" className="text-base">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Mark user as email verified
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isVerified"
                      checked={formData.isVerified}
                      onCheckedChange={(checked: boolean) => handleInputChange('isVerified', checked)}
                    />
                    <Badge variant={formData.isVerified ? 'default' : 'secondary'} 
                           className={formData.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {formData.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Update User
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
