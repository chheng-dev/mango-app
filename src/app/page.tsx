'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface User {
  id: number;
  email: string;
  code: string;
  name: string;
  dob?: string;
  phoneNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setMessage('Users loaded successfully!');
      } else {
        setMessage('Failed to load users');
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createSampleUser = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const sampleUser = {
        email: `user${timestamp}@example.com`,
        code: `USR${timestamp}`,
        name: 'John Doe',
        phoneNumber: '+1234567890',
        passwordHash: 'hashed_password_placeholder',
        passwordConfirmation: 'hashed_password_placeholder',
        isActive: true,
        isVerified: false
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleUser),
      });

      if (response.ok) {
        setMessage('User created successfully!');
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        setMessage('Failed to create user: ' + error.error);
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          Welcome to{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Next.js!
          </a>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Complete setup with Drizzle ORM, SQL migrations, and Shadcn UI
        </p>
      </div>

      {/* Database Operations Demo */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Database Operations Demo</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <Button onClick={fetchUsers} disabled={loading}>
              {loading ? 'Loading...' : 'Load Users'}
            </Button>
            <Button onClick={createSampleUser} variant="secondary" disabled={loading}>
              Create Sample User
            </Button>
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Users Display */}
        {users.length > 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Users ({users.length})</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 bg-background">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-sm text-muted-foreground">Code: {user.code}</div>
                  {user.phoneNumber && (
                    <div className="text-sm text-muted-foreground">Phone: {user.phoneNumber}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <div className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <div className={`text-xs ${user.isVerified ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shadcn UI Button Examples */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Shadcn UI Button Examples</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default Size</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🚀</Button>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button disabled>Disabled</Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Custom Gradient
              </Button>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🚀 Setup Instructions</h3>
          <div className="space-y-2 text-sm">
            <p><strong>1. Install dependencies:</strong> <code className="bg-muted px-2 py-1 rounded">npm install</code></p>
            <p><strong>2. Set up your database URL in .env.local</strong></p>
            <p><strong>3. Generate migrations:</strong> <code className="bg-muted px-2 py-1 rounded">npm run db:generate</code></p>
            <p><strong>4. Run migrations:</strong> <code className="bg-muted px-2 py-1 rounded">npm run db:migrate</code></p>
            <p><strong>5. View database:</strong> <code className="bg-muted px-2 py-1 rounded">npm run db:studio</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
