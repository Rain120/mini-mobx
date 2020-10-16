/*
 * @Author: Rainy
 * @Date: 2020-09-20 22:04:20
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-30 16:17:28
 */

import {
  $mobx,
  Atom,
  IIsObservableObject,
  isUniqueStringLike,
  ObservableObjectAdministration,
  set
} from '../internal';

export function getAdm(target: any): ObservableObjectAdministration {
  return target[$mobx];
}

const objectProxyTraps: ProxyHandler<any> = {
  has(target: IIsObservableObject, name: PropertyKey) {
    if (name === $mobx || name === 'constructor') {
      return true;
    }

    const adm = getAdm(target);

    if (isUniqueStringLike(name)) {
      return adm.has(name);
    }

    return (adm as any) in target;
  },
  get(target: IIsObservableObject, name: PropertyKey) {
    if (name === $mobx || name === 'constructor') {
      return target[name];
    }

    const adm = getAdm(target);
    const observable = adm.values.get(name);
    if (observable instanceof Atom) {
      const result = (observable as any).get();

      if (result === undefined) {
        adm.has(name as any);
      }

      return result;
    }

    if (isUniqueStringLike(name)) {
      adm.has(name as any);
    }

    return target[name];
  },
  set(target: IIsObservableObject, name: PropertyKey, value: any) {
    if (!isUniqueStringLike(name)) {
      return false;
    }
    set(target, name, value);
    return true;
  },
  ownKeys(target: IIsObservableObject) {
    const adm = getAdm(target);
    adm.keysAtom.reportChanged();

    return Reflect.ownKeys(target);
  }
};

/**
 * @description 创建proxy 对象 (observable)
 * @param base proxy 对象
 */
export function createDynamicObservableObject(base: any) {
  const proxy = new Proxy(base, objectProxyTraps);

  base[$mobx].proxy = proxy;
  return proxy;
}
