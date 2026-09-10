export interface HardwarePort {
  name: string;
  type: string;
  width: number;
  dir: 'input' | 'output';
  description: string;
}

export interface VerificationScenario {
  id: number;
  name: string;
  title: string;
  focus: string;
  expectedAssertions: string[];
  status?: 'verified' | 'compiling' | 'pending' | 'failed';
  driveStatus?: 'uploaded' | 'pending' | 'local_only' | 'error';
  driveFileId?: string;
  codeSnippet?: string;
}

export interface FIFOSimulatorState {
  clk: boolean;
  rst_n: boolean;
  wr_en: boolean;
  rd_en: boolean;
  data_in: number;
  data_out: number;
  full: boolean;
  empty: boolean;
  overflow: boolean;
  underflow: boolean;
  mem: number[];
  wr_ptr: number;
  rd_ptr: number;
  count: number;
  cycleCount: number;
  history: Array<{
    cycle: number;
    rst_n: boolean;
    wr_en: boolean;
    rd_en: boolean;
    data_in: number;
    data_out: number;
    full: boolean;
    empty: boolean;
    count: number;
    overflow: boolean;
    underflow: boolean;
  }>;
}

export interface PipelineExecutionLog {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  stage: 'PROMPT' | 'SANITY' | 'COMPILE' | 'DRIVE' | 'REPORT';
  message: string;
}
