### autorun 实现原理

```ts
autorun(view: () => void) {
  const reaction = new Reaction(function() {
    this.track(view);
  });

  reaction.schedule();

  return reaction.getSchedule();
}
```

`More Info Here` [👉👉👉](../../src/api/autorun.ts)
