
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar'; // Assuming this hook exists or is part of shadcn/ui

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export function SidebarNav() {
  const pathname = usePathname();
  // const { state: sidebarState } = useSidebar(); // Use if available for collapsed state tooltips
  // For simplicity, assuming sidebarState is 'expanded' or tooltips always show.
  // If useSidebar is not readily available, we will omit the conditional tooltip logic based on collapsed state.
  const sidebarState = 'expanded'; // Mock state

  return (
    <nav className="flex flex-col gap-2 px-2 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Tooltip key={item.href} delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className={cn("truncate", sidebarState === 'collapsed' && 'hidden')}>{item.label}</span>
              </Link>
            </TooltipTrigger>
            {sidebarState === 'collapsed' && (
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                {item.label}
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </nav>
  );
}
