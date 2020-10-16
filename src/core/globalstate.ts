/*
 * @Author: Rainy
 * @Date: 2020-09-06 12:02:44
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-03 16:41:21
 */

import { ComputedValue, IDerivation, Reaction } from '../internal';

/**
 * 如果重置全局状态，这些值将保留
 */

const persistentKeys: (keyof MobXGlobals)[] = ['runId', 'UNCHANGED'];

export type IUNCHANGED = {};

export class MobXGlobals {
  version: number = 1;

  /**
   * 批量处理的个数
   */
  inBatch: number = 0;

  /**
   * 全局唯一标识以表示未更改
   */
  UNCHANGED: IUNCHANGED = {};

  /**
   * 当前正在运行的 reaction
   * 这确定了我们当前是否具有 reactive 上下文
   * ( 还为跟踪动作内部的计算值设置了跟踪推导, 但是只能通过反应的形式设置 trackingReaction )
   */
  trackingContext: Reaction | ComputedValue<any> | null = null;

  /**
   * 一般用途的“引导”。 将在重置之间保持不变。
   */
  mobxGuid = 0;

  /**
   * 每次跟踪推导时，都会为其分配一个唯一的运行ID
   */
  runId = 0;

  /**
   * 当前运行的推导
   */
  trackingDerivation: IDerivation | null = null;

  /**
   * pending 的尚未执行的 reaction 列表。
   */
  pendingReactions: Reaction[] = [];

  /**
   * 正在执行的 reaction
   */
  isRunningReactions: boolean = false;

  /**
   * 是否使用 proxy
   */
  useProxies = true;
}

export const globalState: MobXGlobals = (() => new MobXGlobals())();

export function getGlobalState(): any {
  return globalState;
}

export function resetGlobalState() {
  const defaultGlobalState = new MobXGlobals();

  for (const key in defaultGlobalState) {
    if (Object.prototype.hasOwnProperty.call(defaultGlobalState, key)) {
      if (persistentKeys.includes(key as any)) {
        globalState[key] = defaultGlobalState[key];
      }
    }
  }
}
