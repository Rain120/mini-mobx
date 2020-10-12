#### Atom 实现原理

```ts
export interface IAtom extends IObservable {
  reportObserved(): boolean;
  reportChanged(): void;
}

export class Atom implements IAtom {
  constructor(public name: string) {}

  diffValue = 0;

  observers = new Set<IDerivation>();

  lowestObserverState: IDerivationState = IDerivationState.NOT_TRACKING;

  // 调用此方法以通知 mobx 你的原子已被某种方式使用。如果当前存在反应上下文, 则返回 true。
  reportObserved(): boolean {
    // return reportObserved(this);
    console.log('reportObserved');
    return true;
  }

  // 调用此方法 _after_ 此方法已更改为向 mobx 发出信号, 告知其所有观察者都应使其无效。
  reportChanged(): void {
    // 无 inBatch 下, 值的改变引起的会先加锁, 调用 onBecomeStale 会在 runReactions 会拦截住
    // 在 endBatch 中会再调 runReactions 来处理 reaction
    console.log('reportChanged');
  }

  public toString(): string {
    return this.name;
  }
}
```
