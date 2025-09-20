'use client';

import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EnhancedGlobalLoading } from "@/components/ui/loading";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <EnhancedGlobalLoading message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return <EnhancedGlobalLoading message="Redirecting to dashboard..." />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
