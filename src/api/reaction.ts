/*
 * @Author: Rainy
 * @Date: 2020-09-26 10:19:17
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-26 15:09:13
 */

import {
  action,
  EMPTY_OBJECT,
  getNextId,
  IEqualsComparer,
  IReactionDisposer,
  IReactionPublic,
  Lambda,
  Reaction
} from '../internal';
import { IAutorunOptions } from './autorun';

export type IReactionOptions = IAutorunOptions & {
  fireImmediately?: boolean;
  equals?: IEqualsComparer<any>;
};

const run = (f: Lambda) => f();

export function createSchedulerFromOptions(opts: IReactionOptions) {
  return opts.scheduler
    ? opts.scheduler
    : opts.delay
    ? (f: Lambda) => setTimeout(f, opts.delay!)
    : run;
}

export function reaction<T>(
  expression: (r: IReactionPublic) => T,
  effect: (argv: any, prev: any, r: IReactionPublic) => void,
  opts: IReactionOptions = EMPTY_OBJECT
): IReactionDisposer {
  const name = opts?.name || 'Reaction@' + getNextId();
  const effectAction = action(name, opts.onError ? wrapErrorHandler(opts.onError, effect) : effect);
  const runSync = !opts.scheduler && !opts.delay;
  const scheduler = createSchedulerFromOptions(opts);
  let reaction: Reaction;

  if (runSync) {
    reaction = new Reaction(
      name,
      function (this) {
        this.track(reactionRunner);
      },
      opts.onError
    );
  } else {
    reaction = new Reaction(
      name,
      () => {
        let isScheduled = false;

        if (!isScheduled) {
          isScheduled = true;
          scheduler(() => {
            isScheduled = false;
            if (!reaction.isDisposed) {
              reaction.track(reactionRunner);
            }
          });
        }
      },
      opts.onError
    );
  }

  function reactionRunner() {}

  reaction.schedule();
  return reaction.getSchedule();
}

export function wrapErrorHandler(errorHandler, baseFn: Function) {
  return function () {
    try {
      return baseFn.apply(this, arguments);
    } catch (error) {
      errorHandler.call(this, error);
    }
  };
}
