import TrajectoryViewer from '@/components/dashboard/viewer/TrajectoryViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Orbit } from 'lucide-react';

export default function ViewerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">3D Trajectory Viewer</h1>
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
            <TrajectoryViewer />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
