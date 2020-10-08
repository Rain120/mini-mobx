### reaction

用法: `reaction(() => data, (data, reaction) => { sideEffect }, options?)`。

`autorun` 的变种，对于如何追踪 observable 赋予了更细粒度的控制。它接收两个函数参数，第一个(**数据** 函数)是用来追踪并返回数据作为第二个函数(**效果** 函数)的输入。不同于 `autorun` 的是当创建时*效果* 函数不会直接运行，只有在数据表达式首次返回一个新值后才会运行。在执行 **效果** 函数时访问的任何 observable 都不会被追踪。

`reaction` 返回一个清理函数。

传入 `reaction` 的第二个函数(副作用函数)当调用时会接收两个参数。第一个参数是由 **data** 函数返回的值。第二个参数是当前的 reaction，可以用来在执行期间清理 `reaction`

值得注意的是 **效果** 函数**仅**对数据函数中**访问**的数据作出反应，这可能会比实际在效果函数使用的数据要少。此外，**效果** 函数只会在表达式返回的数据发生更改时触发。换句话说: `reaction`需要你生产 **效果** 函数中所需要的东西。

### 选项

Reaction 接收第三个参数，它是一个参数对象，有如下可选的参数:

- `fireImmediately`: 布尔值，用来标识效果函数是否在数据函数第一次运行后立即触发。默认值是 `false` 。

- `delay`: 可用于对效果函数进行去抖动的数字(以毫秒为单位)。如果是 0(默认值) 的话，那么不会进行去抖。

- `equals`: 默认值是 `comparer.default` 。如果指定的话，这个比较器函数被用来比较由 **数据** 函数产生的前一个值和后一个值。只有比较器函数返回 false **效果** 函数才会被调用。此选项如果指定的话，会覆盖 `compareStructural` 选项。

- `name`: 字符串，用于在例如像 [`spy`](https://www.bookstack.cn/read/mobx-5-zh/refguide-spy.md) 这样事件中用作此 reaction 的名称。

- `onError`: 用来处理 reaction 的错误，而不是传播它们。

- `scheduler`: 设置自定义调度器以决定如何调度 autorun 函数的重新运行

