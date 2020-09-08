/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 10:57:01
 */

import { isObservable, $mobx } from 'src/internal';

export function isObservableObject(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableObject;
}
