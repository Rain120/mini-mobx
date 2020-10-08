/*
 * @Author: Rainy
 * @Date: 2020-10-05 14:36:01
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-05 19:58:40
 */

import {
  argsTag,
  arrayTag,
  equalArray,
  equalByTag,
  equalObject,
  getTag,
  isBuffer,
  isObjectLike,
  objectTag
} from '../internal';

/**
 * @LINK_TO https://github.com/lodash/lodash/blob/86a852fe763935bb64c12589df5391fd7d3bb14d/eqDeep.js#L30
 * @description 支持部分比较和跟踪遍历的对象
 * @param  {} object
 * @param  {} other
 * @param  {} customizer?
 * @returns boolean
 */
export function deepEqual(object, other, customizer?): boolean {
  if (object === other) {
    return true;
  }

  if (object == null || other == null || (!isObjectLike(object) && !isObjectLike(other))) {
    return object !== object && other !== other;
  }

  return baseIsEqualDeep(object, other, customizer, deepEqual);
}

/**
 * @description 用于数组和对象执行深度比较，并跟踪遍历的对象，使具有循环引用的对象能够被比较。
 * @param  {} object
 * @param  {} other
 * @param  {} customizer 用于自定义比较的函数
 * @param  {} equalFunc 确定相等值的函数
 * @returns boolean
 */
export function baseIsEqualDeep(object, other, customizer, equalFunc): boolean {
  let objectIsArray = Array.isArray(object);
  let otherIsArray = Array.isArray(other);

  let objTag = objectIsArray ? arrayTag : getTag(object);
  let otherTag = otherIsArray ? arrayTag : getTag(other);

  objTag = objTag === argsTag ? objectTag : objTag;
  otherTag = otherTag === argsTag ? otherTag : otherTag;

  let objectIsObject = objTag === objectTag;
  const otherIsObject = otherTag === objectTag;
  const isSameTag = objTag == otherTag;

  if (isSameTag && isBuffer(object)) {
    if (isBuffer(other)) {
      return false;
    }

    objectIsArray = true;
    objectIsObject = false;
  }

  if (isSameTag && !objectIsObject) {
    return objectIsArray
      ? equalArray(object, other, customizer, equalFunc)
      : equalByTag(object, other, objTag, customizer, equalFunc);
  }

  if (!isSameTag) {
    return false;
  }

  return equalObject(object, other, customizer, equalFunc);
}
