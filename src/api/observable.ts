/*
 * @Author: Rainy
 * @Date: 2020-09-05 10:47:44
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-06 21:44:55
 */

import {
  assign,
  IObservableValue,
  isUniqueStringLike,
  isObservable,
  isPlainObject,
  isES6Map,
  IObservableArray,
  ObservableValue,
  IEnhancer,
  deepEnhancer,
  referenceEnhancer,
} from 'src/internal';

export interface CreateObservableOptions {
  name?: string;
  deep?: boolean;
  autoBind?: boolean;
  proxy?: boolean;
}

export const defaultObservableOptions: CreateObservableOptions = {
  name: undefined,
  deep: true,
  proxy: true,
};

Object.freeze(defaultObservableOptions);

export function createObserverOptions(thing: any): CreateObservableOptions {
  return thing || defaultObservableOptions;
}

export function getEnhancerFromOptions(options: CreateObservableOptions): IEnhancer<any> {
  return options.deep === true ? deepEnhancer : referenceEnhancer;
}

// LINK_TO: https://mobx.js.org/refguide/observable.html
export interface ObservableFactories {
  box<T = any>(value?: T, options?: CreateObservableOptions): IObservableValue<T>;
  // array<T = any>(
  //   initialValues?: T[],
  //   options?: CreateObservableOptions
  // ): IObservableArray<T>;
  // map<T = any, V = any>(
  //   initialValues?: T,
  //   options?: CreateObservableOptions
  // ): IObservableValue<T>;
  object<T = any>(
    prop?: T,
    // TODO: 暂时不管 decorator
    decorator?: any,
    options?: CreateObservableOptions,
  ): T;
}

/**
 *
 * @param value 要被 observable 的值
 * @param arg2 decorator装饰器需要的值
 */
function createObservable(value: any, arg2: any, arg3: any) {
  // decorator
  if (isUniqueStringLike(arg2)) {
    // decorator apply
    // 没写的话, assign 可能会报错
    return;
  }

  if (isObservable(value)) {
    return value;
  }

  const res = isPlainObject(value)
    ? observable.object(value)
    : // : Array.isArray(value)
  // ? observable.array(value)
  // // TODO: map 考虑的东西太多了，暂时先不做
  // : false && isES6Map(value)
  // ? observable.map(value, arg2)
    value;

  if (res !== value) {
    return res;
  }

  return observable.box(value);
}

const observableFactories: ObservableFactories = {
  box<T = any>(value?: T, options?: CreateObservableOptions): IObservableValue<T> {
    const opts = createObserverOptions(options);
    return new ObservableValue(value, getEnhancerFromOptions(opts), opts.name);
  },
  // array<T = any>(value, options?: CreateObservableOptions) {
  //   return {};
  // }
  // map(value, options?: CreateObservableOptions) {
  //   return {};
  // }
  object<T = any>(value?: T, decorator?: any, options?: CreateObservableOptions): T {
    return {} as any;
  },
} as any;

// eslint-disable-next-line
export var observable: ObservableFactories = assign(createObservable, observableFactories);
