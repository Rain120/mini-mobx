/*
 * @Author: Rainy
 * @Date: 2020-09-05 18:31:40
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 17:33:17
 */

import { $mobx, isObservableObject, isObservableArray, reportError, isNumber, isObservableMap } from '../internal';

export function set(obj: any, key: any, value?: any): void {
  if (arguments.length === 2) {
    const values = key;
    for (const key in values) {
      set(obj, key, values[key]);
    }
  }
  if (isObservableObject(obj)) {
  } else if (isObservableArray(obj)) {
    // 是否是 number 或者 字符串的number
    if (isNaN(key) || !(isNumber(key) || isNumber(+key))) {
      reportError(`[set] Invalid index: '${key}'`);
    }

    key = parseInt(key, 10);

    if (key > obj.length) {
      obj.length = key + 1;
    }
    obj[key] = value;
  } else if (isObservableMap(obj)) {
    return obj.set(key);
  } else {
    reportError(`[set] The object don't set the key with ${key}`);
  }
}

export function has(obj: any, key: any): boolean {
  if (isObservableObject(obj)) {
    return obj[$mobx].has(key);
  }
  if (isObservableArray(obj)) {
    const k = !isNaN(key) && (isNumber(key) || isNumber(+key)) ? +key : null;
    return k !== null && k >= 0 && k < obj.length;
  }
  if (isObservableMap(obj)) {
    return obj[$mobx].has(key);
  }

  reportError(`[has] The object don't has the key with ${key}`);
}

export function get(obj: any, key: any) {
  if (!has(obj, key)) {
    return undefined;
  }
  if (isObservableObject(obj)) {
    return obj[key];
  }
  if (isObservableArray(obj)) {
    return obj[key];
  }
  if (isObservableMap(obj)) {
    return obj.get(key);
  }

  reportError(`[get] The object can't get the key with ${key}`);
}
