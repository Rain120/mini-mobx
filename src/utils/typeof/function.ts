/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:39:33
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-05 11:42:27
 */

export function noop() {}

export function isFunction(fn: any): fn is Function {
  return fn !== null && typeof fn === 'function';
}
