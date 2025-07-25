import type { NavItem } from '@/components/dashboard/SidebarNav';
import { PlaySquare, ListChecks, Server, FlaskConical, FileUp, Info, Orbit } from 'lucide-react';

export const API_BASE_URL_INTERNAL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
export const API_BASE_URL_PUBLIC = process.env.NEXT_PUBLIC_API_BASE_URL_PUBLIC || 'http://localhost:8888';

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
  {
    href: '/external-analysis',
    icon: FileUp,
    label: 'External Analysis',
  },
  {
    href: '/about',
    icon: Info,
    label: 'About Us',
  }
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
  hBondRestraint: false,
  T: '20C',
  saltConc: 1.0,
  verletSkin: 0.4,
  override: '',
  use_average_seq: false,
  // New advanced/conditional params
  max_backbone_force: 0.0,
  seed: -1,
  thermostat: 'john',
  delta_translation: 0.02,
  delta_rotation: 0.04,
  mismatch_repulsion: false,
  mismatch_repulsion_strength: 1.0,
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
];

export const THERMOSTAT_OPTIONS = ['john', 'no', 'refresh', 'brownian', 'langevin', 'bussi', 'DPD'];


type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success";

export const JOB_STATUS_CODES: { [key: number]: { type: string; description: string; variant: BadgeVariant } } = {
  0: { type: 'Done', description: 'Task completed successfully', variant: 'success' },
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

type AnalysisParam = {
    name: string; // The user-facing name for the form, e.g., 'cutoff'
    backendName: 'str1' | 'str2' | 'int1' | 'double1' | 'bool1' | 'inlist';
    type: 'text' | 'number' | 'boolean' | 'textarea';
    label: string;
    description?: string;
    defaultValue?: any;
}

type AnalysisFile = {
    name: 'configuration' | 'topology' | 'otherFile1' | 'otherFile2';
    label: string;
    description: string;
    required: boolean;
}

export type AnalysisOption = {
  value: number;
  label: string;
  description: string;
  command: string;
  files: AnalysisFile[];
  params: AnalysisParam[];
  outputFile?: string; // The primary output file name, if predictable
}


export const ANALYSIS_OPTIONS: AnalysisOption[] = [
    {
        value: 0, command: "align", label: "Align", description: "Aligns each frame in a trajectory to the first frame.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }, { name: "otherFile1", label: "Reference Configuration", description: "The reference frame to align to.", required: false }],
        params: [{ name: "index", backendName: "str1", type: "textarea", label: "Index", description: "Index of particles to use for alignment." }],
        outputFile: "aligned.dat",
    },
    {
        value: 1, command: "anm_parameterize", label: "ANM Parameterize", description: "Compute par file for DNA-ANM model.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", description: "Input configuration.", required: true }],
        params: [
            { name: "cutoff", backendName: "double1", type: "number", label: "Cutoff", description: "Cutoff distance for the model." },
            { name: "model", backendName: "str1", type: "text", label: "Model", description: "e.g., 'calpha'." }
        ],
        outputFile: "anm.par",
    },
    {
        value: 2, command: "backbone_flexibility", label: "Backbone Flexibility", description: "Computes the deviations in the backbone torsion angles.",
        files: [{ name: "topology", label: "Topology File", description: "The system topology.", required: true }, { name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }],
        params: [{ name: "index", backendName: "str1", type: "textarea", label: "Index", description: "Index of nucleotides to analyze." }],
        outputFile: "backbone_flex.dat",
    },
    {
        value: 3, command: "bond_analysis", label: "Bond Analysis", description: "Compare the bonds found at each trajectory with the intended design.",
        files: [
            { name: "topology", label: "Topology File", description: "The system topology.", required: true }, 
            { name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true },
            { name: "otherFile1", label: "Pairs File", description: "A file containing base pairs.", required: false }
        ],
        params: [{ name: "plot", backendName: "str1", type: "text", label: "Plot Filename", description: "Optional filename for a plot output." }],
        outputFile: "bonds.dat",
    },
    {
        value: 4, command: "centroid", label: "Centroid", description: "Find the configuration in a trajectory closest to a provided reference configuration.",
        files: [
            { name: "topology", label: "Topology File", description: "The system topology.", required: true }, 
            { name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }
        ],
        params: [{ name: "index", backendName: "str1", type: "textarea", label: "Index", description: "Index of particles for calculation." }],
        outputFile: "centroid.dat",
    },
    {
        value: 5, command: "clustering", label: "Clustering", description: "Calculates clusters based on provided order parameters.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }],
        params: [
            { name: "clusters", backendName: "int1", type: "number", label: "Number of Clusters", description: "The number of clusters to find (k)." },
            { name: "metric", backendName: "str1", type: "text", label: "Metric", description: "Metric to use for clustering (e.g., 'rmsd')." }
        ],
        outputFile: "clusters.dat",
    },
    {
        value: 7, command: "contact_map", label: "Contact Map", description: "Calculate and display the contact map for a structure.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }],
        params: [
            { name: "cutoff", backendName: "double1", type: "number", label: "Cutoff" },
            { name: "index", backendName: "str1", type: "textarea", label: "Index" }
        ],
        outputFile: "contact_map.dat",
    },
    {
        value: 8, command: "decimate", label: "Decimate", description: "Creates a smaller trajectory only including start/stop/stride frames from the input.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }],
        params: [{ name: "factor", backendName: "int1", type: "number", label: "Factor", description: "Decimation factor." }],
        outputFile: "decimated.dat",
    },
    {
        value: 9, command: "deviations", label: "Deviations", description: "Compute the RMSD of each nucleotide from the mean structure produced by compute_mean.py.",
        files: [
            { name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true },
            { name: "otherFile1", label: "Reference File", description: "Mean structure reference file.", required: false }
        ],
        params: [{ name: "index", backendName: "str1", type: "textarea", label: "Index" }],
        outputFile: "rmsf.dat",
    },
    {
        value: 10, command: "distance", label: "Distance", description: "Finds the ensemble of distances between any two particles in the system.",
        files: [
            { name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true },
            { name: "otherFile1", label: "Reference File", description: "Reference configuration file.", required: false }
        ],
        params: [
            { name: "index1", backendName: "str1", type: "textarea", label: "Index 1" },
            { name: "index2", backendName: "str2", type: "textarea", label: "Index 2" }
        ],
        outputFile: "distances.dat",
    },
    {
        value: 11, command: "db_to_force", label: "Dot-bracket to force", description: "Create an external forces file enforcing the current base-pairing arrangement.",
        files: [{ name: "otherFile1", label: "Dot-bracket File", description: "Input dot-bracket file.", required: true }],
        params: [{ name: "sequence", backendName: "str1", type: "textarea", label: "Sequence" }],
        outputFile: "forces.dat",
    },
    {
        value: 12, command: "duplex_angle_plotter", label: "Duplex Angle Plotter", description: "Finds the ensemble of angles between pairs of duplexes.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }],
        params: [{ name: "duplex_list", backendName: "str1", type: "text", label: "Duplex List", description: "e.g., '1-10,11-20'" }],
        outputFile: "duplex_angles.dat",
    },
    {
        value: 13, command: "duplex_finder", label: "Duplex Finder", description: "Fit vectors to every duplex in the structure.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "configuration", label: "Trajectory/Configuration File", description: "The main trajectory file.", required: true }],
        params: [{ name: "min_length", backendName: "int1", type: "number", label: "Min Length" }],
        outputFile: "duplex_vectors.dat",
    },
    { value: 14, command: "file_info", label: "File Info", description: "Prints metadata about trajectories.", files: [{ name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }], params: [], outputFile: "info.txt" },
    {
        value: 15, command: "forces2db", label: "Forces to Dot-bracket", description: "Convert a force file to dot-bracket notation.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "otherFile1", label: "Forces File", required: true, description: "" }],
        params: [],
        outputFile: "forces.db",
    },
    {
        value: 16, command: "forces2pairs", label: "Forces to Pairs", description: "Convert an external force file to a list of particle pairs.",
        files: [{ name: "otherFile1", label: "Forces File", required: true, description: "" }],
        params: [{ name: "threshold", backendName: "double1", type: "number", label: "Threshold" }],
        outputFile: "pairs.dat",
    },
    {
        value: 17, command: "generate_force", label: "Generate Force", description: "Create an external forces file enforcing the current base-pairing arrangement.",
        files: [
            { name: "topology", label: "Topology File", required: true, description: "" }, 
            { name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" },
            { name: "otherFile1", label: "Pairs File", required: false, description: "Optional pairs file." }
        ],
        params: [{ name: "stiff", backendName: "double1", type: "number", label: "Stiffness" }],
        outputFile: "forces.dat",
    },
    {
        value: 18, command: "mean", label: "Mean", description: "Computes the mean structure of a trajectory file.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [
            { name: "deviations", backendName: "bool1", type: "boolean", label: "Calculate Deviations" },
            { name: "index", backendName: "str1", type: "textarea", label: "Index" },
            { name: "align", backendName: "int1", type: "number", label: "Align" }
        ],
        outputFile: "mean.dat",
    },
    {
        value: 19, command: "minify", label: "Minify", description: "Compress given configuration.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [{ name: "max_iter", backendName: "int1", type: "number", label: "Max Iterations" }],
        outputFile: "min.dat",
    },
    {
        value: 20, command: "multidimensional_scaling_mean", label: "MDS Mean", description: "Calculate molecular contacts, and assembles an average set of contacts based on MDS.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [{ name: "dimensions", backendName: "int1", type: "number", label: "Dimensions" }],
        outputFile: "mds_mean.dat",
    },
    {
        value: 21, command: "output_bonds", label: "Output Bonds", description: "List all the interactions between nucleotides.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [{ name: "binary", backendName: "bool1", type: "boolean", label: "Binary Output" }],
        outputFile: "bonds.dat",
    },
    {
        value: 22, command: "oxDNA_PDB", label: "oxDNA -> PDB", description: "Convert oxDNA files to PDB.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [{ name: "pdb_type", backendName: "str1", type: "text", label: "PDB Type", description: "e.g., 'all-atom'" }],
        outputFile: "output.pdb",
    },
    {
        value: 23, command: "pairs2db", label: "Pairs to Dot-bracket", description: "Convert a pair file to dot-bracket notation.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "otherFile1", label: "Pairs File", required: true, description: "" }],
        params: [],
        outputFile: "output.db",
    },
    {
        value: 24, command: "PDB_oxDNA", label: "PDB -> oxDNA", description: "Convert a PDB file to oxDNA.",
        files: [{ name: "otherFile1", label: "PDB File", required: true, description: "Input .pdb file." }],
        params: [{ name: "seq_dependent", backendName: "bool1", type: "boolean", label: "Sequence Dependent" }],
        outputFile: "output.top",
    },
    {
        value: 25, command: "persistence_length", label: "Persistence Length", description: "Calculates persistence length and contour length of a paired sequence of DNA.",
        files: [{ name: "topology", label: "Topology File", required: true, description: "" }, { name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [{ name: "segment_length", backendName: "int1", type: "number", label: "Segment Length" }],
        outputFile: "persistence.dat",
    },
    // {
    //     value: 26, command: "plot_energy", label: "Plot Energy", description: "Plot oxDNA energy files.",
    //     files: [{ name: "otherFile1", label: "Energy File", required: true, description: "Input energy.dat file." }],
    //     params: [{ name: "column", backendName: "int1", type: "number", label: "Column" }],
    //     outputFile: "energy.png",
    // },
    {
        value: 27, command: "pca", label: "PCA", description: "Calculates a principal component analysis of nucleotide deviations over a trajectory.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [
            { name: "components", backendName: "int1", type: "number", label: "Components" },
            { name: "align", backendName: "bool1", type: "boolean", label: "Align" }
        ],
        outputFile: "pca.dat",
    },
    {
        value: 28, command: "subset_trajectory", label: "Subset Trajectory", description: "Extracts parts of a structure into separate trajectories.",
        files: [{ name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" }],
        params: [{ name: "index", backendName: "str1", type: "textarea", label: "Index" }],
        outputFile: "subset.dat",
    },
    {
        value: 29, command: "superimpose", label: "Superimpose", description: "Superimposes one or more structures sharing a topology to a reference structure.",
        files: [
            { name: "configuration", label: "Trajectory/Configuration File", required: true, description: "" },
            { name: "otherFile1", label: "Reference File", required: false, description: "" }
        ],
        params: [{ name: "index", backendName: "str1", type: "textarea", label: "Index" }],
        outputFile: "superimposed.dat",
    },
].filter(option => option.value !== 26);
