'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, UserX, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  code: string;
  status: 'active' | 'inactive';
  isVerified: boolean;
  lastLogin: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  stock: number;
  sku: string;
  rating: number;
  status: 'Active' | 'Out Of Stock' | 'Closed For Sale';
  image: string;
}

interface ActionModalProps {
  type: 'user' | 'product';
  action: 'view' | 'edit' | 'delete' | 'email';
  item: User | Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function ActionModal({ type, action, item, isOpen, onClose, onConfirm }: ActionModalProps) {
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLoading(false);
    onConfirm?.();
    onClose();
  };

  const renderUserView = (user: User) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`/placeholder-${user.id}.jpg`} />
          <AvatarFallback className="text-lg">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{user.code}</Badge>
            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
              {user.status}
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
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Last Login</p>
            <p className="text-sm text-muted-foreground">{user.lastLogin}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserEdit = (user: User) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input defaultValue={user.name} />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input defaultValue={user.email} type="email" />
      </div>
      <div>
        <label className="text-sm font-medium">Status</label>
        <select className="w-full p-2 border rounded-md" defaultValue={user.status}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  const renderProductView = (product: Product) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 rounded-lg">
          <AvatarImage src={product.image} alt={product.name} />
          <AvatarFallback className="rounded-lg text-lg">
            {product.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{product.sku}</Badge>
            <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>
              {product.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Price</p>
          <p className="text-lg font-bold text-green-600">{product.price}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Stock</p>
          <p className="text-lg font-semibold">{product.stock} units</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Category</p>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Rating</p>
          <p className="text-sm text-muted-foreground">⭐ {product.rating}</p>
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    if (action === 'view') return `View ${type === 'user' ? 'User' : 'Product'}`;
    if (action === 'edit') return `Edit ${type === 'user' ? 'User' : 'Product'}`;
    if (action === 'delete') return `Delete ${type === 'user' ? 'User' : 'Product'}`;
    if (action === 'email') return 'Send Email';
    return '';
  };

  const getDescription = () => {
    if (action === 'delete') {
      return `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    }
    if (action === 'email') {
      return `Send an email to ${(item as User).name}`;
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          {getDescription() && (
            <DialogDescription>{getDescription()}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {action === 'view' && type === 'user' && renderUserView(item as User)}
          {action === 'view' && type === 'product' && renderProductView(item as Product)}
          {action === 'edit' && type === 'user' && renderUserEdit(item as User)}
          {action === 'delete' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                This will permanently delete{' '}
                <span className="font-semibold">
                  {type === 'user' ? (item as User).name : (item as Product).name}
                </span>
              </p>
            </div>
          )}
          {action === 'email' && (
            <div className="space-y-4">
              <Input placeholder="Subject" />
              <textarea 
                className="w-full p-3 border rounded-md resize-none" 
                rows={6}
                placeholder="Write your message..."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {(action === 'edit' || action === 'delete' || action === 'email') && (
            <Button 
              onClick={handleConfirm} 
              disabled={loading}
              variant={action === 'delete' ? 'destructive' : 'default'}
            >
              {loading ? 'Processing...' : action === 'delete' ? 'Delete' : action === 'email' ? 'Send Email' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
