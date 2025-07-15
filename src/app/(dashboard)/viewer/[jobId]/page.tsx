
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import TrajectoryViewer from '@/components/dashboard/viewer/TrajectoryViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Orbit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ViewerPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  return (
    <div className="space-y-6">
       <div>
         <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/job-status">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Job Status
            </Link>
          </Button>
        <h1 className="text-3xl font-bold tracking-tight font-headline">3D Trajectory Viewer</h1>
        {jobId && <p className="text-muted-foreground font-code text-sm">Job ID: {jobId}</p>}
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Orbit className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Interactive Viewer</CardTitle>
              <CardDescription>
                Visualize and animate DNA simulation trajectories. Use your mouse to rotate (left-click & drag), zoom (scroll), and pan (right-click & drag).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full h-[60vh] bg-muted rounded-lg border">
            {jobId ? <TrajectoryViewer jobId={jobId} /> : <p>Job ID not found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    