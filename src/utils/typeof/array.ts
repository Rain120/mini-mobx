/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:28:42
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 17:47:57
 */

import { isObservableArray, IObservableArray } from '../../internal';

export function isArray(value: any): value is Array<any> | IObservableArray<any> {
  return Array.isArray(value) || isObservableArray(value);
}
