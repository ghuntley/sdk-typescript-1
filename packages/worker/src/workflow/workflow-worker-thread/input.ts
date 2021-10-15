import { WorkflowInfo } from '@temporalio/workflow';

export interface Init {
  type: 'init';
  isolateExecutionTimeoutMs: number;
  code: string;
}

export interface Destroy {
  type: 'destroy';
}

export interface CreateWorkflow {
  type: 'create-workflow';
  info: WorkflowInfo;
  interceptorModules: string[];
  randomnessSeed: number[];
  now: number;
}

export interface ActivateWorkflow {
  type: 'activate-workflow';
  runId: string;
  activation: Uint8Array;
}

export interface DisposeWorkflow {
  type: 'dispose-workflow';
  runId: string;
}

export type WorkerThreadInput = Init | Destroy | CreateWorkflow | ActivateWorkflow | DisposeWorkflow;

export interface WorkerThreadRequest {
  requestId: BigInt;
  input: WorkerThreadInput;
}
