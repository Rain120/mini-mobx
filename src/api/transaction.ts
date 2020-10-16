/*
 * @Author: Rainy
 * @Date: 2020-10-07 15:45:27
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 15:49:07
 */

import { endBatch, startBatch } from '../internal';
/**
 * @description 可以用来批量更新而不会通知任何观察者，直到事务结束。
 * @param  {()=>T} action 一个更新一些反应状态的函数
 * @param  {} thisArg=undefined
 * @returns action 参数返回的任何值
 */

export function transaction<T>(action: () => T, thisArg = undefined): T {
  startBatch();
  try {
    return action.apply(thisArg);
  } finally {
    endBatch();
  }
}
