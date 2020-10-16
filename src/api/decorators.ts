/*
 * @Author: Rainy
 * @Date: 2020-09-19 17:46:57
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-30 15:12:14
 */

import { Annotation, assign, getDescriptor, addHiddenProp } from '../internal';

export const mobxDecoratorsSymbol = Symbol('mobx-decorators');

export function createDecorator<ArgType>(
  type: Annotation['annotationType']
): Annotation & PropertyDecorator & ((arg: ArgType) => PropertyDecorator & Annotation) {
  return assign(
    function (target: any, property?: PropertyKey) {
      if (property === undefined) {
        createDecoratorAndAnnotation(type, target);
      } else {
        storeDecorator(target, property!, type);
      }
    },
    {
      annotationType: type
    }
  ) as any;
}

export function createDecoratorAndAnnotation<ArgType>(
  type: Annotation['annotationType'],
  args?: ArgType
): Annotation & PropertyDecorator & ((arg: ArgType) => PropertyDecorator & Annotation) {
  return assign(
    function (target: any, property: PropertyKey) {
      storeDecorator(target, property, type, args);
    },
    {
      annotationType: type,
      args
    }
  ) as any;
}

export function storeDecorator(
  target: any,
  property: PropertyKey,
  type: Annotation['annotationType'],
  args?: any
) {
  const desc = getDescriptor(target, mobxDecoratorsSymbol);
  let map: any;
  if (desc) {
    map = desc.value;
  } else {
    map = {};
    addHiddenProp(target, mobxDecoratorsSymbol, map);
  }

  map[property] = {
    annotationType: type,
    args
  } as Annotation;
}
