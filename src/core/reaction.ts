/*
 * @Author: Rainy
 * @Date: 2020-09-24 21:00:12
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-11 11:27:29
 */

import {
  $mobx,
  clearObserving,
  createInstanceofPredicate,
  endBatch,
  getNextId,
  globalState,
  IDerivation,
  IDerivationState,
  IObservable,
  isCaughtException,
  reportError,
  startBatch,
  trace,
  TraceMode,
  trackDerivedFunction
} from '../internal';

export interface IReactionPublic {
  dispose(): void;
  trace(enterBreakPoint?: boolean): void;
}
export interface IReactionDisposer {
  (): void;
  $mobx: Reaction;
}

export class Reaction implements IDerivation, IReactionPublic {
  // 收集依赖的列表
  observing: IObservable[] = [];
  newObserving: IObservable[] = [];
  dependenciesState: IDerivationState = IDerivationState.NOT_TRACKING;
  // autorun 第一次执行时会收集依赖，通过 get 代理更新 unbound，然后再进行 bind 操作
  unboundDepsCount: number = 0;
  runId = 0;
  // 是否在调度
  _isScheduled = false;
  // 是否在处理
  isDisposed = false;
  // 是否在跟踪
  isTrackPending = false;
  // 是否在执行
  isRunning = false;
  mapId: string = `#${getNextId()}`;
  isTracing: TraceMode = TraceMode.NODE;

  constructor(
    public name: string = 'Reaction' + getNextId(),
    // 作出反应的 effect 函数
    public onInvalidate: () => void,
    private errorHandler?: (error: any, derivation: IDerivation) => void
  ) {}

  onBecomeStale() {
    this.schedule();
  }

  schedule() {
    if (this._isScheduled) {
      this._isScheduled = true;
      globalState.pendingReactions.push(this);
      runReactions();
    }
  }

  isScheduled() {
    return this._isScheduled;
  }

  getSchedule() {
    const reaction = this.dispose.bind(this) as IReactionDisposer;
    reaction[$mobx] = this;
    return reaction;
  }

  /**
   * 内部的, 外部调用 schedule
   */
  _runReaction() {
    if (!this.isDisposed) {
      startBatch();
      this._isScheduled = false;
      this.onInvalidate();
      endBatch();
    }
  }

  dispose(): void {
    if (!this.isDisposed) {
      this.isDisposed = true;
      if (!this.isRunning) {
      }
    }
  }

  trace(enterBreakPoint: boolean = false): void {
    trace(this, enterBreakPoint);
  }

  track(fn: () => void) {
    if (this.isDisposed) {
      return;
    }
    startBatch();

    this.isRunning = true;
    // reactions 可能产生反应, 缓存上一个 reactions
    const prevReaction = globalState.trackingContext;
    globalState.trackingContext = this;
    // 跟踪正在访问的可观察对象
    const result = trackDerivedFunction(this, fn, undefined);
    globalState.trackingContext = prevReaction;
    this.isRunning = false;
    this.isTrackPending = false;

    if (this.isDisposed) {
      // 在上次运行期间已弃置, 清理处置调用后绑定的所有内容。
      clearObserving(this);
    }

    // trackDerivedFunction catch 抛出的异常
    if (isCaughtException(result)) {
      reportError(result.cause);
    }

    endBatch();
  }

  toString() {
    return `Reaction_[${this.name}]`;
  }
}

let reactionsScheduler: (fn: () => void) => void = f => f();

export function runReactions() {
  if (globalState.inBatch > 0 || globalState.isRunningReactions) {
    return;
  }
  reactionsScheduler(runReactionsHelper);
}

function runReactionsHelper() {
  globalState.isRunningReactions = true;

  const allReactions = globalState.pendingReactions;

  while (allReactions.length > 0) {
    let remainingReactions = allReactions.splice(0);
    for (let index = 0; index < remainingReactions.length; index++) {
      // 执行收集的Reaction
      remainingReactions[index]._runReaction();
    }
  }

  globalState.isRunningReactions = false;
}

export const isReaction = createInstanceofPredicate('Reaction', Reaction);
