/*
 * @Author: Rainy
 * @Date: 2020-09-26 10:19:17
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-30 15:09:39
 */

import {
  createSchedulerFromOptions,
  EMPTY_OBJECT,
  getNextId,
  IReactionDisposer,
  IReactionPublic,
  Reaction
} from '../internal';

export interface IAutorunOptions {
  name?: string;
  delay?: number;
  onError?: (error: any) => void;
  scheduler?: (callback: () => void) => any;
}

/**
 * @description: autorun
 * @param {IReactionPublic} view reaction
 * @return {IAutorunOptions?} opts 配置参数
 */
export function autorun(
  view: (r: IReactionPublic) => any,
  opts: IAutorunOptions = EMPTY_OBJECT
): IReactionDisposer {
  const name = opts?.name || (view as any).name || 'Autorun@' + getNextId();
  const runSync = !opts.scheduler && !opts.delay;
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
    const scheduler = createSchedulerFromOptions(opts);
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

  function reactionRunner() {
    view(reaction);
  }

  reaction.schedule();
  return reaction.getSchedule();
}
