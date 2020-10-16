/*
 * @Author: Rainy [https://github.com/rain120]
 * @Date: 2020-10-09 19:49:14
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-09 20:03:12
 */

import { isFunction, Lambda, once, reportError, untrackedEnd, untrackedStart } from '../internal';

export type IInterceptor<T> = (change: T) => T | null;

export interface IInterceptable<T> {
  interceptors: IInterceptor<T>[] | undefined;
}

export function hasInterceptors(interceptable: IInterceptable<any>): boolean {
  return interceptable.interceptors !== undefined && interceptable.interceptors.length > 0;
}

export function registerInterceptor<T>(
  interceptable: IInterceptable<T>,
  handler: IInterceptor<T>
): Lambda {
  const interceptors = interceptable.interceptors || (interceptable.interceptors = []);
  interceptors.push(handler);

  return once(() => {
    const idx = interceptors.indexOf(handler);
    if (idx !== -1) {
      interceptors.splice(idx, 1);
    }
  });
}

export function interceptChange<T>(
  interceptable: IInterceptable<T | null>,
  change: T | null
): T | null {
  const prevUntracked = untrackedStart();

  try {
    const interceptors = [...(interceptable.interceptors || [])];

    for (let i = 0; i < interceptors.length; i++) {
      if (isFunction(interceptors[i])) {
        change = interceptors[i](change);
        if (change && !(change as any).type) {
          reportError('拦截处理器应不返回任何内容或更改对象');
        }
        if (!change) {
          break;
        }
      } else {
        reportError(`The interceptors at ${i} is not function`);
      }
    }

    return change;
  } finally {
    untrackedEnd(prevUntracked);
  }
}
