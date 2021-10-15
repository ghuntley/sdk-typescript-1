export interface ActivationCompletion {
  type: 'activation-completion';
  completion: Uint8Array;
}

export type WorkerThreadOutput = ActivationCompletion | undefined;

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
