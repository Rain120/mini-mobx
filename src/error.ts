/*
 * @Author: Rainy
 * @Date: 2020-09-06 11:00:47
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 11:36:11
 */

export function reportError(message: string): never {
  throw new Error(message);
}
