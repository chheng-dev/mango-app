"use client";

import { useState } from "react";
import { UserForm, UserFormData } from "@/components/forms/UserForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UserFormDemo() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Creating user with data:", data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Updating user with data:", data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const existingUserData: Partial<UserFormData> = {
    name: "John Doe",
    email: "john.doe@example.com",
    code: "USR001",
    phoneNumber: "+1 (555) 123-4567",
    dob: "1990-01-15",
    isActive: true,
    isVerified: true,
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">User Form with Zod Validation</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating react-hook-form with Zod schema validation
        </p>
      </div>

      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="create"
            onSubmit={handleCreateUser}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Edit User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Existing User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="edit"
            initialData={existingUserData}
            onSubmit={handleUpdateUser}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Validation Features */}
      <Card>
        <CardHeader>
          <CardTitle>Zod Validation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <h3>Form Validation Rules:</h3>
            <ul>
              <li><strong>Name:</strong> Required, minimum 2 characters</li>
              <li><strong>Email:</strong> Required, valid email format</li>
              <li><strong>Code:</strong> Required, minimum 3 characters, automatically uppercase</li>
              <li><strong>Password:</strong> Required for create mode, minimum 6 characters</li>
              <li><strong>Password Confirmation:</strong> Must match password when provided</li>
              <li><strong>Phone Number:</strong> Optional</li>
              <li><strong>Date of Birth:</strong> Optional</li>
              <li><strong>Status Fields:</strong> Boolean switches with default values</li>
            </ul>
            
            <h3>Enhanced Features:</h3>
            <ul>
              <li>Real-time validation with Zod schema</li>
              <li>React Hook Form integration for better performance</li>
              <li>Proper TypeScript types from Zod schema</li>
              <li>Custom password confirmation validation</li>
              <li>Different validation rules for create vs edit mode</li>
              <li>DatePicker integration with form state</li>
              <li>Switch components with form state binding</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
