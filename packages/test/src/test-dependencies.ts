/* eslint @typescript-eslint/no-non-null-assertion: 0 */
import test from 'ava';
import { WorkflowInfo } from '@temporalio/workflow';
import { WorkflowClient } from '@temporalio/client';
import { Worker, DefaultLogger, Core, InjectedDependencies } from '@temporalio/worker';
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
    const dependencies: InjectedDependencies<workflows.TestDependencies> = {
      success: {
        runAsync: {
          async fn(info, counter) {
            recordedCalls.push({ info, counter, fn: 'success.runAsync' });
          },
        },
        runSync: {
          fn(info, counter) {
            recordedCalls.push({ info, counter, fn: 'success.runSync' });
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
    };

    const worker = await Worker.create({
      ...defaultOptions,
      taskQueue,
      dependencies,
    });
    const p = worker.run();
    const conn = new WorkflowClient();
    const wf = conn.createWorkflowHandle(workflows.dependenciesWorkflow, { taskQueue });
    const runId = await wf.start();
    await wf.result();
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
      { info, fn: 'success.runSync', counter: 0 },
      { info, fn: 'success.runAsync', counter: 1 },
      { info, fn: 'error.throwSync', counter: 2 },
      { info, fn: 'error.throwAsync', counter: 3 },
    ]);
  });

  test.todo('Dependency functions are called during replay if callDuringReplay is set');
}
