
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import type { ServerResource } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, Filter, Cpu, Zap, MemoryStick } from 'lucide-react'; // Zap for GPU, MemoryStick for RAM
import { Progress } from '@/components/ui/progress';

type SortConfig = {
  key: keyof ServerResource | null;
  direction: 'ascending' | 'descending';
};

// Helper to parse resource strings like "X/Y" into percentage
const parseResourceToPercentage = (avail: string, totalVal?: string): number => {
  if (!avail) return 0;
  // If avail is like "X/Y" e.g. "8/16" for CPU (This mode is less likely for CPU with new totalCPU field)
  if (avail.includes('/')) {
    const parts = avail.split('/');
    if (parts.length === 2) {
      const available = parseFloat(parts[0]);
      const total = parseFloat(parts[1]);
      return total > 0 ? (available / total) * 100 : 0;
    }
  }
  // If avail is just a number and total is provided separately (Used for RAM)
  if (totalVal) {
      const available = parseFloat(avail);
      const total = parseFloat(totalVal);
      return total > 0 ? (available / total) * 100 : 0;
  }
  // If it's a direct percentage or cannot parse (Fallback, less likely to be used with specific total fields)
  const val = parseFloat(avail);
  return isNaN(val) ? 0 : val;
};


export default function ServerStatusTable() {
  const [resources, setResources] = useState<ServerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const serverResources = await api.getServerResources();
        setResources(serverResources);
      } catch (error) {
        console.error("Failed to fetch server resources:", error);
        toast({ title: "Error", description: "Could not fetch server statuses.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [toast]);

  const sortedAndFilteredResources = useMemo(() => {
    let sortableItems = [...resources];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Handle numeric sorting for resource values if possible
        const valA = parseFloat(String(a[sortConfig.key!]));
        const valB = parseFloat(String(b[sortConfig.key!]));

        if (!isNaN(valA) && !isNaN(valB)) {
          if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }
        // Fallback to string comparison
        if (String(a[sortConfig.key!]) < String(b[sortConfig.key!])) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (String(a[sortConfig.key!]) > String(b[sortConfig.key!])) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(resource =>
      resource.name.toLowerCase().includes(filter.toLowerCase()) ||
      resource.CPUavail.toLowerCase().includes(filter.toLowerCase()) ||
      (resource.totalCPU && resource.totalCPU.toLowerCase().includes(filter.toLowerCase())) ||
      resource.GPUavail.toLowerCase().includes(filter.toLowerCase()) ||
      resource.RAMavail.toLowerCase().includes(filter.toLowerCase())
    );
  }, [resources, filter, sortConfig]);

  const requestSort = (key: keyof ServerResource) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof ServerResource) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 inline" /> : <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
  };

  if (loading) {
    return (
       <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        {[...Array(3)].map((_, i) => (
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
          placeholder="Filter servers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer">Server Name {getSortIndicator('name')}</TableHead>
              <TableHead onClick={() => requestSort('CPUavail')} className="cursor-pointer">CPU Available {getSortIndicator('CPUavail')}</TableHead>
              <TableHead onClick={() => requestSort('GPUavail')} className="cursor-pointer">GPU Available {getSortIndicator('GPUavail')}</TableHead>
              <TableHead onClick={() => requestSort('RAMavail')} className="cursor-pointer">RAM Available {getSortIndicator('RAMavail')}</TableHead>
              <TableHead onClick={() => requestSort('TotalRam')} className="cursor-pointer">Total RAM {getSortIndicator('TotalRam')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredResources.length > 0 ? sortedAndFilteredResources.map((res) => {
              const availableCpu = parseFloat(res.CPUavail);
              const totalCpu = parseFloat(res.totalCPU);
              const cpuUsagePercentage = totalCpu > 0 && availableCpu <= totalCpu 
                ? ((totalCpu - availableCpu) / totalCpu) * 100 
                : 0;

              const availableRam = parseFloat(res.RAMavail);
              const totalRam = parseFloat(res.TotalRam); // TotalRam is already mapped from totalRAM
              const ramUsagePercentage = totalRam > 0 && availableRam <= totalRam
                ? ((totalRam - availableRam) / totalRam) * 100
                : 0;
              
              return (
                <TableRow key={res.id}>
                  <TableCell className="font-medium">{res.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-blue-500" /> 
                      <span>{res.CPUavail} / {res.totalCPU}</span>
                      <Progress value={cpuUsagePercentage} className="w-20 h-2" indicatorClassName={cpuUsagePercentage > 80 ? 'bg-destructive' : 'bg-primary'} />
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-500" />
                      <span>{res.GPUavail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                      <MemoryStick className="h-5 w-5 text-purple-500" />
                      <span>{res.RAMavail}</span>
                       <Progress value={ramUsagePercentage} className="w-20 h-2" indicatorClassName={ramUsagePercentage > 80 ? 'bg-destructive' : 'bg-primary'}/>
                    </div>
                  </TableCell>
                  <TableCell>{res.TotalRam}</TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No server resources found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

