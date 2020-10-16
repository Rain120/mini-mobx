/*
 * @Author: Rainy
 * @Date: 2020-09-06 16:29:43
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-09 19:40:04
 */

import { addObserver, globalState, IDepTreeNode, IObservable, removeObserver } from '../internal';

// 任何源自状态并且不会再有任何进一步的相互作用的东西就是衍生(推导)。

// 推导状态
export enum IDerivationState {
  // 在运行之前或(在外部批处理中且未观察到)之前, 派生未保存有关 依赖项 树的任何数据
  NOT_TRACKING = -1,

  // 自从上次计算不会重新计算导数以来, 浅层依赖关系没有变化, 这就是使mobx快速运行的原因
  UP_TO_DATE = 0,

  // 一些深层依赖关系已更改, 但不知道是否浅层依赖关系已更改
  // 将需要首先检查 UP_TO_DATE 或 POSSIBLY_STALE 当前是否只有 ComputedValue
  // 将传播具有此状态的 POSSIBLY_STALE
  // 不必在每次依赖关系更改时都重新计算
  POSSIBLY_STALE = 1,

  // 自上次计算以来, 浅层依赖性已发生变化, 并且下一次需要推导时, 需要重新推导。
  STALE = 2
}

export interface IDerivation extends IDepTreeNode {
  observing: IObservable[];
  newObserving: IObservable[] | null;

  // 当前派生的ID。每次跟踪派生, 此数字都会增加一。 这个数字是全局唯一的
  runId: number;
  mapId: string;
  // 依赖收集状态
  dependenciesState: IDerivationState;

  // 此运行中派生使用的依赖项数量, 尚未绑定。
  unboundDepsCount: number;
  onBecomeStale(): void;
  isTracing: TraceMode;
}

export enum TraceMode {
  NODE,
  LOG,
  BREAK
}

/**
 * 执行提供的函数 f 并跟踪正在访问的可观察对象
 * 跟踪信息存储在 派生 对象上, 派生被注册为任何已访问可观察对象的观察者
 * @param derivation
 * @param f
 * @param context
 */

export function trackDerivedFunction<T>(derivation: IDerivation, f: () => T, context: any) {
  derivation.runId = ++globalState.runId;
  // 缓存上次正在跟踪的对象
  const prevTracking = globalState.trackingDerivation;
  globalState.trackingDerivation = derivation;
  globalState.inBatch++;
  let result;
  try {
    result = f.call(context);
  } catch (error) {
    result = new CaughtException(error);
  }
  globalState.inBatch--;
  globalState.trackingDerivation = prevTracking;
  bindDependencies(derivation);

  return result;
}

/**
 * @description diffs newObserving,
 * 将 观察值 更新为新的 观察值,
 * 通知已观察到/未观察到的 观察者
 * @param derivation 推导值
 */
export function bindDependencies(derivation: IDerivation) {
  const prevObserving = derivation.observing;
  const observing = (derivation.observing = derivation.newObserving!);
  let lowestNewObservingDerivationState = IDerivationState.UP_TO_DATE;

  let unboundDepsCount = derivation.unboundDepsCount;
  let ol /** count observable list length */ = 0;

  // INFO: 新依赖
  /**
   * 遍历所有新的可观察对象并检查 diffValue: (此列表可以包含重复项)
   * 0: 第一次出现, 更改为1 并保留它
   * 1: 发生更多, 将其删除
   */

  for (let i = 0; i < unboundDepsCount; i++) {
    const dep = observing[i];

    if (dep.diffValue === 0) {
      dep.diffValue = 1;
      if (ol !== i) {
        observing[ol] = dep;
      }

      ol++;
    }
  }

  // INFO: 旧依赖
  /**
   * 遍历所有旧的可观察对象并检查 diffValue: (在最后一次 bindDependencies 之后是唯一的)
   * 0: 它不在新的观测值中, 请不要观测
   * 1: 一直在观察, 不想通知它。更改为0, 并移除
   */

  unboundDepsCount = prevObserving.length;
  while (unboundDepsCount--) {
    const dep = prevObserving[unboundDepsCount];

    if (dep.diffValue === 0) {
      removeObserver(dep, derivation);
    }

    dep.diffValue = 0;
  }
  // INFO: 新依赖未监听
  /**
   * 遍历所有新的可观察对象并检查 diffValue: (现在它应该是唯一的)
   * 0: 在上一循环中被设置为0。不需要做任何事情, 并添加
   * 1: 没有观察到, 让我们观察一下。设为0
   */
  while (ol--) {
    const dep = observing[ol];

    if (dep.diffValue === 1) {
      dep.diffValue = 0;
      addObserver(dep, derivation);
    }
  }

  if (lowestNewObservingDerivationState !== IDerivationState.UP_TO_DATE) {
    derivation.dependenciesState = lowestNewObservingDerivationState;
    derivation.onBecomeStale();
  }
}

/**
 * 清除监听
 * @param derivation
 */
export function clearObserving(derivation: IDerivation) {
  const obs = derivation.observing;
  derivation.observing = [];
  // 删除监听器
  obs.forEach(dep => {
    removeObserver(dep, derivation);
  });

  // 重置跟踪状态
  derivation.dependenciesState = IDerivationState.NOT_TRACKING;
}
/**
 * @description 允许你在没有观察者的情况下运行一段代码
 * @param  {()=>T} action
 * @returns T
 */
export function untracked<T>(action: () => T): T {
  const prev = untrackedStart();
  try {
    return action();
  } finally {
    untrackedEnd(prev);
  }
}

export function untrackedStart(): IDerivation | null {
  const prev = globalState.trackingDerivation;

  globalState.trackingDerivation = null;

  return prev;
}
export function untrackedEnd(prev: IDerivation | null) {
  globalState.trackingDerivation = prev;
}

export class CaughtException {
  constructor(public cause: any) {}
}

export function isCaughtException(e: any): e is CaughtException {
  return e instanceof CaughtException;
}
