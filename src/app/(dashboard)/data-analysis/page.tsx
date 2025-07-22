
"use client";

import { useSearchParams } from 'next/navigation';
import EnergyChart from '@/components/dashboard/data-analysis/EnergyChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartIcon, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AnalysisForm from '@/components/dashboard/data-analysis/AnalysisForm';

export default function DataAnalysisPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  if (!jobId) {
     return (
        <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight font-headline mt-8">Job Not Specified</h1>
            <p className="text-muted-foreground">Please return to the Job Status page and select a job to view its data.</p>
             <Button variant="outline" asChild>
                <Link href="/job-status">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job Status
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/job-status">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Job Status
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Analysis for Job</h1>
           <p className="text-muted-foreground font-code text-sm">Job ID: {jobId}</p>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3">
            <LineChartIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Energy</CardTitle>
              <CardDescription>Visualization of potential, kinetic, and total energy data from the simulation.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobId ? <EnergyChart jobId={jobId} /> : <p>Job ID not found.</p>}
        </CardContent>
      </Card>
      
      <Separator />

       <div className="space-y-4">
        <div className="flex items-center space-x-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Data Analysis</h2>
                <p className="text-muted-foreground">Run post-simulation analysis protocols on your job's output files.</p>
            </div>
        </div>
        <Card className="shadow-lg">
            <CardContent className="pt-6">
                {jobId ? <AnalysisForm jobId={jobId} /> : <p>Job ID not found.</p>}
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
