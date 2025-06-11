
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
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }).max(100),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(50),
  instituteName: z.string().min(1, { message: 'Name of the Institute is required.' }).max(100),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterForm() {
  const { register } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      instituteName: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const success = await register({
      name: values.name,
      username: values.username,
      instituteName: values.instituteName,
      passwordLogin: values.password,
    });

    if (success) {
      toast({
        title: "Registration Successful",
        description: `Welcome, ${values.name}! Your account has been created.`,
      });
    } else {
      toast({
        title: "Registration Failed",
        description: "This username might already be taken or another error occurred.",
        variant: "destructive",
      });
      form.setError("username", {type: "manual", message: "Username may already be taken."})
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
            <FormField
              control={form.control}
              name="instituteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of the Institute</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your institute's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
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
            />
            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Registering...' : <><UserPlus className="mr-2 h-5 w-5" /> Register</>}
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
