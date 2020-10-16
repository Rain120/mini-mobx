/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-11 11:55:18
 */

import { IObservable, IDerivation, createInstanceofPredicate, noop } from '../internal';
import { IDerivationState } from './derivation';

export const $mobx = Symbol('mobx administration');

export interface IAtom extends IObservable {
  reportObserved(): boolean;
  reportChanged(): void;
}

export class Atom implements IAtom {
  constructor(public name: string) {}

  diffValue = 0;

  observers = new Set<IDerivation>();

  lowestObserverState: IDerivationState = IDerivationState.NOT_TRACKING;

  // 调用此方法以通知 mobx 你的原子已被某种方式使用。如果当前存在反应上下文, 则返回 true。
  reportObserved(): boolean {
    // return reportObserved(this);
    console.log('reportObserved');
    return true;
  }

  // 调用此方法 _after_ 此方法已更改为向 mobx 发出信号, 告知其所有观察者都应使其无效。
  reportChanged(): void {
    // 无 inBatch 下, 值的改变引起的会先加锁, 调用 onBecomeStale 会在 runReactions 会拦截住
    // 在 endBatch 中会再调 runReactions 来处理 reaction
    console.log('reportChanged');
  }

  public toString(): string {
    return this.name;
  }
}

export const isAtom = createInstanceofPredicate('Atom', Atom);

export function createAtom(
  name: string
  // onBecomeObservedHandler: () => void = noop,
  // onBecomeUnobservedHandler: () => void = noop
): IAtom {
  const atom = new Atom(name);

  // if (onBecomeObservedHandler !== noop) {
  //   onBecomeObserved(atom, onBecomeObservedHandler);
  // }
  // if (onBecomeUnobservedHandler !== noop) {
  //   onBecomeUnobserved(atom, onBecomeUnobservedHandler);
  // }
  return atom;
}
