/*
 * @Author: Rainy
 * @Date: 2020-10-03 16:00:48
 * @LastEditors: Rainy
 * @LastEditTime: 2020-11-12 17:13:25
 */

import {
  AnnotationsMap,
  asCreateObservableOptions,
  asObservableObject,
  CreateObservableOptions,
  endBatch,
  getEnhancerFromOptions,
  getOwnPropertyDescriptors,
  getPlainObjectKeys,
  makeProperty,
  ObservableObjectAdministration,
  startBatch
} from '../internal';

export function extendObservable<A extends Object, B extends Object>(
  target: A,
  properties?: B,
  annotations?: AnnotationsMap<B, never>,
  options?: CreateObservableOptions
): A & B {
  const opts = asCreateObservableOptions(options);
  const adm = asObservableObject(target, opts.name, getEnhancerFromOptions(opts));

  // INFO: 统计批量处理的个数
  startBatch();

  try {
    const descriptors = getOwnPropertyDescriptors(properties);
    getPlainObjectKeys(descriptors).forEach(key => {
      /**
       * @description 对属性进行绑定
       * observable(OBSERVABLE, OBSERVABLE_REF, OBSERVABLE_SHALLOW, OBSERVABLE_STRUCT)
       * computed(COMPUTED, COMPUTED_STRUCT)
       * action(AUTOACTION, ACTION, etc.)
       * FLOW, etc.
       */
      makeProperty(
        adm,
        target,
        key,
        descriptors[key as any],
        !annotations ? true : key in annotations ? annotations[key as any] : true,
        // 可观察的扩展将 被复制 甚至未注释的属性, 所有拓展属性都会被观察
        true,
        !!options?.autoBind
      );
    });
  } finally {
    // INFO: 处理 reaction
    endBatch();
  }

  return target as any;
}
