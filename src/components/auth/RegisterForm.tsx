
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
import { useAuth } from '@/contexts/AuthContext'; // Assuming registration also logs the user in
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

// For mock registration, we'll collect User ID and Username.
// In a real scenario, User ID might be auto-generated or email-based.
const formSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required.' }).max(50, { message: 'User ID must be 50 characters or less.'}),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(50, { message: 'Username must be 50 characters or less.'}),
  // password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  // confirmPassword: z.string(),
})
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ['confirmPassword'],
// });

export default function RegisterForm() {
  const { login } = useAuth(); // Using login for mock registration simplicity
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      username: '',
      // password: '',
      // confirmPassword: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock registration: simply log the user in with the provided details.
    // In a real app, this would involve an API call to a registration endpoint.
    login(values.userId, values.username);
    toast({
      title: "Registration Successful",
      description: `Welcome, ${values.username}! Your account has been created.`,
    });
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
          <UserPlus size={32} />
        </div>
        <CardTitle className="text-3xl font-headline">Create Account</CardTitle>
        <CardDescription>Join oxCloud to simulate and analyze DNA.</CardDescription>
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
                    <Input placeholder="Choose a User ID" {...field} />
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
                    <Input placeholder="Choose a username" {...field} />
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
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Button type="submit" className="w-full" size="lg">
              <UserPlus className="mr-2 h-5 w-5" /> Register
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
