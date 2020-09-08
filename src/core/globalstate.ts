/*
 * @Author: Rainy
 * @Date: 2020-09-06 12:02:44
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 16:28:41
 */

export type IUNCHANGED = {};

export class MobXGlobals {
  version: number = 1;

  inBatch: number = 0;

  UNCHANGED: IUNCHANGED = {};
}

export const globalState: MobXGlobals = (() => new MobXGlobals())();
