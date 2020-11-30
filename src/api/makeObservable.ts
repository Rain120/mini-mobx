/*
 * @Author: Rainy
 * @Date: 2020-10-03 16:50:00
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-12 17:46:36
 */

import {
  addHiddenProp,
  action,
  ACTION,
  ACTION_BOUND,
  AUTOACTION,
  autoAction,
  AUTOACTION_BOUND,
  COMPUTED,
  computed,
  COMPUTED_STRUCT,
  defineProperty,
  FLOW,
  flow,
  getEnhancerFromAnnotation,
  isAction,
  isFunction,
  isGenerator,
  OBSERVABLE,
  observable,
  ObservableObjectAdministration,
  OBSERVABLE_REF,
  OBSERVABLE_SHALLOW,
  OBSERVABLE_STRUCT,
  reportError
} from '../internal';
import { Annotation } from './annotation';

function makeAction(target: Object, key: PropertyKey, name, fn, asAutoAction: boolean) {
  addHiddenProp(target, key, asAutoAction ? autoAction(name || key, fn) : action(name || key, fn));
}

export function makeProperty(
  adm: ObservableObjectAdministration,
  owner: Object,
  key: PropertyKey,
  descriptor: PropertyDescriptor,
  annotation: Annotation | boolean,
  // 可观察的扩展将 被复制 甚至未注释的属性, 所有拓展属性都会被观察
  forceCopy: boolean,
  // INFO: docs/action.md -> @action.bound classMethod() {}
  // @action.bound 创建有范围的动作, 不需要 name 函数,
  // 自动绑定上下文对象, 名称将始终基于动作绑定的属性。
  autoBind: boolean
): void {
  const { target } = adm;
  const defaultAnnotation: Annotation | undefined = observable;
  const originAnnotation = annotation;

  if (annotation === true) {
    annotation = getInstanceAnnotation(descriptor, defaultAnnotation, autoBind);
  }
  if (annotation === false) {
    if (forceCopy) {
      defineProperty(target, key, descriptor);
    }
    return;
  }

  if (!annotation || annotation === true || !annotation.annotationType) {
    reportError(`${key.toString()} 无效装饰器`);
    return;
  }

  const type = annotation.annotationType;

  switch (type) {
    case AUTOACTION:
    case ACTION: {
      const fn = descriptor.value;
      // eg: action(() => {}); error: action({}), action(1), etc...
      if (!isFunction(fn)) {
        reportError('action 只能用于具有函数值的属性');
      }

      const realTarget: Object | null =
        owner !== target && !forceCopy ? (isAction(owner[key]) ? null : owner) : target;

      if (realTarget) {
        makeAction(realTarget, key, annotation.args, fn, type === AUTOACTION);
      }

      break;
    }
    case AUTOACTION_BOUND:
    case ACTION_BOUND: {
      const fn = descriptor.value;
      if (!isFunction(fn)) {
        reportError('action 只能用于具有函数值的属性');
      }

      makeAction(
        target,
        key,
        annotation.args,
        fn.bind(adm.proxy || target),
        type === AUTOACTION_BOUND
      );
      break;
    }

    case FLOW: {
      if (owner !== target && !forceCopy) {
      } else {
        addHiddenProp(target, key, flow(descriptor.value));
      }

      break;
    }

    case COMPUTED:
    case COMPUTED_STRUCT: {
      if (!descriptor.get) {
        reportError('computed 只能用于 getter 属性。');
      }

      adm.addComputedProp(target, key, {
        get: descriptor.get,
        set: descriptor.set,
        compareStructural: annotation.annotationType === COMPUTED_STRUCT,
        ...annotation.args
      });
      break;
    }

    case OBSERVABLE:
    case OBSERVABLE_SHALLOW:
    case OBSERVABLE_STRUCT:
    case OBSERVABLE_REF: {
      const enhancer =
        originAnnotation === true ? adm.defaultEnhancer : getEnhancerFromAnnotation(annotation);

      adm.addObservableProp(key, descriptor.value, enhancer);
      break;
    }
  }
}

export function getInstanceAnnotation(
  desc: PropertyDescriptor,
  defaultAnnotation: Annotation | undefined,
  autoBind: boolean
): Annotation | boolean {
  if (desc.get) {
    return computed;
  }

  // 忽略纯 setters
  if (desc.set) {
    return false;
  }

  // 如果已经执行了操作，则不要再执行此操作，但前提是它已正确设置
  if (isFunction(desc.value)) {
    return isGenerator(desc.value)
      ? flow
      : isAction(desc.value)
      ? false
      : autoBind
      ? autoAction.bound
      : autoAction;
  }

  return defaultAnnotation ?? observable.deep;
}
