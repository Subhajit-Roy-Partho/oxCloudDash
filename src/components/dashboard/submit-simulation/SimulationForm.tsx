
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { SIMULATION_PARAMETERS_DEFAULTS } from '@/lib/constants';
import type { SimulationJobPayload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  jobId: z.string().optional(),
  server: z.string().min(1, "Server name is required."),
  location: z.string().min(1, "Location/path to files is required."),
  priority: z.coerce.number().int(),
  maxTime: z.coerce.number().int(),
  simulationType: z.enum(['MD', 'MC'], { required_error: "You must select a simulation type."}),
  gpu: z.boolean(),
  steps: z.coerce.number().positive("Steps must be a positive number."),
  confInterval: z.coerce.number().positive("Configuration interval must be positive."),
  dt: z.coerce.number().positive("dt must be positive."),
  interactionType: z.coerce.number().int().min(0), // Assuming 0, 1, 2 are valid
  hBondRestraint: z.boolean(),
  T: z.string().min(1, "Temperature is required."),
  saltConc: z.coerce.number().min(0, "Salt concentration cannot be negative."),
  forceFile: z.string().optional(),
  verletSkin: z.coerce.number().min(0),
  step1: z.coerce.number(),
  step2: z.coerce.number(),
  step3: z.coerce.number(),
  override: z.string().optional(),
});

export default function SimulationForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: SIMULATION_PARAMETERS_DEFAULTS,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to submit a job.", variant: "destructive" });
      return;
    }

    const payload: SimulationJobPayload = {
      ...values,
      userID: user.id,
      username: user.username,
    };

    try {
      const response = await api.startJob(payload);
      toast({
        title: "Simulation Submitted",
        description: `Job started successfully with ID: ${response}.`,
      });
      form.reset(SIMULATION_PARAMETERS_DEFAULTS); // Reset form after successful submission
    } catch (error) {
      console.error("Failed to submit simulation:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">Job Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="jobId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job ID (Optional)</FormLabel>
                    <FormControl><Input placeholder="Leave blank to auto-generate" {...field} /></FormControl>
                    <FormDescription>Optionally specify a UUID for the job.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="server" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server</FormLabel>
                    <FormControl><Input placeholder="e.g., cluster_node_1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Location</FormLabel>
                    <FormControl><Input placeholder="/path/to/input/files" {...field} /></FormControl>
                    <FormDescription>Path on the server to your input files.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>Job priority (-1 for default).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Time (seconds)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>Maximum execution time (-1 for default).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">Execution Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="simulationType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Simulation Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="MD" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Molecular Dynamics (MD)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="MC" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Monte Carlo (MC)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>Choose the type of simulation to run.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="gpu" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Use GPU</FormLabel>
                      <FormDescription>Utilize GPU for simulation if available.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">Simulation Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem><FormLabel>Steps</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="confInterval" render={({ field }) => (
                  <FormItem><FormLabel>Configuration Interval</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dt" render={({ field }) => (
                  <FormItem><FormLabel>Timestep (dt)</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="interactionType" render={({ field }) => (
                  <FormItem><FormLabel>Interaction Type</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>e.g., 0 for oxDNA, 1 for oxDNA2</FormDescription><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="hBondRestraint" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>H-Bond Restraint</FormLabel>
                      <FormDescription>Enable hydrogen bond restraints.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="T" render={({ field }) => (
                  <FormItem><FormLabel>Temperature</FormLabel><FormControl><Input placeholder="e.g., 20C" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="saltConc" render={({ field }) => (
                  <FormItem><FormLabel>Salt Concentration (M)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="verletSkin" render={({ field }) => (
                  <FormItem><FormLabel>Verlet Skin</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
               <CardHeader><CardTitle className="font-headline text-lg">Advanced Steps & Files</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                <FormField control={form.control} name="step1" render={({ field }) => (
                  <FormItem><FormLabel>Step 1</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="step2" render={({ field }) => (
                  <FormItem><FormLabel>Step 2</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="step3" render={({ field }) => (
                  <FormItem><FormLabel>Step 3</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="forceFile" render={({ field }) => (
                  <FormItem><FormLabel>Force File (Optional)</FormLabel><FormControl><Input placeholder="/path/to/force.dat" {...field} /></FormControl><FormDescription>Path to custom force file.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="override" render={({ field }) => (
                  <FormItem><FormLabel>Override Parameters (Optional)</FormLabel><FormControl><Textarea placeholder="key = value pairs, one per line" {...field} /></FormControl><FormDescription>Additional parameters to override defaults.</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator />

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            <Send className="mr-2 h-5 w-5" />
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Simulation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
