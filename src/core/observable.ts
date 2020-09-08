/*
 * @Author: Rainy
 * @Date: 2020-09-06 16:29:51
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 17:20:30
 */

import { IDerivation, IDerivationState } from 'src/internal';

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
