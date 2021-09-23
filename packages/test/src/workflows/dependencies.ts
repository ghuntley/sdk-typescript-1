import { dependencies, ExternalDependencies } from '@temporalio/workflow';

export interface TestDependencies extends ExternalDependencies {
  withReturnValue: {
    runAsync(counter: number): Promise<number>;
    runSync(counter: number): number;
  };
  withNoReturnValue: {
    runAsync(counter: number): Promise<void>;
    runSync(counter: number): void;
  };
  error: {
    throwAsync(counter: number): Promise<never>;
    throwSync(counter: number): number;
  };
}

const { withReturnValue, withNoReturnValue, error } = dependencies<TestDependencies>();

function convertErrorToIntResult(fn: (x: number) => any, x: number): number {
  try {
    return fn(x);
  } catch (err: any) {
    return parseInt(err.message);
  }
}

export async function dependenciesWorkflow(): Promise<number> {
  let i = 0;
  withNoReturnValue.runSync(i++);
  await withNoReturnValue.runAsync(i++);

  i = withReturnValue.runSync(i);
  i = await withReturnValue.runAsync(i);
  i = await error.throwAsync(i).catch((err) => parseInt(err.message));
  i = convertErrorToIntResult(error.throwSync, i);
  return i;
}
