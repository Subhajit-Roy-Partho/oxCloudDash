export interface User {
  id: string;
  username: string;
  // Add other user-specific fields if needed
}

export interface SimulationJobPayload {
  userID: string;
  username: string;
  server: string;
  location: string;
  jobId?: string; // Optional, backend can generate
  priority: number;
  maxTime: number;
  simulationType: 'MD' | 'MC'; // Changed from MD: boolean
  gpu: boolean;
  steps: number;
  confInterval: number;
  dt: number;
  interactionType: number;
  hBondRestraint: boolean;
  T: string;
  saltConc: number;
  forceFile: string;
  verletSkin: number;
  step1: number;
  step2: number;
  step3: number;
  override?: string;
}

export interface JobStatus {
  uuid: string;
  active: string | number; // The C++ code implies it could be string from DB
  runningTime: string | number;
  progress: string | number;
  stepsCompleted: string | number;
}

export type EnergyDataPoint = [number, number]; // [stepOrTime, energyValue]
export type EnergyData = EnergyDataPoint[];


export interface ServerResource {
  id: string; // Added for table key
  name: string; // Added for clarity, e.g. "Server 1"
  CPUavail: string;
  GPUavail: string;
  TotalRam: string; // From C++ code this is TotalRam
  RAMavail: string;
}

// API response types
export interface StartJobResponse extends String {} // UUID

export interface GetJobStatusResponse {
  active: string;
  runningTime: string;
  progress: string;
  stepsCompleted: string;
}

export interface GetJobStatusByUserResponse {
  [key: string]: JobStatus; // Jobs indexed by string numbers
}

export interface GetEnergyResponse {
 [key: string]: { [key: string]: number }; // Represents the 2D array structure
}


export interface GetResourcesResponse {
  [key: string]: {
    CPUavail: string;
    GPUavail: string;
    RAMtotal: string; // Matches C++ code
    RAMavail: string;
  };
}
