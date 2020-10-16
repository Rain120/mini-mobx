/*
 * @Author: Rainy
 * @Date: 2020-09-05 17:57:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-07 17:42:45
 */

import {
  createAtom,
  createInstanceofPredicate,
  deepEnhancer,
  getNextId,
  IAtom,
  IEnhancer,
  makeIterable,
  ObservableValue,
  transaction,
  untracked
} from '../internal';

export interface IObservableMap<T = any, V = any> {}
export type IMapEntry<K = any, V = any> = [K, V];

export class ObservableMap<K = any, V = any> implements Map<K, V> {
  data: Map<K, ObservableValue<V>>;
  hasMap: Map<K, ObservableValue<boolean>>;
  keysAtom: IAtom;
  dehancer: any;

  constructor(
    initialDate: any,
    public enhancer: IEnhancer<V> = deepEnhancer,
    public name = `ObservableMap@${getNextId()}`
  ) {
    this.keysAtom = createAtom(`${this.name}.keys()`);
    this.data = new Map();
    this.hasMap = new Map();
  }

  private _has(key: K): boolean {
    return this.data.has(key);
  }

  private _updateValue(key: K, newValue: V) {}

  private _addValue(key: K, newValue: V) {}

  private _dehanceValue<X extends V | undefined>(value: X): X {
    if (this.dehancer !== undefined) {
      return this.dehancer(value);
    }
    return value;
  }

  // implements map

  get(key: K): V | undefined {
    if (this.has(key)) {
      return this._dehanceValue(this.data.get(key)!.get());
    }
    return this._dehanceValue(undefined);
  }

  set(key: K, value: V) {
    const hasKey = this._has(key);
    // TODO: 拦截数据 处理
    if (hasKey) {
      this._updateValue(key, value);
    } else {
      this._addValue(key, value);
    }
    return this;
  }

  has(key: K): boolean {
    return false;
  }

  delete(key: K): boolean {
    return false;
  }

  keys(): IterableIterator<K> {
    this.keysAtom.reportObserved();
    return this.data.keys();
  }

  values(): IterableIterator<V> {
    const self = this;
    const keys = this.keys();
    return makeIterable({
      next() {
        const { done, value } = keys.next();
        return {
          done,
          value: done ? (undefined as any) : self.get(value)
        };
      }
    });
  }

  entries(): IterableIterator<IMapEntry<K, V>> {
    const self = this;
    const keys = this.keys();
    return makeIterable({
      next() {
        const { done, value } = keys.next();
        return {
          done,
          value: done ? (undefined as any) : ([value, self.get(value)!] as [K, V])
        };
      }
    });
  }

  clear() {
    transaction(() => {
      untracked(() => {
        for (const key of this.keys()) {
          this.delete(key);
        }
      });
    });
  }

  forEach(callback: (value: V, key: K, object: Map<K, V>) => void, thisArg?: any) {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this);
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  toJSON(): [K, V][] {
    return Array.from(this);
  }

  toString(): string {
    return '[object ObservableMap]';
  }

  get size(): number {
    this.keysAtom.reportObserved();
    return this.data.size;
  }

  get [Symbol.toStringTag]() {
    return 'Map';
  }
}

// eslint-disable-next-line
export var isObservableMap = createInstanceofPredicate('ObservableMap', ObservableMap) as (
  thing: any
) => thing is ObservableMap<any>;
