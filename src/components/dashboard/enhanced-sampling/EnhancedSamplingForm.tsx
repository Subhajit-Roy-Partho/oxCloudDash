
"use client";

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ENHANCED_SAMPLING_DEFAULTS } from '@/lib/constants';
import type { EnhancedSamplingPayload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  jobName: z.string().optional(),
  samplingType: z.enum(['Umbrella', 'ForwardFlux'], { required_error: "You must select a sampling type."}),
  topology: z.any().refine((file): file is File => file instanceof File, "Topology file is required."),
  configuration: z.any().refine((file): file is File => file instanceof File, "Configuration file is required."),
  testPreEq: z.boolean(),
  nucleotideIndexes0: z.string().min(1, "This field is required."),
  nucleotideIndexes1: z.string().min(1, "This field is required."),
  xmin: z.coerce.number(),
  xmax: z.coerce.number(),
  steps: z.coerce.number().int().positive("Must be a positive number"),
  smallSystem: z.boolean(),
  T: z.string().min(1, "Temperature is required."),
  saltConc: z.coerce.number(),
  nWindows: z.coerce.number().int().positive("Must be a positive number"),
  stiff: z.coerce.number(),
  protein: z.any().optional(),
  sequenceDependent: z.boolean(),
  pullingSteps: z.coerce.number().int().positive("Must be a positive number"),
  eqSteps: z.coerce.number().int().positive("Must be a positive number"),
  meltingTemperature: z.boolean(),
  forceFile: z.any().optional(),
});

export default function EnhancedSamplingForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: ENHANCED_SAMPLING_DEFAULTS,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof z.infer<typeof formSchema>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(fieldName, file, { shouldValidate: true });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to submit a job.", variant: "destructive" });
      return;
    }

    const tempValue = parseInt(values.T, 10);
    if (isNaN(tempValue)) {
        toast({ title: "Invalid Temperature", description: "Please enter a valid number for temperature.", variant: "destructive"});
        return;
    }

    const payload: EnhancedSamplingPayload = {
      ...values,
      userID: user.id,
      T: tempValue,
      // protein: !!values.proteinFile, // Set boolean based on file presence
      topology: values.topology,
      configuration: values.configuration,
      protein: values.protein instanceof File ? values.protein : undefined,
      forceFile: values.forceFile instanceof File ? values.forceFile : undefined,
    };
    
    try {
      // NOTE: User-provided backend route currently returns a "not implemented" message.
      // The form will submit successfully, but the backend will not process the job fully.
      const response = await api.runEnhancedSamplingJob(payload);
      toast({
        title: "Enhanced Sampling Job Submitted",
        description: `Job submitted. Backend responded with: ${response}`,
      });
      form.reset(ENHANCED_SAMPLING_DEFAULTS);
    } catch (error) {
      console.error("Failed to submit enhanced sampling job:", error);
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
              <CardHeader><CardTitle className="font-headline text-lg">Required Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="jobName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Name</FormLabel>
                    <FormControl><Input placeholder="A descriptive name for your job" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="samplingType" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Sampling Type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Umbrella" /></FormControl><FormLabel className="font-normal">Umbrella Sampling</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="ForwardFlux" /></FormControl><FormLabel className="font-normal">Forward Flux</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="topology" render={() => (
                  <FormItem>
                    <FormLabel>Topology File</FormLabel>
                    <FormControl><Input type="file" onChange={(e) => handleFileChange(e, 'topology')} /></FormControl>
                    <FormDescription>An oxDNA topology file (.top)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="configuration" render={() => (
                  <FormItem>
                    <FormLabel>Configuration File</FormLabel>
                    <FormControl><Input type="file" onChange={(e) => handleFileChange(e, 'configuration')} /></FormControl>
                    <FormDescription>An equilibrated oxDNA conformation (.dat)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="nucleotideIndexes0" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nucleotide Indexes 0</FormLabel>
                    <FormControl><Input placeholder="10, 11, 12, 16, 9" {...field} /></FormControl>
                     <FormDescription>Comma-separated oxView particle IDs for center of mass 0.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="nucleotideIndexes1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nucleotide Indexes 1</FormLabel>
                    <FormControl><Input placeholder="14, 21, 30" {...field} /></FormControl>
                     <FormDescription>Comma-separated oxView particle IDs for center of mass 1.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="xmin" render={({ field }) => (
                    <FormItem><FormLabel>X Minimum</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="xmax" render={({ field }) => (
                    <FormItem><FormLabel>X Maximum</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="testPreEq" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5"><FormLabel>Test Pre-Equilibration</FormLabel><FormDescription>Run a quick pulling simulation. (Recommended)</FormDescription></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">Key Arguments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem><FormLabel>Production Steps</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="T" render={({ field }) => (
                  <FormItem><FormLabel>Temperature</FormLabel><FormControl><Input placeholder="e.g., 37C" {...field} /></FormControl><FormDescription>Temperature in Celsius to run the simulation at.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="saltConc" render={({ field }) => (
                  <FormItem><FormLabel>Salt Concentration (M)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nWindows" render={({ field }) => (
                  <FormItem><FormLabel>Number of Windows</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Number of simulation windows (replicas).</FormDescription><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="stiff" render={({ field }) => (
                  <FormItem><FormLabel>Stiffness of Spring (k)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="smallSystem" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5"><FormLabel>Small System</FormLabel><FormDescription>Enable for systems with &le; 500 nucleotides.</FormDescription></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                 <Card>
                    <AccordionTrigger className="p-6">
                        <CardHeader className="p-0"><CardTitle className="font-headline text-lg">Advanced Parameters</CardTitle></CardHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-4 pt-0">
                        <FormField control={form.control} name="pullingSteps" render={({ field }) => (
                          <FormItem><FormLabel>Pulling Steps</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Pre-equilibration pulling phase steps.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="eqSteps" render={({ field }) => (
                          <FormItem><FormLabel>Equilibrium Steps</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Equilibration phase steps.</FormDescription><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="protein" render={() => (
                          <FormItem>
                            <FormLabel>Protein Present File (Optional)</FormLabel>
                            <FormControl><Input type="file" onChange={(e) => handleFileChange(e, 'protein')} /></FormControl>
                            <FormDescription>A protein .par file if your system contains a protein.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="forceFile" render={() => (
                          <FormItem>
                            <FormLabel>Force File (Optional)</FormLabel>
                            <FormControl><Input type="file" onChange={(e) => handleFileChange(e, 'forceFile')} /></FormControl>
                            <FormDescription>oxDNA force file for restrained umbrella sampling.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="sequenceDependent" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5"><FormLabel>Sequence Dependant</FormLabel><FormDescription>If true, G-C bonds are stronger than A-T.</FormDescription></div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                         <FormField control={form.control} name="meltingTemperature" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5"><FormLabel>Calculate Melting Temperature</FormLabel><FormDescription>Attempt to calculate T_m for the interaction.</FormDescription></div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                      </CardContent>
                    </AccordionContent>
                 </Card>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        <Separator />

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            <Send className="mr-2 h-5 w-5" />
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Job'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
