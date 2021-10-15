import { coresdk } from '@temporalio/proto';
import { WorkflowInfo } from '@temporalio/workflow';

export interface Workflow {
  /**
   * Activate the Workflow.
   * TODO: document
   */
  activate(activation: coresdk.workflow_activation.IWFActivation): Promise<Uint8Array>;

  /**
   * Dispose this instance, and release its resources.
   *
   * Do not use this Workflow instance after this method has been called.
   */
  dispose(): Promise<void>;
}

export interface WorkflowCreator {
  /**
   * Create a Workflow for the Worker to activate
   */
  createWorkflow(
    info: WorkflowInfo,
    interceptorModules: string[],
    randomnessSeed: Long,
    now: number
  ): Promise<Workflow>;

  /**
   * Destroy and cleanup any resources
   */
  destroy(): Promise<void>;
}
