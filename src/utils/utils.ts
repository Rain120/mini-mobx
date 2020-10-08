/*
 * @Author: Rainy
 * @Date: 2020-09-20 11:44:33
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 16:14:48
 */

import { defineProperty, globalState, isObjectLike, objectPrototype } from '../internal';

export const EMPTY_ARRAY = [];
Object.freeze(EMPTY_ARRAY);

export const EMPTY_OBJECT = {};
Object.freeze(EMPTY_OBJECT);

export function getNextId() {
  return ++globalState.mobxGuid;
}

export function addHiddenProp(target: any, propName: PropertyKey, value: any) {
  defineProperty(target, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value
  });
}

export function hasProp(target: any, prop: PropertyKey): boolean {
  return objectPrototype.hasOwnProperty.call(target, prop);
}

export function createInstanceofPredicate<T>(
  name: string,
  theClass: new (...args: any[]) => T
): (x: any) => x is T {
  const propName = `isMobx${name}`;
  theClass.prototype[propName] = true;

  return function (x) {
    return isObjectLike(x) && x[propName] === true;
  } as any;
}
