import { createAction } from '../core/action';
/*
 * @Author: Rainy
 * @Date: 2020-09-26 12:14:08
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-01 10:29:34
 */

import {
  Annotation,
  createDecorator,
  createDecoratorAndAnnotation,
  executeAction,
  isFunction,
  isUniqueStringLike,
  storeDecorator
} from '../internal';

export const ACTION = 'action';
export const ACTION_BOUND = 'action.bound';
export const AUTOACTION = 'autoAction';
export const AUTOACTION_BOUND = 'autoAction.bound';

export const ACTION_UNNAMED = '<unnamed action>';

// decorator action
export type DecoratorFn = (name: string) => Annotation & PropertyDecorator;

export interface IActionFactory extends Annotation, DecoratorFn, PropertyDecorator {
  // 匿名(anonymous) action
  <T extends Function>(fn: T): T;

  // 具名(named) action
  <T extends Function>(name: string, fn: T): T;

  // action.bound
  bound: IBoundActionFactory;
}

export interface IBoundActionFactory extends Annotation, DecoratorFn, PropertyDecorator {}

export function createActionFactory(
  autoAction: boolean,
  annotation: Annotation['annotationType']
): IActionFactory {
  const res: IActionFactory = function (arg1: any, arg2?: any): any {
    // action(fn() {})
    if (isFunction(arg1)) {
      return createAction(arg1.name || ACTION_UNNAMED, arg1, autoAction);
    }
    // action('name', fn() {})
    if (isFunction(arg2)) {
      return createAction(arg1, arg2, autoAction);
    }

    // @action
    if (isUniqueStringLike(arg2)) {
      return storeDecorator(arg1, arg2, annotation);
    }
    // action('name') @action('name')
    if (isUniqueStringLike(arg1)) {
      return createDecoratorAndAnnotation(annotation, arg1);
    }
  } as any;

  res.annotationType = annotation;
  return res;
}

export const action: IActionFactory = createActionFactory(false, ACTION);
export const autoAction: IActionFactory = createActionFactory(true, AUTOACTION);

action.bound = createDecorator<string>(ACTION_BOUND);
autoAction.bound = createDecorator<string>(AUTOACTION_BOUND);

export function runInAction<T>(fn: () => T): T {
  return executeAction(fn.name || ACTION_UNNAMED, false, fn, this, undefined);
}

export function isAction(thing: any) {
  return isFunction(thing) && thing.isMobxAction === true;
}
