### autorun 实现原理

```ts
class Reaction {
  // run(执行) reaction
  schedule() {}

  // 执行提供的函数 f 并跟踪正在访问的可观察对象
  // 会在全局存储正在跟踪的衍生对象 trackingDerivation
  track(fn) {}

  // dispose(处理) reaction
  getSchedule() {
    // dispose
  }
}
```

`More Info Here` [👉👉👉](../../src/core/reaction.ts)
