/*
 * @Author: Rainy
 * @Date: 2020-09-26 12:14:12
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-30 16:23:10
 */

import { defineProperty, getDescriptor } from '../internal';

const isFunctionConfiguration = getDescriptor(() => {}, 'name')?.configurable ?? false;

const actionDescriptor: PropertyDescriptor = {
  value: 'action',
  configurable: true,
  enumerable: false,
  writable: false
};

export function createAction(
  actionName: string,
  fn: Function,
  autoAction: boolean = false,
  ref?: Object
): Function {
  function res() {
    return executeAction(actionName, autoAction, fn, ref || this, arguments);
  }

  res.isMobxAction = true;

  if (isFunctionConfiguration) {
    actionDescriptor.value = actionName;

    defineProperty(res, 'name', actionDescriptor);
  }

  return res;
}

/**
 * @description 执行 Action
 * @param  {string} actionName
 * @param  {boolean} canRunAsDerivation
 * @param  {Function} fn
 * @param  {any} scope?
 * @param  {IArguments} argv?
 */
export function executeAction(
  actionName: string,
  canRunAsDerivation: boolean,
  fn: Function,
  scope?: any,
  argv?: IArguments
) {
  try {
    return fn.apply(scope, argv);
  } catch (error) {
    throw error;
  } finally {
  }
}
