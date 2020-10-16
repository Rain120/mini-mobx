/*
 * @Author: Rainy
 * @Date: 2020-09-06 16:29:51
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-09 19:12:21
 */

import { globalState, IDerivation, IDerivationState, runReactions } from '../internal';

export interface IDepTreeNode {
  name: string;
  observing?: IObservable[];
}
export interface IObservable extends IDepTreeNode {
  diffValue: number;

  observers: Set<IDerivation>;

  // 用于避免冗余传播
  lowestObserverState: IDerivationState;
}

export function startBatch() {
  globalState.inBatch++;
}

/**
 * 批处理开始事务，至少是为了在无其他操作时记住 ComputedValues。
 * 在批处理期间，每个 onBecomeUnobserved 最多可调用一次。
 * 避免不必要的重新计算。
 */
export function endBatch() {
  if (--globalState.inBatch) {
    runReactions();
  }
}
/**
 * @derivation 添加观察依赖
 * @param  {IObservable} dep
 * @param  {IDerivation} derivation
 */
export function addObserver(observable: IObservable, node: IDerivation) {
  observable.observers.add(node);

  if (observable.lowestObserverState > node.dependenciesState) {
    observable.lowestObserverState  = node.dependenciesState
  }
}

/**
 * 删除观察依赖
 * @param observable 观察对象
 * @param derivation 衍生对象
 */
export function removeObserver(observable: IObservable, derivation: IDerivation) {
  observable.observers.delete(derivation);
}
