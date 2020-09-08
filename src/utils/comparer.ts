/*
 * @Author: Rainy
 * @Date: 2020-09-06 19:25:11
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 20:32:08
 */

export interface IEqualsComparer<T> {
  (a: T, b: T): boolean;
}

function defaultComparer(a: any, b: any): boolean {
  return Object.is(a, b);
}

export const comparer = {
  default: defaultComparer,
};
