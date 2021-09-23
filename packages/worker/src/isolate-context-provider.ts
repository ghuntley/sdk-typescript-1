import vm from 'vm';
import { AsyncLocalStorage } from 'async_hooks';
import { IllegalStateError } from '@temporalio/common';
import { WorkflowIsolateBuilder } from './isolate-builder';

/**
 * Implement this interface in order to customize Workflow isolate context creation
 */
export interface IsolateContextProvider {
  /**
   * Get an isolate context for running a Workflow
   */
  getContext(): Promise<vm.Context>;

  /**
   * Destroy and cleanup any resources
   */
  destroy(): void;
}

/**
 * Maintains a pool of v8 isolates, returns Context in a round-robin manner.
 * Pre-compiles the bundled Workflow code from provided {@link WorkflowIsolateBuilder}.
 */
export class SimpleIsolateContextProvider implements IsolateContextProvider {
  nextIsolateIdx = 0;

  protected constructor(public script?: vm.Script) {}

  public async getContext(): Promise<vm.Context> {
    if (this.script === undefined) {
      throw new IllegalStateError('Isolate context provider was destroyed');
    }
    const context = vm.createContext({ AsyncLocalStorage });
    this.script.runInContext(context);
    return context;
  }

  /**
   * Create a new instance, isolates and pre-compiled scripts are generated here
   */
  public static async create(builder: WorkflowIsolateBuilder): Promise<SimpleIsolateContextProvider> {
    const code = await builder.createBundle();
    const script = new vm.Script(code, { filename: 'workflow-isolate' });
    return new this(script);
  }

  public destroy(): void {
    delete this.script;
  }
}
