
import JobStatusTable from '@/components/dashboard/job-status/JobStatusTable';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

export default function JobStatusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Job Status Overview</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ListChecks className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Your Simulations</CardTitle>
              <CardDescription>Track the status, progress, and manage your simulation jobs.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <JobStatusTable />
        </CardContent>
      </Card>
    </div>
  );
}
