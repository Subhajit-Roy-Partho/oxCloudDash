
export interface User {
  id: string; // Will store the username for mock purposes
  username: string;
  name: string;
  instituteName: string;
  password?: string; // Only for mock localStorage, DO NOT use like this in production
}

export interface SimulationJobPayload {
  userID: string;
  username: string;
  topology: File;
  configuration: File;
  jobName?: string; // Optional, backend can generate
  priority: number;
  maxTime: number;
  simulationType: 'MD' | 'MC';
  gpu: boolean;
  steps: number;
  confInterval: number;
  dt: number;
  interactionType: number;
  hBondRestraint: boolean;
  T: string;
  saltConc: number;
  forceFile?: File; // Optional
  verletSkin: number;
  step1: number;
  step2: number;
  step3: number;
  override?: string;
}

export interface EnhancedSamplingPayload {
  userID: string;
  username: string;
  jobName?: string;
  samplingType: 'Umbrella' | 'ForwardFlux';
  topology: File;
  configuration: File;
  testPreEq: boolean;
  nucleotideIndexes0: string;
  nucleotideIndexes1: string;
  xmin: number;
  xmax: number;
  steps: number; // production steps
  smallSystem: boolean;
  T: string;
  saltConc: number;
  nWindows: number;
  stiff: number;
  protein: boolean;
  proteinFile?: File;
  sequenceDependent: boolean;
  pullingSteps: number;
  eqSteps: number;
  meltingTemperature: boolean;
  forceFile?: File;
}


export interface JobStatus {
  uuid: string;
  jobName: string;
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
  TotalRam: string; // From C++ code this is totalRAM
  RAMavail: string;
  totalCPU: string;
}

// API response types
export interface StartJobResponse extends String {} // UUID

export interface GetJobStatusResponse extends JobStatus {
  userID?: string; // Backend sends this but we might not use it
}

export interface GetJobStatusByUserResponse {
  [key:string]: JobStatus; // Jobs indexed by string numbers
}

export interface GetEnergyResponse {
 [key: string]: { [key: string]: number }; // Represents the 2D array structure
}


export interface GetResourcesResponse {
  [key:string]: {
    CPUavail: string;
    GPUavail: string;
    totalRAM: string;
    RAMavail: string;
    totalCPU: string;
  };
}
