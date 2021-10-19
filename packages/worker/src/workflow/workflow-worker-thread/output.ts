import { ExternalCall } from '@temporalio/workflow';

export interface ActivationCompletion {
  type: 'activation-completion';
  completion: Uint8Array;
}

export interface ExternalCallList {
  type: 'external-calls';
  calls: ExternalCall[];
}

export type WorkerThreadOutput = ActivationCompletion | ExternalCallList | undefined;

export interface WorkerThreadResponse {
  requestId: BigInt;

  result:
    | {
        type: 'ok';
        output?: WorkerThreadOutput;
      }
    | {
        type: 'error';
        /** Error class name */
        name: string;
        message: string;
        stack: string;
      };
}
