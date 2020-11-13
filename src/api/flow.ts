/*
 * @Author: Rainy
 * @Date: 2020-10-06 19:53:51
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-12 20:53:31
 */

import { resolveSoa } from 'dns';
import {
  action,
  Annotation,
  isFunction,
  isUniqueStringLike,
  noop,
  storeDecorator
} from '../internal';

export const FLOW = 'flow';

let generatorId = 0;

export function FlowCancellationError() {
  this.message = 'FLOW_CANCELLED';
}

FlowCancellationError.prototype = Object.create(Error.prototype);

export function isFlowCancellationError(error: Error) {
  return error instanceof FlowCancellationError;
}

export type CancellablePromise<T> = Promise<T> & { cancel(): void };

interface Flow extends Annotation, PropertyDecorator {
  <R, Args extends any[]>(
    generator: (...args: Args) => Generator<any, R, any> | AsyncGenerator<any, R, any>
  ): (...args: Args) => CancellablePromise<R>;
}

export const flow: Flow = Object.assign(
  function flow(arg1, arg2?) {
    if (isUniqueStringLike(arg1)) {
      return storeDecorator(arg1, arg2, 'flow');
    }

    const generator = arg1;
    const name = generator.name || '<unnamed flow>';

    const res = function () {
      const ctx = this;
      const args = arguments;
      const runId = ++generatorId;
      const gen = action(`${name} - runId: ${runId} - init`, generator).apply(ctx, args);
      let rejector: (error: any) => void;
      let pendingPromise: CancellablePromise<any> | undefined = undefined;

      const promise = new Promise((resolve, reject) => {
        let stepId = 0;
        rejector = reject;

        function onFulfilled(res: any) {
          pendingPromise = undefined;
          let ret = null;

          try {
            ret = action(`${name} - runId: ${runId} - yield ${stepId++}`, gen.next).call(gen, res);
          } catch (e) {
            return reject(e);
          }

          next(ret);
        }

        function onRejected(err: any) {
          pendingPromise = undefined;
          let ret = null;

          try {
            ret = action(`${name} - runId: ${runId} - yield ${stepId++}`, gen.throw!).call(
              gen,
              res
            );
          } catch (e) {
            return reject(e);
          }

          next(ret);
        }

        function next(ret: any) {
          if (isFunction(ret?.then)) {
            ret.then(next, reject);
            return;
          }

          if (ret.done) {
            return resolve(ret.value);
          }

          pendingPromise = Promise.resolve(ret.value) as any;

          return pendingPromise!.then(onFulfilled, onRejected);
        }

        onFulfilled(undefined);
      }) as any;

      promise.cancel = action(`${name} - runId: ${runId} - cancel`, function () {
        try {
          if (pendingPromise) {
            cancelPromise(pendingPromise);
          }

          const res = gen.return!(undefined as any);
          const yieldedPromise = Promise.resolve(res.value);
          yieldedPromise.then(noop, noop);
          cancelPromise(pendingPromise);
          rejector(new FlowCancellationError());
        } catch (e) {
          rejector(e);
        }
      });

      return promise;
    };

    res.isMobxFlow = true;

    return res;
  } as any,
  {
    annotationType: 'flow' as const
  }
);

export function cancelPromise(promise) {
  if (isFunction(promise.cancel)) {
    promise.cancel();
  }
}

export function isFlow(fn: any): boolean {
  return fn?.isMobxFlow === true;
}
