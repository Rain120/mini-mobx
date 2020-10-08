/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:43:26
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-20 21:52:51
 */

export function toPrimitive(value: any) {
  return value === null ? null : typeof value === 'object' ? '' + value : value;
}

// string
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isUniqueStringLike(value: any): value is string | symbol | number {
  return ['string', 'symbol', 'number'].includes(typeof value);
}

export function stringifyKey(key: any): string {
  if ((typeof key).toLowerCase() === 'string') {
    return key;
  }
  if ((typeof key).toLowerCase() === 'symbol') {
    return key.toString();
  }

  return new String(key).toString();
}

// boolean
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

// number
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}
