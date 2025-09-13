'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable, Column, DataTableAction } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Eye, Edit, Trash2, Plus } from 'lucide-react';

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

const products: Product[] = [
  {
    id: 1,
    name: 'HP Pavilion 16.1 Inch Gaming Laptop',
    price: '$960.99',
    category: 'Electronics',
    stock: 5,
    sku: 'RCH45Q1A',
    rating: 4.9,
    status: 'Active',
    image: '/products/laptop.jpg'
  },
  {
    id: 2,
    name: 'Samsung SM-A21S Galaxy A21S',
    price: '$350',
    category: 'Electronics',
    stock: 25,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Active',
    image: '/products/phone.jpg'
  },
  {
    id: 3,
    name: 'Schwaiger KH510S 513 Buegelkopfhoerer',
    price: '$300',
    category: 'Electronics',
    stock: 27,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Out Of Stock',
    image: '/products/headphones.jpg'
  },
  {
    id: 4,
    name: 'Ultimate Ears Wonderboom Bluetooth Speaker',
    price: '$119.99',
    category: 'Electronics',
    stock: 10,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Active',
    image: '/products/speaker.jpg'
  },
  {
    id: 5,
    name: 'Canon Pixma TS3350 Multifunction Printer',
    price: '$439.50',
    category: 'Electronics',
    stock: 25,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Closed For Sale',
    image: '/products/printer.jpg'
  },
  {
    id: 6,
    name: 'Canon 4000D 18-55 MM III (Canon Eurasia Guaranteed)',
    price: '$49.50',
    category: 'Beauty',
    stock: 25,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Closed For Sale',
    image: '/products/camera.jpg'
  },
  {
    id: 7,
    name: 'Lobwerk Lenovo Tab M10 TB-X605F',
    price: '$49.50',
    category: 'Beauty',
    stock: 25,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Closed For Sale',
    image: '/products/tablet.jpg'
  },
  {
    id: 8,
    name: '2019 55`` Q60R QLED 4K Quantum HDR Smart TV',
    price: '$49.50',
    category: 'Beauty',
    stock: 25,
    sku: 'MVCFH27F',
    rating: 4.65,
    status: 'Closed For Sale',
    image: '/products/tv.jpg'
  }
];

export default function ProductsPage() {
  const columns: Column<Product>[] = [
    {
      key: 'name',
      title: 'Product Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={item.image} alt={item.name} />
            <AvatarFallback className="rounded-lg">
              {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{item.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value) => (
        <div className="text-muted-foreground">{value}</div>
      )
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      render: (value) => (
        <div className="text-center">{value}</div>
      )
    },
    {
      key: 'sku',
      title: 'SKU',
      render: (value) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => {
        const variant = value === 'Active' 
          ? 'default' 
          : value === 'Out Of Stock' 
          ? 'secondary' 
          : 'destructive';
        
        const className = value === 'Active'
          ? 'bg-green-100 text-green-800 hover:bg-green-100'
          : value === 'Out Of Stock'
          ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
          : 'bg-red-100 text-red-800 hover:bg-red-100';

        return (
          <Badge variant={variant} className={className}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[50px]'
    }
  ];

  const rowActions: DataTableAction<Product>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (product) => {
        console.log('View product:', product);
      }
    },
    {
      label: 'Edit Product',
      icon: Edit,
      onClick: (product) => {
        console.log('Edit product:', product);
      }
    },
    {
      label: 'Delete Product',
      icon: Trash2,
      variant: 'destructive',
      onClick: (product) => {
        console.log('Delete product:', product);
      }
    }
  ];

  const handleAddProduct = () => {
    console.log('Add new product');
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product inventory and pricing
            </p>
          </div>
        </div>

        <DataTable
          data={products}
          columns={columns}
          title="Product Management"
          description="A list of all products in your inventory"
          searchPlaceholder="Search products..."
          rowActions={rowActions}
          onAdd={handleAddProduct}
          addButtonText="Add Product"
        />
      </div>
    </ProtectedRoute>
  );
}
