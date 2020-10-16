/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 17:04:36
 */

import { createInstanceofPredicate } from '../internal';

export interface IObservableSet<T = any, V = any> {}

export class ObservableSet<T = any> {}

// eslint-disable-next-line
export var isObservableSet = createInstanceofPredicate('ObservableSet', ObservableSet) as (
  thing: any
) => thing is ObservableSet<any>;
