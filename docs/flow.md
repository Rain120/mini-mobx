### flow

它的工作原理与 `async` / `await` 是一样的。只是使用 `function *` 来代替 `async`，使用 `yield` 代替 `await` 。使用 `flow` 的优点是它在语法上基本与 `async` / `await` 是相同的 (只是关键字不同)，并且不需要手动用 `@action` 来包装异步代码，这样代码更简洁。

`flow` 只能作为函数使用，不能作为装饰器使用。`*flow*` 可以很好的与 MobX 开发者工具集成，所以很容易追踪 `async` 函数的过程。

```js
mobx.configure({ enforceActions: true })
class Store {
    @observable githubProjects = []
    @observable state = "pending"
    fetchProjects = flow(function * () { // <- 注意*号，这是生成器函数！
        this.githubProjects = []
        this.state = "pending"
        try {
            const projects = yield fetchGithubProjectsSomehow() // 用 yield 代替 await
            const filteredProjects = somePreprocessing(projects)
            // 异步代码块会被自动包装成动作并修改状态
            this.state = "done"
            this.githubProjects = filteredProjects
        } catch (error) {
            this.state = "error"
        }
    })
}
```

