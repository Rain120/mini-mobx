/*
 * @Author: Rainy
 * @Date: 2020-09-06 17:55:05
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 17:56:37
 */

export function isES6Map(thing: any): thing is Map<any, any> {
  return thing instanceof Map;
}
