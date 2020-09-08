/*
 * @Author: Rainy
 * @Date: 2020-09-06 16:29:43
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 17:13:42
 */

import { IObservable } from 'src/internal';

// 推导状态
export enum IDerivationState {
  // 在运行之前或(在外部批处理中且未观察到)之前, 派生未保存有关依赖项树的任何数据
  NOT_TRACKING = -1,

  // 自从上次计算不会重新计算导数以来, 浅层依赖关系没有变化, 这就是使mobx快速运行的原因
  UP_TO_DATE = 0,

  // 一些深层依赖关系已更改, 但不知道是否浅层依赖关系已更改
  // 将需要首先检查 UP_TO_DATE 或 POSSIBLY_STALE 当前是否只有ComputedValue
  // 将传播具有此状态的POSSIBLY_STALE
  // 不必在每次依赖关系更改时都重新计算
  POSSIBLY_STALE = 1,

  // 自上次计算以来, 浅层依赖性已发生变化, 并且下一次需要推导时, 需要重新推导。
  STALE = 2,
}

export interface IDerivation {
  observing: IObservable[];
  dependenciesState: IDerivationState;
  unboundDepsCount: number;
  unBecomeStale(): void;
}
