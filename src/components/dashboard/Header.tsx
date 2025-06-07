
"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogOut, Sun, Moon } from 'lucide-react'; // Added Sun/Moon for theme toggle
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNav } from './SidebarNav'; // For mobile drawer
import { useTheme } from 'next-themes'; // Assuming next-themes is or can be installed for theme toggling
import { useEffect, useState } from 'react';

// Placeholder for useTheme if not available
const useThemeFallback = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const setTheme = (theme: string) => {
    // Basic theme toggle, ideally use next-themes
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
      setCurrentTheme(theme);
    }
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.classList.add(storedTheme);
      setCurrentTheme(storedTheme);
    }
  }, []);
  return { theme: currentTheme, setTheme };
};


export function Header() {
  const { user, logout } = useAuth();
  // const { theme, setTheme } = useTheme(); // Use this if next-themes is installed
   const { theme, setTheme } = useThemeFallback(); // Fallback if next-themes not present

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 pt-6 w-64 bg-sidebar">
            <SidebarNav />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        <h1 className="text-xl font-semibold hidden md:block mr-auto font-headline">oxCloud Dashboard</h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    User ID: {user.id}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Add other items like 'Settings', 'Profile' if needed */}
              {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

// It is recommended to add 'next-themes' to package.json for proper theme handling.
// If 'next-themes' is not available, the fallback provides basic functionality.
// Add this to layout.tsx for next-themes:
// import { ThemeProvider } from "next-themes"
// <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//   <AuthProvider>...</AuthProvider>
// </ThemeProvider>

