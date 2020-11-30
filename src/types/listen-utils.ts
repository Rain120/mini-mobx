/*
 * @Author: Rainy [https://github.com/rain120]
 * @Date: 2020-11-12 21:13:19
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-12 22:13:11
 */

import { Lambda, once, untrackedEnd, untrackedStart } from '../internal';

export interface IListenable {
  changeListeners: Function[] | undefined;
}

export function hasListeners(listenable: IListenable) {
  return listenable.changeListeners !== undefined && listenable.changeListeners.length > 0;
}

export function registerListener(listenable: IListenable, handler: Function): Lambda {
  const listeners = listenable.changeListeners || (listenable.changeListeners = []);
  listeners.push(handler);

  return once(() => {
    const idx = listeners.indexOf(handler);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  });
}

export function notifyListeners<T>(listenable: IListenable, change: T) {
  const prevUntracked = untrackedStart();
  let listeners = listenable.changeListeners;

  if (!listeners) {
    return;
  }

  listeners = listeners.slice();
  for (let i = 0, l = listeners.length; i < l; i++) {
    listeners[i](change);
  }

  untrackedEnd(prevUntracked);
}
