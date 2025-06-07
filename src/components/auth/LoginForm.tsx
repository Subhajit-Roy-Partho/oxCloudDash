
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  // password: z.string().min(1, { message: 'Password is required.' }), // Password not used in current mock
});

export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      username: '',
      // password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you'd call an API here.
    // For mock, directly call login from AuthContext.
    // The C++ backend uses userID, username. No password in startJob.
    // We'll use userId as the primary identifier for API calls as per C++ backend.
    login(values.userId, values.username);
    toast({
      title: "Login Successful",
      description: `Welcome back, ${values.username}!`,
    });
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
          <LogIn size={32} />
        </div>
        <CardTitle className="text-3xl font-headline">Welcome Back!</CardTitle>
        <CardDescription>Enter your credentials to access your oxCloud dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your User ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
