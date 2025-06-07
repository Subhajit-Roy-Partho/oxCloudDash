
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/job-status'); // Default dashboard page
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Display a loading state while checking auth
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return null; // Or a more sophisticated loader
}
