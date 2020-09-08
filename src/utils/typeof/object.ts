/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:28:42
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 10:45:25
 */

import { objectPrototype } from 'src/internal';

export function isObject(value: any): value is Object {
  return value !== null && typeof value === 'object';
}

export function isPlainObject(value: any) {
  if (!isObject(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === objectPrototype || proto === null;
}
