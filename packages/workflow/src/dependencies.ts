/**
 * Type definitions for the Workflow end of the external dependencies mechanism.
 *
 * External dependencies are functions injected into a Workflow isolate from the main Node.js isolate.
 * They are an advanced feature and should be used with care.
 *
 * @experimental
 *
 * @module
 */

/**
 * Any function signature can be used for dependency functions.
 *
 * When calling a dependency function, arguments and return value are transferred between the Workflow isolate and the Node.js isolate using [postMessage](https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist).
 */
export type ExternalDependencyFunction = (...args: any[]) => void;
/** A mapping of name to function, defines a single external dependency (e.g. logger) */
export type ExternalDependency = Record<string, ExternalDependencyFunction>;
/**
 * Workflow dependencies are a mapping of name to {@link ExternalDependency}
 */
export type ExternalDependencies = Record<string, ExternalDependency>;

/**
 * Call information for external dependencies
 */
export interface ExternalCall {
  ifaceName: string;
  fnName: string;
  args: any[];
}
