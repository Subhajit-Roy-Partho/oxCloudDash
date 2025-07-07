
import type { NavItem } from '@/components/dashboard/SidebarNav';
import { PlaySquare, ListChecks, Server, FlaskConical } from 'lucide-react';

export const API_BASE_URL_INTERNAL = '/api/internal'; // Updated to use the proxy
export const API_BASE_URL_PUBLIC = process.env.NEXT_PUBLIC_API_BASE_URL_PUBLIC || 'http://localhost:8800';

// This is the placeholder token from the C++ backend for download
export const DOWNLOAD_AUTH_TOKEN = 'your_auth_token_here';

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/submit-simulation',
    icon: PlaySquare,
    label: 'Submit Simulation',
  },
  {
    href: '/job-status',
    icon: ListChecks,
    label: 'Job Status',
  },
  {
    href: '/server-status',
    icon: Server,
    label: 'Server Status',
  },
  {
    href: '/enhanced-sampling',
    icon: FlaskConical,
    label: 'Enhanced Sampling',
  },
];

export const SIMULATION_PARAMETERS_DEFAULTS = {
  jobName: '',
  topology: undefined,
  configuration: undefined,
  forceFile: undefined,
  priority: -1,
  maxTime: -1, // in seconds or some unit backend expects
  simulationType: 'MD' as 'MD' | 'MC',
  gpu: false,
  steps: 10000000,
  confInterval: 100000,
  dt: 0.003,
  interactionType: 0, // Default to DNA2
  hBondRestraint: true,
  step1: 0.0,
  step2: 0.0,
  step3: 0.0,
  T: '20C',
  saltConc: 1.0,
  verletSkin: 0.4,
  override: '',
};

export const ENHANCED_SAMPLING_DEFAULTS = {
  jobName: '',
  samplingType: 'Umbrella' as 'Umbrella' | 'ForwardFlux',
  topology: undefined,
  configuration: undefined,
  testPreEq: false,
  nucleotideIndexes0: '10,11,12,16, 9',
  nucleotideIndexes1: '14, 21, 30',
  xmin: 0.12,
  xmax: 25.0,
  steps: 1000000,
  smallSystem: false,
  T: '37C',
  saltConc: 1.0,
  nWindows: 20,
  stiff: 1.0,
  proteinFile: undefined,
  sequenceDependent: true,
  pullingSteps: 10000,
  eqSteps: 10000000,
  meltingTemperature: false,
  forceFile: undefined,
};

export const INTERACTION_TYPE_OPTIONS = [
  { label: 'DNA2', value: 0 },
  { label: 'RNA2', value: 1 },
  { label: 'Lorenzo Patchy', value: 2 },
  { label: 'Romano Patchy', value: 3 },
  { label: 'My Patchy', value: 4 },
  { label: 'PHB', value: 5 },
  { label: 'PSP', value: 6 },
  { label: 'Umbrella Sampling', value: 7 },
  { label: 'Forward Flux', value: 8 },
];

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const JOB_STATUS_CODES: { [key: number]: { type: string; description: string; variant: BadgeVariant } } = {
  0: { type: 'Ok', description: 'Task completed successfully', variant: 'secondary' },
  10: { type: 'Running', description: 'Job is currently running', variant: 'default' },
  11: { type: 'Reserved', description: 'Reserved for special purpose like docker jobs, etc', variant: 'default' },
  100: { type: 'Pending', description: 'Pending due to normal reasons or resources are full', variant: 'outline' },
  101: { type: 'Pending Trig', description: 'This task will be started after completion of a previous job', variant: 'outline' },
  102: { type: 'Pending Next', description: 'Task completed but has not be registered in the system', variant: 'outline' },
  103: { type: 'Pending Resume', description: 'Queue for the resume job when resources are free', variant: 'outline' },
  110: { type: 'Pending Full', description: 'Job needs to allocate a full resource', variant: 'outline' },
  202: { type: 'Stopped', description: 'Stopped prematurely by user or system', variant: 'secondary' },
  203: { type: 'Deleted', description: 'Job does not exist in storage', variant: 'secondary' },
  600: { type: 'DB Mismatch', description: 'Database is not consistent', variant: 'destructive' },
  601: { type: 'DB Mismatch', description: 'Extra pending entry in the database', variant: 'destructive' },
  501: { type: 'Error', description: 'Feature requested doesn\'t exist', variant: 'destructive' },
  502: { type: 'Error', description: 'Error in writing files', variant: 'destructive' },
  503: { type: 'Error', description: 'Main program like oxDNA could not be executed', variant: 'destructive' },
  505: { type: 'Error', description: 'Job stopped abruptly before completion, check log file', variant: 'destructive' },
  506: { type: 'Error', description: 'Previous job has an error status (active > 199)', variant: 'destructive' },
};
