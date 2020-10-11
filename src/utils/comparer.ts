/*
 * @Author: Rainy
 * @Date: 2020-09-06 19:25:11
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-09 20:38:40
 */

import { deepEqual } from '../internal';

function defaultComparer(a: any, b: any): boolean {
  return Object.is(a, b);
}

function structuralCompare(a: any, b: any): boolean {
  return deepEqual(a, b);
}

export const comparer = {
  default: defaultComparer,
  structural: structuralCompare
};
