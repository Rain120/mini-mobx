/*
 * @Author: Rainy
 * @Date: 2020-09-19 17:52:03
 * @LastEditors: Rainy
 * @LastEditTime: 2020-09-20 16:43:10
 */

export interface Annotation {
  annotationType:
    | 'observable'
    | 'observable.ref'
    | 'observable.shallow'
    | 'observable.struct'
    | 'computed'
    | 'computed.struct'
    | 'action'
    | 'action.bound'
    | 'autoAction'
    | 'autoAction.bound'
    | 'flow';
  args?: any;
}

export type AnnotationsMapEntry = Annotation | true | false;

export type AnnotationsMap<T, AdditionalFields extends PropertyKey> = Partial<
  | Record<keyof T, AnnotationsMapEntry>
  | (AdditionalFields extends never ? never : Record<AdditionalFields, AnnotationsMapEntry>)
>;
