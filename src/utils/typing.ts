/*
 * @Author: Rainy
 * @Date: 2020-09-26 11:56:24
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-26 15:10:41
 */

export interface Lambda {
  (): void;
  name?: string;
}

export interface IEqualsComparer<T> {
  (a: T, b: T): boolean;
}
