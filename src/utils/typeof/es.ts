/*
 * @Author: Rainy
 * @Date: 2020-09-06 17:55:05
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-06 19:36:51
 */

export function isES6Map(thing: any): thing is Map<any, any> {
  return thing instanceof Map;
}

export const hasGetOwnPropertySymbol = typeof Object.getOwnPropertySymbols !== 'undefined';

// LINK_TO: https://github.com/immerjs/immer/blob/9257084c2b3c04fc9727e4c701d672483a7767b7/src/utils/common.ts#L55
/*#__PURE__*/
export const ownKeys: (target: any) => PropertyKey[] =
  typeof Reflect !== 'undefined' && Reflect.ownKeys
    ? Reflect.ownKeys
    : hasGetOwnPropertySymbol
    ? obj => Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj) as any)
    : /* istanbul ignore next */ Object.getOwnPropertyNames;

export const symbolValueOf = Symbol.prototype.valueOf;

/**
 * 将 map 转换为 键-值对
 * @param map
 */
export function mapToArray(map) {
  let index = -1;
  const result = new Array(map.size);

  map.forEach((value, key) => {
    result[++index] = [key, value];
  });

  return result;
}

/**
 * 将 set 转换为它的值
 * @param set
 */
export function setToArray(set) {
  let index = -1;
  const result = new Array(set.size);

  set.forEach((value, key) => {
    result[++index] = value;
  });

  return result;
}

export function isBuffer(object: any): object is Buffer {
  return Buffer ? Buffer.isBuffer(object) : false;
}

// https://stackoverflow.com/a/37865170
export function isGenerator(object: any): boolean {
  const constructor = object?.constructor;
  if (!constructor) {
    return false;
  }

  if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') {
    return true;
  }

  return false;
}
