/*
 * @Author: Rainy
 * @Date: 2020-10-03 16:50:00
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-09 19:42:18
 */

import {
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

export function makeProperty(
  adm: ObservableObjectAdministration,
  owner: Object,
  key: PropertyKey,
  descriptor: PropertyDescriptor,
  annotation: Annotation | boolean,
  // 可观察的扩展将 被复制 甚至未注释的属性, 所有拓展属性都会被观察
  forceCopy: boolean,
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

      break;
    }
    case AUTOACTION_BOUND:
    case ACTION_BOUND: {
      const fn = descriptor.value;
      if (!isFunction(fn)) {
        reportError('action 只能用于具有函数值的属性');
      }

      break;
    }

    case FLOW: {
      if (owner !== target && !forceCopy) {
      } else {
      }

      break;
    }

    case COMPUTED:
    case COMPUTED_STRUCT: {
      if (!descriptor.get) {
        reportError('computed 只能用于 getter 属性。');
      }
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
