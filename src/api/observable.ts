/*
 * @Author: Rainy
 * @Date: 2020-09-05 10:47:44
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-12 16:55:30
 */

import {
  assign,
  IObservableValue,
  isUniqueStringLike,
  isObservable,
  isPlainObject,
  // isES6Map,
  // IObservableArray,
  ObservableValue,
  IEnhancer,
  deepEnhancer,
  referenceEnhancer,
  createDecorator,
  storeDecorator,
  AnnotationsMap,
  Annotation,
  asObservableObject,
  createDynamicObservableObject,
  extendObservable,
  globalState,
  reportError,
  shallowEnhancer,
  refStructEnhancer
} from '../internal';

export const OBSERVABLE = 'observable';
export const OBSERVABLE_REF = 'observable.ref';
export const OBSERVABLE_SHALLOW = 'observable.shallow';
export const OBSERVABLE_STRUCT = 'observable.struct';

export interface CreateObservableOptions {
  name?: string;
  deep?: boolean;
  autoBind?: boolean;
  proxy?: boolean;
}

export const defaultObservableOptions: CreateObservableOptions = {
  name: undefined,
  deep: true,
  proxy: true
};

Object.freeze(defaultObservableOptions);

export function asCreateObservableOptions(thing: any): CreateObservableOptions {
  return thing || defaultObservableOptions;
}

export function getEnhancerFromOptions(options: CreateObservableOptions): IEnhancer<any> {
  return options.deep === true ? deepEnhancer : referenceEnhancer;
}

const annotationToEnhancer = {
  [OBSERVABLE]: deepEnhancer,
  [OBSERVABLE_REF]: referenceEnhancer,
  [OBSERVABLE_SHALLOW]: shallowEnhancer,
  [OBSERVABLE_STRUCT]: refStructEnhancer
};
export function getEnhancerFromAnnotation(annotation?: Annotation): IEnhancer<any> {
  return !annotation
    ? deepEnhancer
    : annotationToEnhancer[annotation.annotationType] ?? reportError('Invalid annotation');
}

// LINK_TO: https://mobx.js.org/refguide/observable.html
export interface IObservableFactory extends Annotation, PropertyDecorator {
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
    decorator?: AnnotationsMap<T, never>,
    options?: CreateObservableOptions
  ): T;
  deep: Annotation & PropertyDecorator;
  ref: Annotation & PropertyDecorator;
  shallow: Annotation & PropertyDecorator;
  struct: Annotation & PropertyDecorator;
}

/**
 *
 * @param value 要被 observable 的值
 * @param arg2 decorator装饰器需要的值
 */
function createObservable(value: any, arg2: any, arg3: any) {
  // decorator
  if (isUniqueStringLike(arg2)) {
    storeDecorator(value, arg2, OBSERVABLE);
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

const observableFactories: IObservableFactory = {
  box<T = any>(value?: T, options?: CreateObservableOptions): IObservableValue<T> {
    const opts = asCreateObservableOptions(options);
    return new ObservableValue(value, getEnhancerFromOptions(opts), opts.name);
  },
  // array<T = any>(value, options?: CreateObservableOptions) {
  //   return {};
  // }
  // map(value, options?: CreateObservableOptions) {
  //   return {};
  // }
  object<T = any>(
    props?: T,
    decorators?: AnnotationsMap<T, never>,
    options?: CreateObservableOptions
  ): T {
    const opts = asCreateObservableOptions(options);
    const base = {};
    asObservableObject(base, options?.name, getEnhancerFromOptions(opts));

    return extendObservable(
      globalState.useProxies === false || opts.proxy === false
        ? base
        : createDynamicObservableObject(base),
      props,
      decorators,
      options
    );
  },
  deep: createDecorator(OBSERVABLE),
  ref: createDecorator(OBSERVABLE_REF),
  shallow: createDecorator(OBSERVABLE_SHALLOW),
  struct: createDecorator(OBSERVABLE_STRUCT)
} as any;

// eslint-disable-next-line
export var observable: IObservableFactory = assign(createObservable, observableFactories);
