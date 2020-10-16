/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-09 20:41:54
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
  ComputedValue
} from '../internal';

export function isObservableObject(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableObject;
}

/**
 * @description 可观察对象管理
 */
export class ObservableObjectAdministration {
  keysAtom: IAtom;
  proxy: any;
  pendingKeys: undefined | Map<PropertyKey, ObservableValue<boolean>>;
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

  write() {}

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

  const adm = new ObservableObjectAdministration(
    target,
    new Map(),
    stringifyKey(name),
    defaultEnhancer
  );

  addHiddenProp(target, $mobx, adm);
  return adm;
}
