
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
