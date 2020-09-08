/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 18:44:16
 */

import { IObservable, IDerivation } from 'src/internal';
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

  reportObserved(): boolean {
    // return reportObserved(this);
    console.log('reportObserved');
    return true;
  }

  reportChanged(): void {
    console.log('reportChanged');
  }

  public toString(): string {
    return this.name;
  }
}
