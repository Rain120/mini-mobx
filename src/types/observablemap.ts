/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 18:09:08
 */

import { isObservable, $mobx } from 'src/internal';

export interface IObservableMap<T = any, V = any> {}

export function isObservableMap(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableMap;
}
