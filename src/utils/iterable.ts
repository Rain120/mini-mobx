/*
 * @Author: Rainy
 * @Date: 2020-10-07 17:23:15
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 17:24:35
 */

export function makeIterable<T>(iterator: Iterator<T>): IterableIterator<T> {
  iterator[Symbol.iterator] = getSelf;
  return iterator as any;
}

export function getSelf() {
  return this;
}
