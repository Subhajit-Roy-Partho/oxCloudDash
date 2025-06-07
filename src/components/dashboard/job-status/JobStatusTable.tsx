
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { JobStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Play, Square, Trash2, Repeat, LineChartIcon, Download, ArrowUpDown, Filter } from 'lucide-react';
import { saveAs } from 'file-saver'; // npm install file-saver @types/file-saver

type SortConfig = {
  key: keyof JobStatus | null;
  direction: 'ascending' | 'descending';
};

export default function JobStatusTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  useEffect(() => {
    async function fetchJobs() {
      if (user?.id) {
        setLoading(true);
        try {
          const userJobs = await api.getJobsByUser(user.id);
          setJobs(userJobs);
        } catch (error) {
          console.error("Failed to fetch jobs:", error);
          toast({ title: "Error", description: "Could not fetch job statuses.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
    }
    fetchJobs();
  }, [user, toast]);

  const handleAction = async (action: () => Promise<any>, successMessage: string, jobUuid: string) => {
    try {
      await action();
      toast({ title: "Success", description: successMessage });
      // Refresh jobs list
      if (user?.id) {
        const updatedJobs = await api.getJobsByUser(user.id);
        setJobs(updatedJobs);
      }
    } catch (error) {
      console.error("Action failed for job", jobUuid, error);
      toast({ title: "Error", description: (error as Error).message || "Action failed.", variant: "destructive" });
    }
  };

  const handleDownload = async (uuid: string, filename: string = "simulation_output.dat") => {
    try {
      const blob = await api.downloadFile(uuid, filename);
      saveAs(blob, `${uuid}_${filename}`);
      toast({ title: "Download Started", description: `Downloading ${filename} for job ${uuid}.` });
    } catch (error) {
      console.error("Download failed for job", uuid, error);
      toast({ title: "Error", description: (error as Error).message || "Download failed.", variant: "destructive" });
    }
  };

  const sortedAndFilteredJobs = useMemo(() => {
    let sortableItems = [...jobs];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(job =>
      job.uuid.toLowerCase().includes(filter.toLowerCase()) ||
      (typeof job.active === 'string' && job.active.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [jobs, filter, sortConfig]);

  const requestSort = (key: keyof JobStatus) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof JobStatus) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 inline" /> : <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
  };
  
  const getJobBadgeVariant = (activeStatus: string | number): "default" | "secondary" | "destructive" | "outline" => {
    const statusStr = String(activeStatus).toLowerCase();
    if (statusStr === 'running' || statusStr === '1' || statusStr === 'active') return "default"; // Primary for running
    if (statusStr === 'completed' || statusStr === 'finished') return "secondary"; // Success variant is not typical for badge, use secondary for completed
    if (statusStr === 'failed' || statusStr === 'error') return "destructive";
    if (statusStr === 'pending' || statusStr === 'queued') return "outline"; // Yellow like, use outline
    return "outline"; // Default for unknown states
  };


  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Filter jobs by UUID or status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('uuid')} className="cursor-pointer">UUID {getSortIndicator('uuid')}</TableHead>
              <TableHead onClick={() => requestSort('active')} className="cursor-pointer">Status {getSortIndicator('active')}</TableHead>
              <TableHead onClick={() => requestSort('progress')} className="cursor-pointer">Progress {getSortIndicator('progress')}</TableHead>
              <TableHead onClick={() => requestSort('runningTime')} className="cursor-pointer">Running Time {getSortIndicator('runningTime')}</TableHead>
              <TableHead onClick={() => requestSort('stepsCompleted')} className="cursor-pointer">Steps {getSortIndicator('stepsCompleted')}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredJobs.length > 0 ? sortedAndFilteredJobs.map((job) => (
              <TableRow key={job.uuid}>
                <TableCell className="font-medium truncate max-w-xs font-code">{job.uuid}</TableCell>
                <TableCell>
                  <Badge variant={getJobBadgeVariant(job.active)}>{String(job.active)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={Number(job.progress) || 0} className="w-24 h-2" />
                    <span>{Number(job.progress) || 0}%</span>
                  </div>
                </TableCell>
                <TableCell>{job.runningTime}</TableCell>
                <TableCell>{job.stepsCompleted}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleAction(() => api.resumeJob(job.uuid), `Job ${job.uuid} resumed.`, job.uuid)}
                        className="cursor-pointer"
                      >
                        <Play className="mr-2 h-4 w-4" /> Resume
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleAction(() => api.stopJob(job.uuid), `Job ${job.uuid} stopped.`, job.uuid)}
                        className="cursor-pointer"
                      >
                        <Square className="mr-2 h-4 w-4" /> Stop
                      </DropdownMenuItem>
                       <DropdownMenuItem
                        onSelect={() => handleAction(() => api.deleteJob(job.uuid), `Job ${job.uuid} deleted.`, job.uuid)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/data-analysis/${job.uuid}`}>
                          <LineChartIcon className="mr-2 h-4 w-4" /> Analyze
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDownload(job.uuid)} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" /> Download Results
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Ensure file-saver is installed: npm install file-saver
// and types: npm install --save-dev @types/file-saver
