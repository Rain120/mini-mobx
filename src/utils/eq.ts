/*
 * @Author: Rainy
 * @Date: 2020-10-05 11:40:20
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-05 19:41:19
 */

import {
  arrayBufferTag,
  booleanTag,
  dataViewTag,
  dateTag,
  errorTag,
  getAllKeys,
  mapTag,
  mapToArray,
  numberTag,
  regexpTag,
  setTag,
  setToArray,
  stringTag,
  symbolTag,
  symbolValueOf
} from '../internal';

/**
 * @LINK_TO https://github.com/lodash/lodash/blob/86a852fe763935bb64c12589df5391fd7d3bb14d/eq.js
 * @LINK_TO ECMA2016: http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero
 * @param  {} value
 * @param  {} other
 * @returns boolean
 */
export function eq(value, other): boolean {
  return value === other || (value !== value && other !== other);
}

export function equalArray(array, other, customizer, equalFunc): boolean {
  const arrayLength = array.length;
  let result = true;
  let index = -1;

  while (++index < arrayLength) {
    let compared;
    const arrayValue = array[index];
    const otherValue = other[index];

    customizer && customizer(otherValue, arrayValue, index, array);

    if (compared !== undefined) {
      if (compared) {
        continue;
      }

      result = false;
      break;
    }

    if (!(arrayValue === otherValue || equalFunc(arrayValue, otherValue, customizer))) {
      result = false;
      break;
    }
  }

  return result;
}

export function equalObject(object, other, customizer, equalFunc): boolean {
  const objectProps = getAllKeys(object);
  const objectLength = objectProps.length;
  const otherProps = getAllKeys(other);
  const otherLength = otherProps.length;

  if (objectLength !== otherLength) {
    return false;
  }

  let compared;
  let key;
  let index = objectLength;
  let result = true;
  let skipCtor;

  while (index--) {
    key = otherProps[index];
    if (!Object.hasOwnProperty.call(other, index)) {
      return false;
    }
  }

  while (++index < objectLength) {
    key = objectProps[index];

    let objectValue = objectProps[key];
    let otherValue = otherProps[key];

    customizer && customizer(otherValue, objectValue, key, object, other);

    if (
      !(compared === undefined
        ? objectValue === otherValue || equalFunc(objectValue, otherValue, customizer)
        : compared)
    ) {
      result = false;
      break;
    }

    skipCtor = key === 'constructor';
  }

  if (result && !skipCtor) {
    const objectCtor = object.constructor;
    const otherCtor = other.constructor;

    if (
      objectCtor !== otherCtor &&
      'constructor' in object &&
      'constructor' in other &&
      !(
        typeof objectCtor === 'function' &&
        objectCtor instanceof objectCtor &&
        typeof otherCtor === 'function' &&
        otherCtor instanceof otherCtor
      )
    ) {
      result = false;
    }
  }

  return result;
}

export function equalByTag(object, other, tag, customizer, equalFunc): boolean {
  let convert;
  switch (tag) {
    case dataViewTag:
      if (object.byteLength !== other.byteLength || object.byteOffset !== other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (
        object.byteLength !== other.byteLength ||
        !equalFunc(new Uint8Array(object), new Uint8Array(other))
      ) {
        return false;
      }
      return true;

    case booleanTag:
    case dateTag:
    case numberTag:
      // 将布尔值强制转换为 1或 0，并将日期强制为毫秒。无效日期被强制转换成 NaN
      return eq(+object, +other);

    case errorTag:
      return object.name === other.name && object.message === other.message;

    case regexpTag:
    case stringTag:
      // 将 正则表达式 强制转换成到字符串，并将字符串、基础类型和对象 比较相等
      // LINK_TO: http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      return object === `${other}`;

    case mapTag:
      convert = mapToArray;

    case setTag:
      convert || (convert = setToArray);

      if (object.size !== other.size) {
        return false;
      }

      const result = equalArray(convert(object), convert(other), customizer, equalFunc);

      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) === symbolValueOf.call(other);
      }
  }
  return false;
}
