
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { SIMULATION_PARAMETERS_DEFAULTS, INTERACTION_TYPE_OPTIONS, THERMOSTAT_OPTIONS } from '@/lib/constants';
import type { SimulationJobPayload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const MANAGED_PARAMS = [
    'T', 'simulation_type', 'backend', 'steps', 'conf_int', 'dt', 'interaction_type', 
    'salt_concentration', 'verlet_skin', 'use_average_seq', 'max_backbone_force', 'seed', 
    'thermostat', 'delta_translation', 'delta_rotation', 'mismatch_repulsion', 'mismatch_repulsion_strength'
];


const formSchema = z.object({
  jobName: z.string().optional(),
  topology: z.any().refine((file): file is File => file instanceof File, "Topology file is required."),
  configuration: z.any().refine((file): file is File => file instanceof File, "Configuration file is required."),
  priority: z.coerce.number().int(),
  maxTime: z.coerce.number().int(),
  simulationType: z.enum(['MD', 'MC'], { required_error: "You must select a simulation type."}),
  gpu: z.boolean(),
  steps: z.coerce.number().positive("Steps must be a positive number."),
  confInterval: z.coerce.number().positive("Configuration interval must be positive."),
  dt: z.coerce.number().positive("dt must be positive."),
  interactionType: z.coerce.number().int().min(0),
  hBondRestraint: z.boolean(),
  T: z.string().min(1, "Temperature is required."),
  saltConc: z.coerce.number().min(0, "Salt concentration cannot be negative."),
  forceFile: z.any().optional(),
  verletSkin: z.coerce.number().min(0),
  override: z.string().optional(),
  // New schema fields
  use_average_seq: z.boolean().optional(),
  max_backbone_force: z.coerce.number().optional(),
  seed: z.coerce.number().int().optional(),
  thermostat: z.string().optional(),
  delta_translation: z.coerce.number().optional(),
  delta_rotation: z.coerce.number().optional(),
  mismatch_repulsion: z.boolean().optional(),
  mismatch_repulsion_strength: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
    if (data.override) {
        const lines = data.override.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('#') || trimmedLine === '') continue; // Ignore comments and empty lines

            const parts = trimmedLine.split('=').map(p => p.trim());
            const key = parts[0];
            
            if (MANAGED_PARAMS.includes(key)) {
                 ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['override'],
                    message: `Parameter "${key}" is already managed by a form field. Please remove it from Additional Parameters.`,
                });
                return;
            }
        }
    }
});


export default function SimulationForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: SIMULATION_PARAMETERS_DEFAULTS,
  });

  const simulationType = form.watch('simulationType');
  const interactionType = form.watch('interactionType');
  const mismatchRepulsion = form.watch('mismatch_repulsion');
  const useGpu = form.watch('gpu');

  React.useEffect(() => {
    if (simulationType === 'MC') {
      form.setValue('gpu', false);
    }
  }, [simulationType, form.setValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to submit a job.", variant: "destructive" });
      return;
    }

    const overrideLines: string[] = [];

    overrideLines.push(`use_average_seq = ${values.use_average_seq ? 'true' : 'false'}`);
    
    if (values.max_backbone_force && values.max_backbone_force > 0) {
        overrideLines.push(`max_backbone_force = ${values.max_backbone_force}`);
    }
    if (values.seed && values.seed !== -1) {
        overrideLines.push(`seed = ${values.seed}`);
    }
    if (values.simulationType === 'MD' && values.thermostat) {
        overrideLines.push(`thermostat = ${values.thermostat}`);
    }
    if (values.simulationType === 'MC') {
        if(values.delta_translation) overrideLines.push(`delta_translation = ${values.delta_translation}`);
        if(values.delta_rotation) overrideLines.push(`delta_rotation = ${values.delta_rotation}`);
    }
    if (values.interactionType === 1) { // RNA2
        overrideLines.push(`mismatch_repulsion = ${values.mismatch_repulsion ? 'true' : 'false'}`);
        if (values.mismatch_repulsion && values.mismatch_repulsion_strength) {
            overrideLines.push(`mismatch_repulsion_strength = ${values.mismatch_repulsion_strength}`);
        }
    }

    let overrideParams = values.override || '';
    const generatedOverrides = overrideLines.join('\n');
    
    overrideParams = overrideParams.trim()
      ? `${overrideParams.trim()}\n${generatedOverrides}`
      : generatedOverrides;

    const { 
        use_average_seq, 
        max_backbone_force,
        seed,
        thermostat,
        delta_translation,
        delta_rotation,
        mismatch_repulsion,
        mismatch_repulsion_strength,
        ...apiValues 
    } = values;

    const payload: SimulationJobPayload = {
      ...apiValues,
      override: overrideParams,
      userID: user.id, 
      username: user.username,
      topology: values.topology,
      configuration: values.configuration,
      forceFile: values.forceFile instanceof File ? values.forceFile : undefined,
    };

    try {
      const response = await api.startJob(payload);
      toast({
        title: "Simulation Submitted",
        description: `Job started successfully with ID: ${response}.`,
      });
      form.reset(SIMULATION_PARAMETERS_DEFAULTS); 
    } catch (error) {
      console.error("Failed to submit simulation:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof z.infer<typeof formSchema>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(fieldName, file, { shouldValidate: true });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">Job & File Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="jobName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Name (Optional)</FormLabel>
                    <FormControl><Input placeholder="Leave blank to auto-generate" {...field} value={field.value ?? ""} /></FormControl>
                    <FormDescription>Optionally specify a name for the job.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="topology" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topology File</FormLabel>
                    <FormControl>
                      <Input type="file" onChange={(e) => handleFileChange(e, 'topology')} />
                    </FormControl>
                     <FormDescription>Upload your topology file (.top).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="configuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration File</FormLabel>
                    <FormControl>
                      <Input type="file" onChange={(e) => handleFileChange(e, 'configuration')} />
                    </FormControl>
                    <FormDescription>Upload your configuration file (.conf).</FormDescription>
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
                      <FormDescription>Utilize GPU for simulation if available. (Disabled for MC)</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={simulationType === 'MC'} /></FormControl>
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
                <FormField
                  control={form.control}
                  name="interactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interaction Type</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INTERACTION_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose the interaction model for the simulation.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {interactionType === 1 && (
                    <Card className="border-dashed p-4 space-y-4">
                        <FormField control={form.control} name="mismatch_repulsion" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5"><FormLabel>Mismatch Repulsion</FormLabel><FormDescription>Add repulsion between mismatches.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        {mismatchRepulsion && (
                            <FormField control={form.control} name="mismatch_repulsion_strength" render={({ field }) => (
                                <FormItem><FormLabel>Mismatch Repulsion Strength</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                    </Card>
                 )}
                 {simulationType === 'MC' && (
                    <Card className="border-dashed p-4 space-y-4">
                         <FormField control={form.control} name="delta_translation" render={({ field }) => (
                            <FormItem><FormLabel>Delta Translation</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Maximum translational displacement.</FormDescription><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="delta_rotation" render={({ field }) => (
                            <FormItem><FormLabel>Delta Rotation</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Maximum angular rotational displacement.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </Card>
                 )}
                 <FormField control={form.control} name="hBondRestraint" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>H-Bond Restraint</FormLabel>
                      <FormDescription>Enable hydrogen bond restraints.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="use_average_seq" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Use Average Sequence Parameters</FormLabel>
                      <FormDescription>Use average-sequence parameters. Defaults to false.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="T" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl><Input placeholder="e.g., 20C" {...field} /></FormControl>
                    <FormDescription>Add C or K at the end of the number to represent it in Celsius or Kelvin respectively, otherwise it will be treated in oxDNA unit of temperature.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="saltConc" render={({ field }) => (
                  <FormItem><FormLabel>Salt Concentration (M)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                 <Card>
                    <AccordionTrigger className="p-6">
                        <CardHeader className="p-0">
                            <CardTitle className="font-headline text-lg">Advanced Parameters</CardTitle>
                        </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-4 pt-0">
                        <FormField control={form.control} name="forceFile" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Force File (Optional)</FormLabel>
                             <FormControl>
                              <Input type="file" onChange={(e) => handleFileChange(e, 'forceFile')} />
                            </FormControl>
                            <FormDescription>Upload a custom force file.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="verletSkin" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verlet Skin</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} disabled={!useGpu} />
                            </FormControl>
                             <FormDescription>Only applicable when using GPU.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        {simulationType === 'MD' && (
                           <FormField
                            control={form.control}
                            name="thermostat"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Thermostat</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a thermostat" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {THERMOSTAT_OPTIONS.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Select the thermostat for MD simulations.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}

                        <FormField control={form.control} name="max_backbone_force" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Backbone Force</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ""} /></FormControl>
                            <FormDescription>Maximum force for FENE bonds. Should be > 0. Leave as 0 for default.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="seed" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Random Seed</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormDescription>Seed for the random number generator. (-1 for default/random).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="override" render={({ field }) => (
                          <FormItem><FormLabel>Additional Parameters (Optional)</FormLabel>
                          <FormControl><Textarea placeholder="key = value pairs, one per line" {...field} value={field.value ?? ""} /></FormControl>
                          <FormDescription>Additional parameters to override defaults. Do not re-enter parameters from the fields above.</FormDescription>
                          <FormMessage /></FormItem>
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
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Simulation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
