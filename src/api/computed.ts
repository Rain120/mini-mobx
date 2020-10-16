/*
 * @Author: Rainy
 * @Date: 2020-10-06 19:53:13
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-06 19:57:19
 */

import { Annotation } from '../internal';

export const COMPUTED = 'computed';
export const COMPUTED_STRUCT = 'computed.struct';

export interface IComputedFactory extends Annotation, PropertyDecorator {}

export const computed: IComputedFactory = function () {};

computed.annotationType = COMPUTED;
