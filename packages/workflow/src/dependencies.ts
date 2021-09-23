/**
 * Type definitions for the Workflow end of the external dependencies mechanism.
 *
 * External dependencies are functions injected into a Workflow isolate from the main Node.js isolate.
 * They are an advanced feature and should be used with care.
 *
 * @see proposal at https://github.com/temporalio/proposals/blob/master/node/logging-and-metrics-for-user-code.md
 *
 * @module
 */

/**
 * Any function signature can be used for dependency functions.
 *
 * Depending on the implementation's and transfer options,
 * when calling a dependency function, arguments and return value are transferred between the Workflow isolate and the Node.js isolate.
 * - `SYNC*` {@link ApplyMode} variants allow configuring how those are transferred between isolates
 * - `ASYNC*` {@link ApplyMode} variants always copy the arguments and return value
 */
export type ExternalDependencyFunction = (...args: any[]) => any;
/** A mapping of name to function, defines a single external dependency (e.g. logger) */
export type ExternalDependency = Record<string, ExternalDependencyFunction>;
/**
 * Workflow dependencies are a mapping of name to {@link ExternalDependency}
 */
export type ExternalDependencies = Record<string, ExternalDependency>;
