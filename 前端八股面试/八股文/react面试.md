# react18核心源码

- react fiber架构
- concurrent mode并发模式
- scheduler调度器
- automatic batching自动批处理
- suspense lazy loading
- hook system
- reconcliation 协调算法
- server components服务器组件
- 服务端渲染
- 

# redux核心源码

- createStore
- combineReducers
- applyMiddleware

# React设计思路，它的理念是什么，跟vue有什么异同

- 声明式编程
- 组件化
- 单项数据流
- 虚拟DOM



# 什么是react的事件机制，和普通事件有什么区别，解释其原理

react的事件机制

- 合成事件
- 事件委托
- 跨浏览器兼容性
- 事件池化

与普通事件的区别

- 事件绑定方式
- 跨浏览器一致性
- 性能优化

react事件机制的原理

- 事件委托
- 事件池化
- 批量更新



# ReactComponent和ReactPureComponent的区别

- shouldComponentUpdate，是否进行浅层比较
- 渲染逻辑，React.component每次props和state变化都会触发render
- 使用场景： purecomponent可以通过浅层比较，避免不必要的渲染，提升性能，深层次的变化可能，可能导致问题

# 什么是React的高阶组件， 与普通组件的区别，什么场景使用

高阶组件，接受组件作为输入并返回一个新组件的函数，主要用来复用逻辑或者修改组件的行为么人不改变其原有功能

区别

- 性质不同
- 代码复用方式不同
- 工作方式不同



场景不同

- 逻辑复用
- 增强组件功能
- 条件渲染

# 在react中，哪些方法或者操作会触发组件的重新渲染？ 当一个组件重新渲染时，render函数内部会发生什么

触发组件重新渲染的操作

- state的变化
- props的变化
- forceUpdate方法
- context变化
- 父组件重新渲染
- hooks触发的更新

render函数内部的行为

1. Virtual DOM的创建
2. 对比（Reconciliation）
3. DOM更新 Patch
4. 子组件渲染
5. jsx解析元素树

# 如何避免React中的不必要的渲染，以提高应用性能

- 使用memo优化函数组件
- shouldComponentUpdate声明周期方法
- 使用pureCompoent
- 避免render函数中创建新对象或者函数
- 使用useMemo缓存计算结果
- 优化状态更新策略
- 避免再useEffect中直接触发状态更新

# setState在React中的调用原理是什么？ 调用setState后，React内部发生了什么

- setState是异步的

- 批处理机制

  1. 将更新放入队列中
  2. 标记组件为脏组件
  3. 触发重新渲染和调度更新
  4. Virtual DOM的更新
  5. 声明周期方法的调用

  

# setState调用的过程是同步的还是异步的



React18后都是异步的了，但在并发模式下，setState更新被进一步优化，并发模式允许React在需要是打断渲染任务，优先处理用户交互，确保页面更加流畅



## React中setState的批量更新过程具体是如何实现的

通过合并状态更新来优化性能，减少多次不必要的渲染



## React的生命周期包括哪些阶段，每个阶段有哪些方法

挂载阶段

- constructor
- render
- componentDidMount

更新阶段

- shouldCompoentUpdate
- render
- componentDidUpdate

卸载阶段

- componentWillUnmount



## 在React的哪个生命周期阶段可以进行性能优化，这种优化的原理是什么

shouldComponentUpdate

浅层对比新旧props，state，可以避免不必要的渲染

PureComponent



## 什么是React的严格模式，有什么作用

一种在开发阶段识别潜在问题的一种工具，确保符合未来React的最佳实践



## React中的组件间通信的方式有哪些？各适用于什么场景

- props父子组件通信
- 回调props子父通信
- 状态提升兄弟组件
- context API
- 全局状态管理 Redux等
- 事件总线



## React-Router的实现原理是什么， 他是如何在React应用中管理应用的

核心原理是通过监听URL的变化，动态渲染与当前路径匹配的组件，从而实现单页面中的路由管理

- History API
- 路由匹配机制
- 动态渲染组件
- 嵌套路由



## 对Redux的理解是什么。主要解决了什么问题

管理应用状态的JavaScript库，主要解决了复杂应用中组件之间共享和管理状态的难题

- 状态管理的复杂性
- 可预测的状态流
- 调试难度
- 状态同步



## Redux的工作原理及流程是怎么样的

工作原理

- 全局状态管理
- 单项数据流

核心流程

- 初始化应用
- 组件发出action
- reducer处理action
- store更新状态
- 通知订阅者



## 在Redux中，异步请求应该如何处理， Redux中间件是什么，如何编写Redux中间件

中间件是一段在dispatch被发出和达到热度二之前执行的代码，作用是增强dispatch的功能，使其能够处理异步操作或者其他副作用

编写步骤

- 接受store作物参数
- 返回next函数
- 返回action处理函数
- 合适时机调用next





## Redux状态管理器与全局对象来保存数据有什么不同

- 单项数据流
- 状态不可变性
- 中间件的处理和异步操作
- 可预测性和调试
- 状态的组织和模块化
- 数据流和同步

redux提供了结构化的状态管理框架，使得状态的更新过程透明，可预测，并且状态管理逻辑集中可扩展



