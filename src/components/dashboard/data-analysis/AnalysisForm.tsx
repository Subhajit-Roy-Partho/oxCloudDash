
"use client";

import React, { useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ANALYSIS_OPTIONS } from '@/lib/constants';
import type { AnalysisJobPayload } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface AnalysisFormProps {
    jobId?: string; // Optional jobId distinguishes between internal and external analysis
}

// Schema factory to create a schema based on context (internal vs. external)
const createFormSchema = (isExternal: boolean) => z.object({
  analysisType: z.coerce.number({ required_error: "Please select an analysis type." }),
  topology: z.any().optional(),
  configuration: z.any().optional(),
  otherFile1: z.any().optional(),
  otherFile2: z.any().optional(),
  bool1: z.boolean().optional(),
  int1: z.coerce.number().optional(),
  str1: z.string().optional(),
  str2: z.string().optional(),
  double1: z.coerce.number().optional(),
  inlist: z.string().optional(),
  cpus: z.coerce.number().int().positive().optional(),
}).superRefine((data, ctx) => {
    // Only perform this validation if an analysis type is selected
    if (data.analysisType === undefined) return;

    const selectedAnalysis = ANALYSIS_OPTIONS.find(opt => opt.value === data.analysisType);
    if (selectedAnalysis) {
      for (const file of selectedAnalysis.files) {
        // A file is required if the config says so AND it's an external analysis,
        // or if it's required and is NOT a standard topology/configuration file for internal analysis.
        const isRequired = file.required && (isExternal || (file.name !== 'topology' && file.name !== 'configuration'));
        
        if (isRequired && !(data[file.name] instanceof File)) {
           ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [file.name],
              message: `${file.label} is required.`,
            });
        }
      }
    }
});


export default function AnalysisForm({ jobId }: AnalysisFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isExternal = !jobId;

  const formSchema = useMemo(() => createFormSchema(isExternal), [isExternal]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpus: 1,
      bool1: false,
    },
  });

  const selectedAnalysisValue = form.watch('analysisType');

  const selectedAnalysis = useMemo(() => {
    return ANALYSIS_OPTIONS.find(opt => opt.value === selectedAnalysisValue);
  }, [selectedAnalysisValue]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormValues) => {
    const file = e.target.files?.[0];
    form.setValue(fieldName, file || null, { shouldValidate: true });
  };


  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!selectedAnalysis) {
        toast({ title: "Validation Error", description: "You must select an analysis type.", variant: "destructive" });
        return;
    }

    const payload: AnalysisJobPayload = {
      userID: user.id,
      analysisType: values.analysisType,
      cpus: values.cpus || 1,
      // Generic params
      bool1: values.bool1,
      int1: values.int1,
      str1: values.str1,
      str2: values.str2,
      double1: values.double1,
      inlist: values.inlist,
      // Files - only include if they are File objects
      topology: values.topology instanceof File ? values.topology : undefined,
      configuration: values.configuration instanceof File ? values.configuration : undefined,
      otherFile1: values.otherFile1 instanceof File ? values.otherFile1 : undefined,
      otherFile2: values.otherFile2 instanceof File ? values.otherFile2 : undefined,
    };
    
    // For internal analysis, provide the job UUID and location
    if (!isExternal) {
        payload.jobUuid = jobId;
        payload.jobLocation = jobId;
    }

    try {
      const response = await api.startAnalysisJob(payload);
      toast({
        title: "Analysis Job Submitted",
        description: `${selectedAnalysis.label} analysis started with ID: ${response}.`,
      });
      form.reset({ ...form.getValues(), str1: '', str2: '', int1: undefined, double1: undefined, bool1: false });

    } catch (error) {
      console.error("Failed to submit analysis job:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="analysisType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analysis Type</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an analysis protocol..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ANALYSIS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label} ({option.command})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAnalysis && <FormDescription>{selectedAnalysis.description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedAnalysis && (
          <Card className="border-dashed">
            <CardHeader>
                <CardTitle>Parameters for: {selectedAnalysis.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedAnalysis.files.map(file => {
                    const isServerFile = !isExternal && (file.name === 'topology' || file.name === 'configuration');

                    return(
                      <FormField
                          key={file.name}
                          control={form.control}
                          name={file.name}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{file.label} {file.required && !isServerFile && <span className="text-destructive">*</span>}</FormLabel>
                                  {isServerFile ? (
                                      <div className="text-sm p-3 bg-muted rounded-md border text-muted-foreground">
                                          ✓ Using file from the original simulation job.
                                      </div>
                                  ) : (
                                    <>
                                      <FormControl><Input type="file" onChange={(e) => handleFileChange(e, file.name)} /></FormControl>
                                      <FormDescription>{file.description}</FormDescription>
                                      <FormMessage />
                                    </>
                                  )}
                              </FormItem>
                          )}
                      />
                    )
                })}

                {selectedAnalysis.params.map(param => (
                    <FormField
                        key={param.name}
                        control={form.control}
                        name={param.backendName}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{param.label}</FormLabel>
                                {param.type === 'boolean' ? (
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        {param.description && <span className="text-sm text-muted-foreground">{param.description}</span>}
                                    </div>
                                ) : param.type === 'textarea' ? (
                                    <FormControl><Textarea placeholder={param.description} {...field} value={field.value ?? ''}/></FormControl>
                                ) : (
                                    <FormControl><Input type={param.type} placeholder={param.description} {...field} value={field.value ?? ''} /></FormControl>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </CardContent>
          </Card>
        )}
        
        <Separator />
        
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={!selectedAnalysis || form.formState.isSubmitting}>
            <Send className="mr-2 h-5 w-5" />
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Analysis'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
