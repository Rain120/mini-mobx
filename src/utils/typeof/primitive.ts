/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:43:26
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 18:50:49
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

// number
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}
