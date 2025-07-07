
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { GetEnergyResponse } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface EnergyChartProps {
  jobId: string;
}

const chartConfig = {
  potential: {
    label: "Potential",
    color: "hsl(var(--chart-1))",
  },
  kinetic: {
    label: "Kinetic",
    color: "hsl(var(--chart-2))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-3))",
  },
} satisfies Record<string, { label: string; color: string }>;

interface ChartDataPoint {
    time: number;
    potential: number;
    kinetic: number;
    total: number;
}

export default function EnergyChart({ jobId }: EnergyChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (!jobId) return;
      setLoading(true);
      try {
        const energyData: GetEnergyResponse = await api.getEnergyData(jobId);
        
        if (energyData.time && energyData.time.length > 0) {
            const chartData: ChartDataPoint[] = energyData.time.map((t, index) => ({
                time: t,
                potential: energyData.potential[index],
                kinetic: energyData.kinetic[index],
                total: energyData.total[index],
            }));
            setData(chartData);
        } else {
            setData([]);
        }

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
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => value.toLocaleString()}
            stroke="hsl(var(--foreground))"
            tickLine={{ stroke: "hsl(var(--foreground))" }}
            label={{ value: "Time / Step", position: 'insideBottom', offset: -15 }}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            tickLine={{ stroke: "hsl(var(--foreground))" }}
            tickFormatter={(value) => value.toPrecision(4)}
            label={{ value: 'Energy', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={<ChartTooltipContent indicator="dot" />}
            cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1.5 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Legend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="potential"
            stroke={chartConfig.potential.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="kinetic"
            stroke={chartConfig.kinetic.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke={chartConfig.total.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
