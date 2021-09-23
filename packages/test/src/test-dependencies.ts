/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import test from 'ava';
import { WorkflowInfo } from '@temporalio/workflow';
import { WorkflowClient } from '@temporalio/client';
import { Worker, DefaultLogger, Core } from '@temporalio/worker';
import { defaultOptions } from './mock-native-worker';
import { RUN_INTEGRATION_TESTS } from './helpers';
import * as workflows from './workflows';

interface RecordedCall {
  info: WorkflowInfo;
  counter: number;
  fn: string;
}

if (RUN_INTEGRATION_TESTS) {
  const recordedLogs: any[] = [];
  test.before(async (_) => {
    await Core.install({
      logger: new DefaultLogger('DEBUG', ({ level, message, meta }) => {
        if (message === 'External dependency function threw an error') recordedLogs.push({ level, message, meta });
      }),
    });
  });

  test('Worker injects external dependencies', async (t) => {
    const recordedCalls: RecordedCall[] = [];
    const taskQueue = 'test-dependencies';

    const worker = await Worker.create<{ dependencies: workflows.TestDependencies }>({
      ...defaultOptions,
      taskQueue,
      dependencies: {
        withNoReturnValue: {
          runAsync: {
            async fn(info, counter) {
              recordedCalls.push({ info, counter, fn: 'withNoReturnValue.runAsync' });
            },
          },
          runSync: {
            fn(info, counter) {
              recordedCalls.push({ info, counter, fn: 'withNoReturnValue.runSync' });
            },
          },
        },
        withReturnValue: {
          runSync: {
            fn(info, counter) {
              recordedCalls.push({ info, counter, fn: 'withReturnValue.runSync' });
              return counter + 1;
            },
          },
          runAsync: {
            async fn(info, counter) {
              recordedCalls.push({ info, counter, fn: 'withReturnValue.runAsync' });
              return counter + 1;
            },
          },
        },
        error: {
          throwAsync: {
            async fn(info, counter) {
              recordedCalls.push({ info, counter, fn: 'error.throwAsync' });
              throw new Error(`${counter + 1}`);
            },
          },
          throwSync: {
            fn(info, counter) {
              recordedCalls.push({ info, counter, fn: 'error.throwSync' });
              throw new Error(`${counter + 1}`);
            },
          },
        },
      },
    });
    const p = worker.run();
    const conn = new WorkflowClient();
    const wf = conn.createWorkflowHandle(workflows.dependenciesWorkflow, { taskQueue });
    const runId = await wf.start();
    const result = await wf.result();
    worker.shutdown();
    await p;
    const info: WorkflowInfo = {
      namespace: 'default',
      taskQueue,
      workflowId: wf.workflowId,
      runId,
      workflowType: 'dependenciesWorkflow',
      isReplaying: false,
    };

    t.deepEqual(recordedCalls, [
      { info, fn: 'withNoReturnValue.runSync', counter: 0 },
      { info, fn: 'withNoReturnValue.runAsync', counter: 1 },
      { info, fn: 'withReturnValue.runSync', counter: 2 },
      { info, fn: 'withReturnValue.runAsync', counter: 3 },
      { info, fn: 'error.throwAsync', counter: 4 },
      { info, fn: 'error.throwSync', counter: 5 },
    ]);
    t.is(result, 6);
  });

  test.todo('Dependency functions are called during replay if callDuringReplay is set');
}
