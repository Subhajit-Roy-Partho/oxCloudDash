
import EnhancedSamplingForm from '@/components/dashboard/enhanced-sampling/EnhancedSamplingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';

export default function EnhancedSamplingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Enhanced Sampling</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Simulation Submission</CardTitle>
              <CardDescription>Submit a job for Umbrella Sampling or Forward Flux Sampling.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EnhancedSamplingForm />
        </CardContent>
      </Card>
    </div>
  );
}
