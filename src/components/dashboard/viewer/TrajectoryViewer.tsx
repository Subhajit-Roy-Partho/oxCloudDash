
"use client";

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// --- Type Definitions ---
interface Nucleotide {
  id: number;
  strandId: number;
  base: string;
  neighbor3: number;
  neighbor5: number;
}

interface Topology {
    nucleotides: Nucleotide[];
    numNucleotides: number;
    numStrands: number;
}

interface Frame {
  time: number;
  positions: THREE.Vector3[];
  a1Vectors: THREE.Vector3[];
}

// --- Parser Functions ---
const parseTopology = (data: string): Topology => {
  const lines = data.trim().split('\n');
  if (lines.length < 1) throw new Error("Invalid topology file: empty or malformed");
  
  const header = lines[0].trim().split(' ').map(Number);
  if (header.length < 2) throw new Error("Invalid topology header");
  const numNucleotides = header[0];
  const numStrands = header[1];
  
  const nucleotides = lines.slice(1).map((line, index) => {
    const parts = line.trim().split(/\s+/);
     if (parts.length < 4) throw new Error(`Invalid topology line: ${line}`);
    return {
      id: index + 1,
      strandId: parseInt(parts[0], 10),
      base: parts[1],
      neighbor3: parseInt(parts[2], 10),
      neighbor5: parseInt(parts[3], 10),
    };
  });
  if(nucleotides.length !== numNucleotides) {
      console.warn("Number of nucleotides in header does not match number of lines.")
  }

  return { nucleotides, numNucleotides, numStrands };
};

const parseTrajectory = (data: string, numNucleotides: number): Frame[] => {
    const frames: Frame[] = [];
    const lines = data.trim().split('\n');
    
    let i = 0;
    while(i < lines.length) {
        if(lines[i].trim().startsWith('t =')) {
            const time = parseFloat(lines[i].split('=')[1].trim());
            
            // Skip b= and E= lines
            i += 3;

            const positions: THREE.Vector3[] = [];
            const a1Vectors: THREE.Vector3[] = [];

            const frameDataLines = lines.slice(i, i + numNucleotides);
            frameDataLines.forEach(line => {
                const n = line.trim().split(/\s+/).map(Number);
                if (n.length >= 6) {
                    positions.push(new THREE.Vector3(n[0], n[1], n[2]));
                    a1Vectors.push(new THREE.Vector3(n[3], n[4], n[5]));
                }
            });

            if (positions.length === numNucleotides) {
                 frames.push({
                    time,
                    positions,
                    a1Vectors,
                });
            }
            i += numNucleotides;
        } else {
            i++;
        }
    }
    return frames;
};


// --- 3D Components ---
const BASE_COLORS: { [key: string]: string } = {
  A: '#f44336', // red
  T: '#2196f3', // blue
  G: '#4caf50', // green
  C: '#ffc107', // amber
};

const CylinderBond: React.FC<{ start: THREE.Vector3, end: THREE.Vector3, color: string, radius: number }> = ({ start, end, color, radius }) => {
  const vec = end.clone().sub(start);
  const length = vec.length();
  const position = start.clone().add(vec.clone().multiplyScalar(0.5));
  
  const cylinderRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (cylinderRef.current) {
        const orientation = new THREE.Matrix4();
        const up = new THREE.Vector3(0, 1, 0);
        orientation.lookAt(start, end, up);
        orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        cylinderRef.current.applyMatrix4(orientation);
    }
  }, [start, end]);

  return (
    <mesh position={position} ref={cylinderRef}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const DNA: React.FC<{ frame: Frame, topology: Topology }> = ({ frame, topology }) => {
  const { nucleotides } = topology;

  return (
    <group>
      {/* Render Nucleotides */}
      {nucleotides.map((n, i) => (
        <Sphere key={`nuc-${i}`} position={frame.positions[i]} args={[0.3, 16, 16]}>
          <meshStandardMaterial color={BASE_COLORS[n.base] || 'grey'} />
        </Sphere>
      ))}

      {/* Render Backbone Bonds */}
      {nucleotides.map((n, i) => {
        if (n.neighbor5 !== -1 && frame.positions[n.neighbor5 -1]) {
          const start = frame.positions[i];
          const end = frame.positions[n.neighbor5 - 1];
          return <CylinderBond key={`bb-${i}`} start={start} end={end} color="white" radius={0.1} />;
        }
        return null;
      })}
      
      {/* Render Hydrogen Bonds */}
      {nucleotides.map((n, i) => {
        if (!frame.positions[i] || !frame.a1Vectors[i]) return null;
        const start = frame.positions[i];
        const end = start.clone().add(frame.a1Vectors[i].clone().multiplyScalar(0.5));
         return <CylinderBond key={`hb-${i}`} start={start} end={end} color="cyan" radius={0.05} />;
      })}
    </group>
  );
};


// --- Main Viewer Component ---
export default function TrajectoryViewer({ jobId }: { jobId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [data, setData] = useState<{topology: Topology, frames: Frame[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const frameInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [topBlob, trajBlob] = await Promise.all([
                api.downloadFile(jobId, 'input.top'),
                api.downloadFile(jobId, 'trajectory.dat')
            ]);
            
            const topText = await topBlob.text();
            const trajText = await trajBlob.text();

            const topology = parseTopology(topText);
            const frames = parseTrajectory(trajText, topology.numNucleotides);

            if(frames.length === 0) {
                setError("No valid frames found in trajectory.dat file.");
            } else {
                 setData({ topology, frames });
            }

        } catch (e) {
            console.error("Failed to load viewer data:", e);
            setError((e as Error).message || "Could not load topology or trajectory files.");
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [jobId]);

  useEffect(() => {
    if (isPlaying && data && data.frames.length > 1) {
      frameInterval.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % data.frames.length);
      }, 1000 / 30); // 30 fps
    } else {
      clearInterval(frameInterval.current);
    }
    return () => clearInterval(frameInterval.current);
  }, [isPlaying, data]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
      setIsPlaying(false);
      setCurrentFrameIndex(0);
  };
  const handleSliderChange = (value: number[]) => {
      setIsPlaying(false);
      setCurrentFrameIndex(value[0]);
  }

  if (loading) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
  }

   if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Viewer</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || data.frames.length === 0) {
    return <div className="w-full h-full flex items-center justify-center">No data available to display.</div>;
  }
  
  return (
    <div className="w-full h-full relative">
       <div className="absolute top-2 left-2 z-10 flex gap-2">
        <Button onClick={handlePlayPause} size="sm" variant="secondary" disabled={data.frames.length <= 1}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>
        <Button onClick={handleReset} size="sm" variant="secondary">
          <RotateCcw className="h-4 w-4" />
          <span className="ml-2">Reset</span>
        </Button>
      </div>
      <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
        <Suspense fallback={null}>
            <group>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <DNA frame={data.frames[currentFrameIndex]} topology={data.topology} />
            </group>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Suspense>
      </Canvas>
       <div className="absolute bottom-2 left-4 right-4 z-10 flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground w-32">
                Time: {data.frames[currentFrameIndex].time.toFixed(0)}
            </span>
            <Slider
                min={0}
                max={data.frames.length - 1}
                step={1}
                value={[currentFrameIndex]}
                onValueChange={handleSliderChange}
                disabled={data.frames.length <= 1}
            />
            <span className="text-sm font-mono text-muted-foreground w-24 text-right">
                {currentFrameIndex + 1} / {data.frames.length}
            </span>
        </div>
    </div>
  );
}
