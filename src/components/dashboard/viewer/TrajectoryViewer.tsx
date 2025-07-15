"use client";

import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// --- Sample Data (as provided in the prompt) ---
const topologyData = `24 2
1 C -1 1
1 G 0 2
1 C 1 3
1 T 2 4
1 C 3 5
1 A 4 6
1 A 5 7
1 A 6 8
1 A 7 9
1 A 8 10
1 A 9 11
1 G 10 -1
2 C -1 13
2 T 12 14
2 T 13 15
2 T 14 16
2 T 15 17
2 T 16 18
2 T 17 19
2 G 18 20
2 A 19 21
2 G 20 22
2 C 21 23
2 G 22 -1`;

const trajectoryData = `t = 0
b = 6 6 6
E = 0 0 0
-1.4407529830932617 -1.1504507064819336 -1.4891737699508667 0.9016408492286592 -0.2673408414729088 0.3399597821548592 0.04272955682985936 0.8372804971399213 0.5451014163275035 0 0 0 0 0 0
-1.431295394897461 -1.0327768325805664 -1.0320978164672852 0.9928923512284992 0.06070378883039416 -0.10237103542300181 0.028236511875504217 0.7154389661805741 0.6981044227531983 0 0 0 0 0 0
-1.3211593627929688 -0.7826614379882812 -0.5468549728393555 0.7988596894711015 0.10401011726996115 -0.5924568271558901 0.4224105137759983 0.604212096066851 0.6756456917778723 0 0 0 0 0 0
-0.8799281120300293 -0.8470516204833984 -0.1858803629875183 0.34132366378503465 0.6401205994278406 -0.6882904726410953 0.4904371754832689 0.5034006535942948 0.7113783514170433 0 0 0 0 0 0
-0.4599428176879883 -0.65020751953125 0.10361955314874649 -0.1864015965361273 0.6867932939134704 -0.7025449567424621 0.48889351194318886 0.6850977587555911 0.5400224022463521 0 0 0 0 0 0
0.0020246505737304688 -0.5624885559082031 0.12481578439474106 -0.45613615618517545 0.8596176048326213 -0.23021159936554172 0.7483815674799903 0.5105118995890073 0.42344141251679224 0 0 0 0 0 0
0.41902828216552734 -0.2898855209350586 0.0035119829699397087 -0.7269649234033322 0.6193117157905185 0.2966057970198684 0.6793756339752997 0.5858685291134702 0.441822152630534 0 0 0 0 0 0
0.6792001724243164 0.17283248901367188 -0.07000423222780228 -0.6045209802248269 0.1802468133122352 0.7759287794371327 0.6862797956988078 0.6123956263819168 0.3924176841120982 0 0 0 0 0 0
0.8004484176635742 0.6193122863769531 0.10047736018896103 -0.3614937651313902 -0.24092431785922253 0.9007095707469748 0.5119132349256932 0.7561237127734284 0.4077030425317405 0 0 0 0 0 0
0.7727231979370117 1.078165054321289 0.35777297616004944 0.1868939232127155 -0.7055186592686974 0.6836037469834841 0.6047621286718327 0.6310057956890102 0.4858955170931226 0 0 0 0 0 0
0.8144397735595703 1.4058408737182617 0.7343586087226868 0.5821499781202586 -0.7804128253630179 0.22816052459506309 0.5672315417304056 0.5908551043173207 0.5737060429944202 0 0 0 0 0 0
0.9538078308105469 1.5177536010742188 1.1829010248184204 0.8378775366975295 -0.41616714991894244 -0.3532225032837299 0.5442494790678468 0.5872780366653013 0.5990801383662513 0 0 0 0 0 0
1.9072747230529785 0.910919189453125 0.8818100094795227 -0.7795042754550844 0.533072606151975 0.3289478395089182 -0.4998459372299042 -0.8458507638734478 0.1862539242256749 0 0 0 0 0 0
1.5046749114990234 0.4736747741699219 1.101129412651062 -0.6011983624496179 0.7685529530956836 -0.218830727448871 -0.7678109000304119 -0.6314557606251128 -0.10830532843701296 0 0 0 0 0 0
0.9473915100097656 0.24725055694580078 1.185907244682312 -0.10342238353096125 0.7215713072895995 -0.6845718801420003 -0.8076948594066967 -0.46258949743449673 -0.36556801138953104 0 0 0 0 0 0
0.3447113037109375 0.33030128479003906 1.1186178922653198 0.31228523162661165 0.3497431516010028 -0.8832653406627656 -0.8311014672360133 -0.3497834095164246 -0.43234467451931324 0 0 0 0 0 0
-0.0699462890625 0.426177978515625 0.8557408452033997 0.5872703123112946 -0.3071403777751217 -0.7488513661721865 -0.790177509961356 -0.4179547789793201 -0.4482558482380562 0 0 0 0 0 0
-0.3800206184387207 0.4931316375732422 0.4423859715461731 0.6462104652487596 -0.6800932983562942 -0.3462443358870122 -0.6652659904219492 -0.279695108440186 -0.6922368151886575 0 0 0 0 0 0
-0.5896782875061035 0.4494791030883789 -0.02680795267224312 0.4770689730720401 -0.8781540474356709 0.035364726838169984 -0.5807981932883889 -0.3452156634357041 -0.7372242565133014 0 0 0 0 0 0
-0.6969203948974609 0.2596244812011719 -0.6138784289360046 0.2896548792672992 -0.7882098397472208 0.5429781758434742 -0.284342304958889 -0.6125492449564096 -0.7375180513817939 0 0 0 0 0 0
-0.47707128524780273 -0.043091773986816406 -0.9352776408195496 -0.2621985854734143 -0.7025650842158083 0.6615543849273275 0.016120596801631058 -0.6886318502408093 -0.7249319286613599 0 0 0 0 0 0
-0.3518500328063965 -0.5421085357666016 -1.198477864265442 -0.7871425255814601 -0.297658447383303 0.5401907932597535 -0.0825639006468875 -0.8171011523751505 -0.5705514079354922 0 0 0 0 0 0
-0.24994373321533203 -0.9442558288574219 -1.297476887702942 -0.935846523161172 -0.005471706133164059 0.35236535800095103 -0.10617946740797576 -0.9490373517991859 -0.2967389856270101 0 0 0 0 0 0
-0.3263239860534668 -1.4977474212646484 -1.2045332193374634 -0.938652470359482 0.26782504576551924 -0.21725856657158316 -0.19620096519625824 -0.9328170937154241 -0.302253951055013 0 0 0 0 0 0`;


// --- Type Definitions ---
interface Nucleotide {
  id: number;
  strandId: number;
  base: string;
  neighbor3: number;
  neighbor5: number;
}

interface Frame {
  time: number;
  positions: THREE.Vector3[];
  a1Vectors: THREE.Vector3[];
}

// --- Parser Functions ---
const parseTopology = (data: string): { nucleotides: Nucleotide[], numStrands: number } => {
  const lines = data.trim().split('\n');
  const header = lines[0].trim().split(' ').map(Number);
  const numNucleotides = header[0];
  const numStrands = header[1];
  
  const nucleotides = lines.slice(1).map((line, index) => {
    const parts = line.trim().split(/\s+/);
    return {
      id: index + 1,
      strandId: parseInt(parts[0], 10),
      base: parts[1],
      neighbor3: parseInt(parts[2], 10),
      neighbor5: parseInt(parts[3], 10),
    };
  });

  return { nucleotides, numStrands };
};

const parseTrajectory = (data: string): Frame[] => {
    // For simplicity, we'll only parse one frame.
    // A full implementation would loop through the file.
    const lines = data.trim().split('\n');
    const numNucleotides = 24; // from topology
    let frameStart = -1;

    for(let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('t =')) {
            frameStart = i;
            break;
        }
    }
    if (frameStart === -1) return [];
    
    const time = parseFloat(lines[frameStart].split('=')[1].trim());
    const positions: THREE.Vector3[] = [];
    const a1Vectors: THREE.Vector3[] = [];

    const dataLines = lines.slice(frameStart + 3, frameStart + 3 + numNucleotides);

    dataLines.forEach(line => {
        const n = line.trim().split(/\s+/).map(Number);
        positions.push(new THREE.Vector3(n[0], n[1], n[2]));
        a1Vectors.push(new THREE.Vector3(n[3], n[4], n[5]));
    });

    // Create a simple animation by interpolating
    const frames: Frame[] = [];
    const numAnimationFrames = 60;
    const initialPositions = positions.map(p => p.clone());
    const finalPositions = positions.map(p => p.clone().add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5))); // Random end point

    for (let i = 0; i < numAnimationFrames; i++) {
        const t = i / (numAnimationFrames - 1); // interpolation factor
        const interpolatedPositions = initialPositions.map((start, idx) => {
            return new THREE.Vector3().lerpVectors(start, finalPositions[idx], t);
        });
        frames.push({
            time: i,
            positions: interpolatedPositions,
            a1Vectors: a1Vectors, // Keep a1 vectors constant for this simple animation
        });
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
  const orientation = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);
  orientation.lookAt(start, end, up);
  orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

  return (
    <Cylinder args={[radius, radius, length, 8]} position={position} rotation-from-matrix={orientation}>
      <meshStandardMaterial color={color} />
    </Cylinder>
  );
};

const DNA: React.FC<{ frame: Frame, topology: { nucleotides: Nucleotide[], numStrands: number } }> = ({ frame, topology }) => {
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
        if (n.neighbor5 !== -1) {
          const start = frame.positions[i];
          const end = frame.positions[n.neighbor5 - 1];
          return <CylinderBond key={`bb-${i}`} start={start} end={end} color="white" radius={0.1} />;
        }
        return null;
      })}
      
      {/* Render Hydrogen Bonds */}
      {nucleotides.map((n, i) => {
        const start = frame.positions[i];
        const end = start.clone().add(frame.a1Vectors[i].clone().multiplyScalar(0.5));
         return <CylinderBond key={`hb-${i}`} start={start} end={end} color="cyan" radius={0.05} />;
      })}
    </group>
  );
};


// --- Main Viewer Component ---
export default function TrajectoryViewer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  const topology = useMemo(() => parseTopology(topologyData), []);
  const frames = useMemo(() => parseTrajectory(trajectoryData), []);

  const frameInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying) {
      frameInterval.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % frames.length);
      }, 1000 / 30); // 30 fps
    } else {
      clearInterval(frameInterval.current);
    }
    return () => clearInterval(frameInterval.current);
  }, [isPlaying, frames.length]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
      setIsPlaying(false);
      setCurrentFrameIndex(0);
  };
  const handleSliderChange = (value: number[]) => {
      setIsPlaying(false);
      setCurrentFrameIndex(value[0]);
  }

  if (frames.length === 0) {
    return <div>Error parsing trajectory data.</div>;
  }
  
  return (
    <div className="w-full h-full relative">
       <div className="absolute top-2 left-2 z-10 flex gap-2">
        <Button onClick={handlePlayPause} size="sm" variant="secondary">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>
        <Button onClick={handleReset} size="sm" variant="secondary">
          <RotateCcw className="h-4 w-4" />
          <span className="ml-2">Reset</span>
        </Button>
      </div>
      <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
        <Suspense fallback={
            <Text color="white" anchorX="center" anchorY="middle">
                Loading 3D Scene...
            </Text>
        }>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <DNA frame={frames[currentFrameIndex]} topology={topology} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Suspense>
      </Canvas>
       <div className="absolute bottom-2 left-4 right-4 z-10 flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground w-24">
                Frame: {currentFrameIndex}
            </span>
            <Slider
                min={0}
                max={frames.length - 1}
                step={1}
                value={[currentFrameIndex]}
                onValueChange={handleSliderChange}
            />
        </div>
    </div>
  );
}
