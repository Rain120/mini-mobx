/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:28:42
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-05 18:21:25
 */

import {
  getDescriptor,
  hasGetOwnPropertySymbol,
  objectPrototype,
  ownKeys,
  toString
} from '../../internal';

/** `Object#toString` result references. */
export const booleanTag = '[object Boolean]';
export const dateTag = '[object Date]';
export const errorTag = '[object Error]';
export const mapTag = '[object Map]';
export const numberTag = '[object Number]';
export const regexpTag = '[object RegExp]';
export const setTag = '[object Set]';
export const stringTag = '[object String]';
export const symbolTag = '[object Symbol]';

export const arrayBufferTag = '[object ArrayBuffer]';
export const dataViewTag = '[object DataView]';
export const nullTag = '[object Null]';
export const undefinedTag = '[object Undefined]';
export const objectTag = '[object Object]';
export const argsTag = '[object Arguments]';
export const arrayTag = '[object Array]';

export function getTag(value: any): string {
  if (value === null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return toString.call(value);
}

export function isObjectLike(o: any): o is Object {
  return toString.call(o) === objectTag;
}

export function isPlainObject(o) {
  let ctor, prot;

  if (isObjectLike(o) === false) {
    return false;
  }

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) {
    return true;
  }

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectLike(prot) === false) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

// LINK_TO: https://github.com/immerjs/immer/blob/9257084c2b3c04fc9727e4c701d672483a7767b7/src/utils/common.ts#L65
export const getOwnPropertyDescriptors =
  Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(target: any): Object {
    // Polyfill needed for Hermes and IE, see https://github.com/facebook/hermes/issues/274
    const result: any = {};
    ownKeys(target).forEach(key => {
      result[key] = getDescriptor(target, key);
    });

    return result;
  };

/**
 *
 * @param object
 * @return 自己的 keys & 原型链上的 keys & 自己 symbol 上可枚举的 keys
 */
export function getPlainObjectKeys(object) {
  const keys = Object.keys(object);
  if (!hasGetOwnPropertySymbol) {
    return keys;
  }

  const symbols = Object.getOwnPropertySymbols(object);
  if (!symbols) {
    return keys;
  }

  return [...keys, ...symbols.filter(s => objectPrototype.propertyIsEnumerable.call(object, s))];
}

export function getSymbols(object) {
  if (object === null) {
    return [];
  }

  object = Object(object);
  return Object.getOwnPropertySymbols(object).filter(symbol =>
    objectPrototype.propertyIsEnumerable.call(object, symbol)
  );
}

/**
 * @description 创建一个包含自己的可枚举属性名称和 symbol 的数组
 * @param object
 */
export function getAllKeys(object) {
  const result: (symbol | string)[] = Object.keys(Object(object));
  if (!Array.isArray(object)) {
    result.push(...getSymbols(object));
  }
  return result;
}
