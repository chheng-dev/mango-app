'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable} from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Eye, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

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
  const columns: ColumnDef<Product>[] = [
   
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
        />
      </div>
    </ProtectedRoute>
  );
}
