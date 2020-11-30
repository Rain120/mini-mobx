/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-13 10:05:17
 */

import {
  isObservable,
  $mobx,
  deepEnhancer,
  IEnhancer,
  Atom,
  addHiddenProp,
  hasProp,
  stringifyKey,
  ObservableValue,
  IAtom,
  referenceEnhancer,
  defineProperty,
  IComputedValueOptions,
  ComputedValue,
  getNextId,
  isPlainObject,
  hasInterceptors,
  IInterceptable,
  interceptChange,
  registerListener,
  Lambda,
  registerInterceptor
} from '../internal';

export function isObservableObject(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableObject;
}

export type IObjectDidChange<T = any> = {
  observableKind: 'object';
  name: PropertyKey;
  object: T;
  debugObjectName: string;
} & (
  | {
      type: 'add';
      newValue: any;
    }
  | {
      type: 'update';
      oldValue: any;
      newValue: any;
    }
  | {
      type: 'remove';
      newValue: any;
    }
);

export type IObjectWillChange<T = any> =
  | {
      object: T;
      type: 'update' | 'add';
      name: PropertyKey;
      newValue: any;
    }
  | {
      object: T;
      type: 'remove';
      name: PropertyKey;
    };

export const ADD = 'add';
export const DELETE = 'delete';
export const REMOVE = 'remove';

/**
 * @description 可观察对象管理
 */
export class ObservableObjectAdministration implements IInterceptable<IObjectWillChange> {
  keysAtom: IAtom;
  proxy: any;
  interceptors;
  changeListeners;

  private pendingKeys: undefined | Map<PropertyKey, ObservableValue<boolean>>;
  private keysValue: (string | number | symbol)[] = [];
  // INFO: 是否固定 keysValue 的取值
  private isStaledKeysValue = true;

  constructor(
    public target: any,
    public values = new Map<PropertyKey, ObservableValue<any> | ComputedValue<any>>(),
    public name: string = '',
    public defaultEnhancer: IEnhancer<any>
  ) {
    this.keysAtom = new Atom(name + '.keys');
  }

  read(key: PropertyKey) {
    return this.values.get(key)!.get();
  }

  write(key: PropertyKey, newValue) {
    const instance = this.target;
    const observable = this.values.get(key);

    if (observable instanceof ComputedValue) {
      observable.set(newValue);
      return;
    }
  }

  remove(key: PropertyKey) {}

  observe(callback: (changes: IObjectDidChange) => void, fireImmediately: boolean): Lambda {
    return registerListener(this, callback);
  }

  intercept(handler): Lambda {
    return registerInterceptor(this, handler);
  }

  has(key: PropertyKey) {
    const map = this.pendingKeys || (this.pendingKeys = new Map());
    let entry = map.get(key);

    if (entry) {
      return entry.get();
    } else {
      const exists = !!this.values.get(key);

      entry = new ObservableValue(exists, referenceEnhancer, `${this.name}.${stringifyKey(key)}`);
    }

    map.set(key, entry);
    return entry.get();
  }

  addObservableProp(
    propName: PropertyKey,
    newValue,
    enhancer: IEnhancer<any> = this.defaultEnhancer
  ) {
    const { target } = this;

    if (hasInterceptors(this)) {
      const change = interceptChange<IObjectWillChange>(this, {
        object: this.proxy || target,
        name: propName,
        type: ADD,
        newValue
      });

      if (!change) {
        return;
      }

      newValue = (change as any).newValue;
    }

    const observable = new ObservableValue(
      newValue,
      enhancer,
      `${this.name}.${stringifyKey(propName)}`
    );
    this.values.set(propName, observable);
    newValue = (observable as any).value;

    defineProperty(target, propName, generateObservablePropConfig(propName));
  }

  addComputedProp(propertyOwner: any, propName: PropertyKey, options: IComputedValueOptions<any>) {
    options.name = options.name || `${this.name}.${stringifyKey(propName)}`;
    options.context = this.proxy || this.target;
    this.values.set(propName, new ComputedValue(options));

    defineProperty(propertyOwner, propName, generateComputedPropConfig(propName));
  }

  getKeys(): PropertyKey[] {
    this.keysAtom.reportObserved();

    if (!this.isStaledKeysValue) {
      return this.keysValue;
    }

    this.keysValue = [];

    for (const [key, value] of this.values) {
      if (value instanceof ObservableValue) {
        this.keysValue.push(key);
      }
    }
    this.isStaledKeysValue = false;
    return this.keysValue;
  }

  notifyPropertyAddition(key: PropertyKey, newValue) {
    this.reportChanged();
  }

  private reportChanged() {
    this.isStaledKeysValue = false;
    this.keysAtom.reportChanged();
  }
}

const observablePropertyConfigs = Object.create(null);
const computedPropertyConfigs = Object.create(null);

export function generateObservablePropConfig(propName) {
  return generatePropConfig(observablePropertyConfigs, propName);
}

export function generateComputedPropConfig(propName) {
  return generatePropConfig(computedPropertyConfigs, propName, {
    enumerable: false
  });
}

export function generatePropConfig(target, propName, props = {}) {
  return (
    target[propName] ||
    (target[propName] = {
      configurable: true,
      enumerable: true,
      get() {
        return this[$mobx].read(propName);
      },
      set(v) {
        this[$mobx].write(propName, v);
      },
      ...props
    })
  );
}

export interface IIsObservableObject {
  $mobx: ObservableObjectAdministration;
}

export function asObservableObject(
  target: any,
  name: PropertyKey = '',
  defaultEnhancer: IEnhancer<any> = deepEnhancer
) {
  if (hasProp(target, $mobx)) {
    return target[$mobx];
  }

  if (!isPlainObject(target)) {
    name = `${target.constructor.name || 'ObservableObject'}@${getNextId()}`;
  }

  if (!name) {
    name = `ObservableObject@${getNextId()}`;
  }

  const adm = new ObservableObjectAdministration(
    target,
    new Map(),
    stringifyKey(name),
    defaultEnhancer
  );

  addHiddenProp(target, $mobx, adm);
  return adm;
}
