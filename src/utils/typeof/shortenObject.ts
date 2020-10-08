/*
 * @Author: Rainy
 * @Date: 2020-09-05 11:31:51
 * @LastEditors: Rainy
 * @LastEditTime: 2020-10-05 13:09:51
 */

// 将 Object 上的属性缩写处理，方便使用

export const assign = Object.assign;

// LINK_TO: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
// 返回指定对象上一个自有属性对应的属性描述符。
// (自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性)
export const getDescriptor = Object.getOwnPropertyDescriptor;

export const defineProperty = Object.defineProperty;

export const objectPrototype = Object.prototype;

export const toString = Object.prototype.toString;
