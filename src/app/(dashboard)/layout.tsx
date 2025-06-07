
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Header } from '@/components/dashboard/Header';
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'; // Assuming sidebar components exist

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    // Full page loader while checking auth or if not authenticated
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 w-full max-w-xs">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 md:w-64 border-r bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="p-4">
              <Link href="/job-status" className="flex items-center gap-2 font-semibold text-lg text-sidebar-primary-foreground hover:text-sidebar-primary-foreground/90 font-headline">
                {/* You can use an SVG icon or an emoji for oxDNA logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-sidebar-primary">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                <span>oxCloud</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex-1">
              <SidebarNav />
            </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 md:ml-64">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Minimal Link component if not imported (should be from next/link)
const Link = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
  <a href={href} className={className}>{children}</a>
);

