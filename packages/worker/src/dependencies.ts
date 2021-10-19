/**
 * Type definitions for the Worker end of the external dependencies mechanism.
 *
 * External dependencies are functions injected into a Workflow isolate from the main Node.js isolate.
 * They are an advanced feature and should be used with care.
 *
 * @see proposal at https://github.com/temporalio/proposals/blob/master/node/logging-and-metrics-for-user-code.md
 *
 * @module
 */

import {
  ExternalDependencies,
  ExternalDependency,
  ExternalDependencyFunction,
  WorkflowInfo,
} from '@temporalio/workflow';

/**
 * Takes a {@link ExternalDependencyFunction} and turns it into a type safe specification consisting of the function implementation type and call configuration.
 *
 * `InjectedDependencyFunction` consists of these attributes:
 *
 * - `fn` - type of the implementation function for dependency `F`
 * - `callDuringReplay` - whether or not `fn` will be called during Workflow replay - defaults to `false`
 */
export interface InjectedDependencyFunction<F extends ExternalDependencyFunction> {
  fn(info: WorkflowInfo, ...args: Parameters<F>): void | Promise<void>;
  callDuringReplay?: boolean;
}

/**
 * Turns a {@link ExternalDependency} from a mapping of name to function to a mapping of name to {@link InjectedDependencyFunction}
 */
export type InjectedDependency<T extends ExternalDependency> = {
  [P in keyof T]: InjectedDependencyFunction<T[P]>;
};

/**
 * Turns a {@link ExternalDependencies} interface from a mapping of name to {@link ExternalDependency} to a mapping of name to {@link InjectedDependency}.
 *
 * Used for type checking Workflow external dependency injection.
 */
export type InjectedDependencies<T extends ExternalDependencies> = {
  [P in keyof T]: InjectedDependency<T[P]>;
};
