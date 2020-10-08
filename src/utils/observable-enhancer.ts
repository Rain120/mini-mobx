/*
 * @Author: Rainy
 * @Date: 2020-09-06 21:33:56
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-06 11:14:38
 */

import {
  isObservable,
  observable,
  isPlainObject,
  // isES6Map,
  isObservableObject,
  isObservableArray,
  isObservableMap,
  deepEqual
} from '../internal';

export interface IEnhancer<T> {
  (newValue: T, oldValue: T | undefined, name: string): T;
}

// observable.deep
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

  // if (isES6Map(v)) {
  //   return observable.map(v, { name });
  // }

  return v;
}

// observable.shallow
export function shallowEnhancer(v: any, _: any, name: any) {
  if (v === undefined || v === null) {
    return v;
  }

  // it is an observable already, done
  if (isObservableObject(v) || isObservableArray(v) || isObservableMap(v)) {
    return v;
  }

  // if (Array.isArray(v)) {
  //   return observable.array(v, { name, deep: false });
  // }

  if (isPlainObject(v)) {
    return observable.object(v, undefined, { name, deep: false });
  }

  // if (isES6Map(v)) {
  //   return observable.map(v, { name, deep: false });
  // }

  return v;
}

// observable.ref
export function referenceEnhancer(newValue?: any) {
  // INFO: 永远不会变成可观察的
  return newValue;
}

// observable.struct
export function refStructEnhancer(newValue, oldValue) {
  if (!deepEqual(newValue, oldValue)) {
    return oldValue;
  }

  return newValue;
}
