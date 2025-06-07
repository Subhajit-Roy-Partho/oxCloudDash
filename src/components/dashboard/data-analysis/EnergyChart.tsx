
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EnergyData } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'; // Recharts is used by shadcn/ui charts
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface EnergyChartProps {
  jobId: string;
}

const chartConfig = {
  energy: {
    label: "Energy",
    color: "hsl(var(--primary))",
  },
} satisfies Record<string, { label: string; color: string }>;


export default function EnergyChart({ jobId }: EnergyChartProps) {
  const [data, setData] = useState<any[]>([]); // Recharts expects array of objects
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (!jobId) return;
      setLoading(true);
      try {
        const energyDataArray = await api.getEnergyData(jobId);
        // Transform EnergyData (array of [x,y] tuples) to array of objects for Recharts
        const chartData = energyDataArray.map(point => ({
          step: point[0], // Assuming first element is step/time
          energy: point[1] // Assuming second element is energy
        }));
        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch energy data:", error);
        toast({ title: "Error", description: "Could not fetch energy data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId, toast]);

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No energy data available for this job.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-video h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="step" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => value.toLocaleString()}
            stroke="hsl(var(--foreground))"
            tickLine={{ stroke: "hsl(var(--foreground))" }}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            tickLine={{ stroke: "hsl(var(--foreground))" }}
            tickFormatter={(value) => value.toPrecision(3)}
          />
          <Tooltip
            content={<ChartTooltipContent indicator="dot" />}
            cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1.5 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Legend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="energy"
            stroke={chartConfig.energy.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: chartConfig.energy.color, stroke: "hsl(var(--background))", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
