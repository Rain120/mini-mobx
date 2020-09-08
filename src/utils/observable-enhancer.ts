/*
 * @Author: Rainy
 * @Date: 2020-09-06 21:33:56
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 21:41:57
 */

import { isObservable, observable, isPlainObject } from 'src/internal';

export interface IEnhancer<T> {
  (newValue: T, oldValue: T | undefined, name: string): T;
}

export function deepEnhancer(v: any, _: any, name: any) {
  // it is an observable already, done
  if (isObservable(v)) {
    return v;
  }

  // if (Array.isArray(v)) {
  //   return observable.array(v, { name });
  // }

  if (isPlainObject(v)) {
    return observable.object(v, undefined, { name });
  }

  return v;
}

export function referenceEnhancer(newValue?: any) {
  return newValue;
}
