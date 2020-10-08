### autorun

#### 参数

`Autorun` 接收第二个参数，它是一个参数对象，有如下可选的参数:

- `delay`: 可用于对效果函数进行去抖动的数字(以毫秒为单位)。如果是 0(默认值) 的话，那么不会进行去抖。

- `name`: 字符串，用于在例如像 [`spy`](https://www.bookstack.cn/read/mobx-5-zh/spy.md) 这样事件中用作此 `reaction` 的名称。

- `onError`: 用来处理 `reaction` 的错误，而不是传播它们。

- `scheduler`: 设置自定义调度器以决定如何调度 `autorun` 函数的重新运行


##### `delay`

```js
autorun(
  () => {
    // 假设 profile.asJson 返回的是 observable Json 表示，
    // 每次变化时将其发送给服务器，但发送前至少要等300毫秒。
    // 当发送后，profile.asJson 的最新值会被使用。
    sendProfileToServer(profile.asJson);
  },
  { delay: 300 }
);
```

##### `onError`

在 `autorun` 和所有其他类型 `reaction` 中抛出的异常会被捕获并打印到控制台，但不会将异常传播回原始导致异常的代码。这是为了确保一个异常中的 `reaction` 不会阻止其他可能不相关的 `reaction` 的预定执行。这也允许 `reaction` 从异常中恢复; 抛出异常不会破坏 `MobX`的跟踪，因此如果除去异常的原因，`reaction` 的后续运行可能会再次正常完成。

可以通过提供 `onError` 选项来覆盖 `Reactions` 的默认日志行为。示例:

```js
const age = observable.box(10);
const dispose = autorun(
  () => {
    if (age.get() < 0) throw new Error('Age should not be negative');
    console.log('Age', age.get());
  },
  {
    onError(e) {
      window.alert('Please enter a valid age');
    }
  }
);
```

一个全局的 `onError` 处理方法可以使用 `onReactionError(handler)` 来设置。这在测试或监控中很有用。
