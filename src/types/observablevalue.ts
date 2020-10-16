/*
 * @Author: Rainy
 * @Date: 2020-09-05 16:56:31
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-21 19:44:58
 */

import {
  // observable,
  Atom,
  $mobx,
  // CreateObservableOptions,
  toPrimitive,
  comparer,
  globalState,
  IEqualsComparer,
  IUNCHANGED,
  IEnhancer,
} from '../internal';

export interface IObservableValue<T> {
  get(): T;
  set(value: T): void;
}

export class ObservableValue<T> extends Atom implements IObservableValue<T> {
  value: T;

  constructor(
    value: T,
    public enhancer: IEnhancer<T>,
    public name: string = 'ObservableValue',
    private equals: IEqualsComparer<T> = comparer.default,
  ) {
    super(name);
    this.value = enhancer(value, undefined, name);
    this.equals = equals;
  }

  public get() {
    // Atom
    this.reportObserved();
    return this.value;
  }

  private prepareNewValue(newValue: T): T | IUNCHANGED {
    const oldValue = this.value;
    newValue = this.enhancer(newValue, oldValue, this.name);
    return this.equals(newValue, oldValue) ? globalState.UNCHANGED : newValue;
  }

  public set(newValue: T) {
    newValue = this.prepareNewValue(newValue) as any;
    if (newValue !== globalState.UNCHANGED) {
      this.setNewValue(newValue);
    }
  }

  private setNewValue(newValue: T) {
    this.reportChanged();
    this.value = newValue;
  }

  toJSON() {
    return this.get();
  }

  valueOf(): T {
    return toPrimitive(this.get());
  }

  [Symbol.toPrimitive]() {
    return this.valueOf();
  }
}

export function isObservable(value: any) {
  if (!value) {
    return false;
  }

  return !!value[$mobx];
}
