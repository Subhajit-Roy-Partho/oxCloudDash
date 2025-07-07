
"use client";

import { useParams } from 'next/navigation';
import EnergyChart from '@/components/dashboard/data-analysis/EnergyChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DataAnalysisPage() {
  const params = useParams();
  const jobId = params.jobId as string;

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
          <h1 className="text-3xl font-bold tracking-tight font-headline">Data Analysis</h1>
           <p className="text-muted-foreground font-code text-sm">Job ID: {jobId}</p>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3">
            <LineChartIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Energy Profile</CardTitle>
              <CardDescription>Visualization of potential, kinetic, and total energy data from the simulation.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobId ? <EnergyChart jobId={jobId} /> : <p>Job ID not found.</p>}
        </CardContent>
      </Card>
      {/* Future: Add more analysis components here */}
    </div>
  );
}
