/*
 * @Author: Rainy
 * @Date: 2020-09-27 20:05:45
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 17:05:10
 */

import {
  $mobx,
  IDepTreeNode,
  isAtom,
  isComputedValue,
  isFunction,
  isObservableArray,
  isObservableMap,
  isObservableObject,
  isObservableSet,
  isReaction,
  reportError
} from '../internal';

/**
 * @description 返回给定的 observable 对象、属性、reaction 等的背后作用的Atom。
 * @param  {any} thing
 * @param  {string} property?
 * @returns IDepTreeNode
 */
export function getAtom(thing: any, property?: string): IDepTreeNode {
  if (typeof thing === 'object' && thing !== null) {
    if (isObservableArray(thing)) {
      if (!property) {
        reportError('无法从数组中获取当前索引的 atoms');
      }

      return (thing as any)[$mobx].atom;
    }
    if (isObservableSet(thing)) {
      return (thing as any)[$mobx];
    }
    if (isObservableMap(thing)) {
      if (property === undefined) {
        return thing.keysAtom;
      }
      const observable = thing.data.get(property) || thing.hasMap.get(property);

      if (!observable) {
        reportError(`Observable Map 上不存在当前 ${property}`);
      }

      return observable;
    }
    if (isObservableObject(thing)) {
      if (!property) {
        reportError('property 不存在');
      }
      const observable = (thing as any)[$mobx].values.get(property);

      if (!observable) {
        reportError(`Observable Object 上不存在当前 ${property}`);
      }

      return observable;
    }
    if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
      return thing;
    }
  } else if (isFunction(thing)) {
    if (isReaction(thing[$mobx])) {
      // 派发函数
      return thing[$mobx];
    }
  }
}
