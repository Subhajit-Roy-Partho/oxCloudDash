
import AnalysisForm from '@/components/dashboard/data-analysis/AnalysisForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp } from 'lucide-react';

export default function ExternalAnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">External Analysis Tool</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileUp className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Analyze Your Files</CardTitle>
              <CardDescription>
                Analyze your externally-run simulation files using our suite of post-processing protocols.
                Start by selecting an analysis type and uploading your files.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Render AnalysisForm without a jobId to indicate it's for external files */}
          <AnalysisForm />
        </CardContent>
      </Card>
    </div>
  );
}
