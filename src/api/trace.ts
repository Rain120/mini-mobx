/*
 * @Author: Rainy
 * @Date: 2020-09-27 19:58:24
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 16:06:11
 */

import { getAtom, globalState, isBoolean, reportError } from '../internal';

export function trace(thing: any, prop?: string, enterBreakPoint?: boolean): void;

export function trace(thing: any, enterBreakPoint?: boolean): void;

export function trace(enterBreakPoint?: boolean): void;

export function trace(...args: any[]): void {
  let enterBreakPoint: boolean = false;
  if (isBoolean(args[args.length - 1])) {
    enterBreakPoint = args.pop();
  }

  const derivation = getAtomArgs(args);

  // 只能在跟踪的计算值或反应中使用。考虑明确传递计算值或反应
  if (!derivation) {
    return reportError('derivation is null');
  }
}

function getAtomArgs(args): any {
  switch (args.length) {
    case 0:
      return globalState.trackingDerivation;
    case 1:
      return getAtom(args[0]);
    case 1:
      return getAtom(args[0], args[1]);
  }
}
