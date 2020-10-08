### `transaction`

*`Transaction` 是底层 `API` , 推荐使用 actions 来代替*

`transaction(worker: () => void)` 可以用来批量更新而不会通知任何观察者，直到事务结束。`transaction` 接收一个无参的 `worker` 函数作为参数，并运行它。到这个函数完成前都不会有任何观察者收到通知。`transaction` 返回 `worker` 函数返回的任意值。注意，`transaction` 的运行完全是同步的。`transactions` 可以是嵌套的。只有当最外层的 `transaction` 完成后，等待中的 `reactions` 才会运行。

```js
import {observable, transaction, autorun} from "mobx";

const numbers = observable([]);

autorun(() => console.log(numbers.length, "numbers!"));
// 输出: '0 numbers!'

transaction(() => {
    transaction(() => {
        numbers.push(1);
        numbers.push(2);
    });
    numbers.push(3);
});
// 输出: '3 numbers!'
```

### `untracked`

`untracked` 允许你在没有观察者的情况下运行一段代码。就像 `transaction` ，`untracked` 由 `(@)action` 自动应用，所以通常使用动作要比直接 `untracked` 有意义得多。示例:

```js
const person = observable({
    name: "Rain",
    greet: "Handsome"
});
autorun(() => {
    console.log(
        person.name,
        ",",
        // 这个 untracked 代码块会在没有建立依赖的情况下返回 person 的 greet
        untracked(() => person.greet)
    );
});
// 输出: Rainy, Handsome

person.greet = "Rain120"; // 不输出！

person.name = "Nice boy"; // 输出: Rain120, Nice boy
```

### `createAtom`

实用程序类，可用于创建你自己的 `observable` 数据结构，并将它们连接到 `MobX`。在所有 `observable` 数据类型的内部使用。

### `getAtom`

用法: `getAtom(thing, property?)` 。返回给定的 observable 对象、属性、reaction 等的背后作用的`Atom`。