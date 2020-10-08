### @computed

#### computed 的选项

当使用 `computed` 作为调节器或者盒子，它接收的第二个选项参数对象，选项参数对象有如下可选参数:

- `name`: 字符串, 在 `spy` 和 `MobX` 开发者工具中使用的调试名称
- `context`: 在提供的表达式中使用的 `this`
- `set`: 要使用的`setter`函数。 没有 `setter` 的话无法为计算值分配新值。 如果传递给 `computed` 的第二个参数是一个函数，那么就把会这个函数作为 `setter`
- `equals`: 默认值是 `comparer.default` 。它充当比较前一个值和后一个值的比较函数。如果这个函数认为前一个值和后一个值是相等的，那么观察者就不会重新评估。这在使用结构数据和来自其他库的类型时很有用。例如，一个 `computed` 的 [moment](https://momentjs.com/) 实例可以使用 `(a, b) => a.isSame(b)` 。如果想要使用结构比较来确定新的值是否与上个值不同 (并作为结果通知观察者)，`comparer.deep` 十分便利。
- `requiresReaction`: 对于非常昂贵的计算值，推荐设置成 `true` 。如果你尝试读取它的值，但某些观察者没有跟踪该值（在这种情况下，`MobX` 不会缓存该值），则会导致计算结果丢失，而不是进行昂贵的重新评估。
- `keepAlive`: 如果没有任何人观察到，则不要使用此计算值。 *请注意，这很容易导致内存泄漏，因为它会导致此计算值使用的每个 `observable` ，并将计算值保存在内存中！*

#### `@computed.struct` 用于比较结构

`@computed` 装饰器不需要接收参数。如果你想创建一个能进行结构比较的计算属性时，请使用 `@computed.struct`。

#### 内置比较器

`MobX` 提供了三个内置 `comparer` (比较器) ，它们应该能满足绝大部分需求：

- `comparer.identity`: 使用恒等 (`===`) 运算符来判定两个值是否相同。
- `comparer.default`: 等同于 `comparer.identity`，但还认为 `NaN` 等于 `NaN` 。
- `comparer.structural`: 执行深层结构比较以确定两个值是否相同。