'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './textarea';
import { Switch } from './switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, UserCheck, UserX, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { User } from '@/lib/db/schemas/users';

interface UserFormData {
  name: string;
  email: string;
  code: string;
  password: string;
  passwordConfirmation: string;
  phoneNumber: string;
  dob: string;
  isActive: boolean;
  isVerified: boolean;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'delete';
  onClose: () => void;
  onSave: (userData: Partial<UserFormData>) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}

export function UserModal({ 
  user, 
  isOpen, 
  mode, 
  onClose, 
  onSave, 
  onDelete,
  loading = false 
}: UserModalProps) {
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
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Initialize form data when user changes or modal opens
  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        code: user.code || '',
        password: '',
        passwordConfirmation: '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob ? (user.dob instanceof Date ? user.dob.toISOString().split('T')[0] : user.dob) : '',
        isActive: user.isActive ?? true,
        isVerified: user.isVerified ?? false,
      });
    } else if (mode === 'create') {
      setFormData({
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
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'User code is required';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.passwordConfirmation) {
        newErrors.passwordConfirmation = 'Passwords do not match';
      }
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        await onSave(formData);
      } else if (mode === 'edit') {
        const updateData = { ...formData };
        // Don't send password if it's empty in edit mode
        if (!updateData.password) {
          const { password, passwordConfirmation, ...rest } = updateData;
          await onSave(rest);
        } else {
          await onSave(updateData);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const isReadOnly = mode === 'view';
  const isDelete = mode === 'delete';

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Add New User';
      case 'edit': return 'Edit User';
      case 'view': return 'User Details';
      case 'delete': return 'Delete User';
      default: return 'User';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'create': return 'Fill in the details to create a new user account.';
      case 'edit': return 'Update the user information below.';
      case 'view': return 'View user details and account information.';
      case 'delete': return 'Are you sure you want to delete this user? This action cannot be undone.';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {isDelete ? (
          <div className="py-6">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/placeholder-${user?.id}.jpg`} />
                <AvatarFallback>
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{user?.code}</Badge>
                  <Badge variant={user?.isActive ? 'default' : 'secondary'}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* User Avatar and Basic Info */}
            {mode === 'view' && user && (
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/placeholder-${user.id}.jpg`} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{user.code}</Badge>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {user.isVerified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
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
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                  className={errors.code ? 'border-red-500' : ''}
                  placeholder="USER001"
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={isReadOnly}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              {(mode === 'create' || mode === 'edit') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                        placeholder={mode === 'edit' ? 'Enter new password' : 'Enter password'}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                    <Input
                      id="passwordConfirmation"
                      type="password"
                      value={formData.passwordConfirmation}
                      onChange={(e) => handleInputChange('passwordConfirmation', e.target.value)}
                      className={errors.passwordConfirmation ? 'border-red-500' : ''}
                      placeholder="Confirm password"
                    />
                    {errors.passwordConfirmation && <p className="text-sm text-red-500">{errors.passwordConfirmation}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Status Toggles */}
            {(mode === 'edit' || mode === 'view') && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable user account access
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isVerified">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Mark user as email verified
                    </p>
                  </div>
                  <Switch
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked: boolean) => handleInputChange('isVerified', checked)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            )}

            {/* User Metadata (View mode only) */}
            {mode === 'view' && user && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created Date</Label>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {isDelete ? (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          ) : mode !== 'view' ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
