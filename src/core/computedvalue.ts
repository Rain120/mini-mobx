/*
 * @Author: Rainy
 * @Date: 2020-10-03 15:29:06
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-13 10:36:59
 */

import {
  CaughtException,
  createAction,
  createInstanceofPredicate,
  getNextId,
  IEqualsComparer,
  isCaughtException,
  reportError
} from '../internal';
import { comparer } from '../utils/comparer';

// LINK_TO: docs/@computed.md#computed的选项
export interface IComputedValueOptions<T> {
  name?: string;
  context?: any;
  get?: () => T;
  set: (value: T) => void;
  equals?: IEqualsComparer<T>;
  requiresReaction?: boolean;
  keepAlive?: boolean;
}

export class ComputedValue<T> {
  name: string;
  setter?: (value: T) => void;
  keepAlive: boolean;
  isRunningSetter: boolean = false;

  protected value: T | undefined | CaughtException = new CaughtException(null);
  private equals?: IEqualsComparer<any>;
  private requiresReaction: boolean;
  scope: Object | undefined;

  constructor(options: IComputedValueOptions<T>) {
    if (!options.get) {
      reportError('computed 缺失 get');
    }
    this.name = options.name || `ComputedValue@${getNextId()}`;
    if (options.set) {
      this.setter = createAction(`${this.name}-setter`, options.set) as any;
    }

    this.equals =
      options.equals || (options as any).compareStructural || (options as any).struct
        ? comparer.structural
        : comparer.default;

    this.requiresReaction = !!options.requiresReaction;
    this.keepAlive = !!options.keepAlive;
  }

  public get(): T {
    // TODO: get
    const result = this.value!;

    if (isCaughtException(result)) {
      throw result.cause;
    }

    return result;
  }

  public set(value: T) {
    if (this.setter) {
      if (this.isRunningSetter) {
        reportError(`[ComputedValue ${this.name}]无法将新值分配给计算值。`);
      }

      this.isRunningSetter = true;

      try {
        this.setter.call(this.scope, value);
      } finally {
        this.isRunningSetter = false;
      }
    } else {
      reportError(`[ComputedValue ${this.name}]无法将新值分配给计算值。`);
    }
  }
}

export const isComputedValue = createInstanceofPredicate('ComputedValue', ComputedValue);
