
import SimulationForm from '@/components/dashboard/submit-simulation/SimulationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaySquare } from 'lucide-react';

export default function SubmitSimulationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Submit New Simulation</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <PlaySquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Simulation Parameters</CardTitle>
              <CardDescription>Configure and submit your oxDNA simulation job.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SimulationForm />
        </CardContent>
      </Card>
    </div>
  );
}
