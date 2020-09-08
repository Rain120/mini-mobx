/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 18:10:32
 */

import { isObservable, $mobx } from 'src/internal';

export interface IObservableArray<T = any> extends Array<T> {
  spliceWithArray(index: number, deleteCount?: number, newItems?: T[]): T[];
  clear(): void;
  replace(newItems: T[]): T[];
  remove(value: T): void;
  toJSON(): T[];
}

export function isObservableArray(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableArray;
}
