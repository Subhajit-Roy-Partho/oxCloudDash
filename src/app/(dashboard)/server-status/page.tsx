
import ServerStatusTable from '@/components/dashboard/server-status/ServerStatusTable';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Server } from 'lucide-react';

export default function ServerStatusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Server Status</h1>
      </div>
      <Card className="shadow-lg">
         <CardHeader>
          <div className="flex items-center space-x-3">
            <Server className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Available Resources</CardTitle>
              <CardDescription>Overview of CPU and RAM availability across simulation servers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ServerStatusTable />
        </CardContent>
      </Card>
    </div>
  );
}
