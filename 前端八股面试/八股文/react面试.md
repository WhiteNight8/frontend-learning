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



## redux与mobx，vuex有什么区别，，共有的设计思想是什么，如何选择

区别

- redux 基于单项数据流和不可变状态管理，应用的所有状态存储在一个全局对象中，只能通过action修改状态
- mobx：基于响应式编程，自动追踪和响应式依赖关系，状态时可变的，可以通过观察和动作直接修改
- vuex： 专门为vue设计的单向数据流，所有状态通过store管理

设计思想

- 状态集中管理
- 单项数据流
- 开发工具支持



## 什么是react hooks，为什么引入

允许在不编写类组件的情况下使用状态和其他特性

引入原因

- 简化类组件的复杂性
- 复用逻辑
- 更细粒度的控制副作用
- 函数组件变得强大
- 向下兼容



## useState和类组件的state有什么区别

- 基本概念
- 使用场景和优缺点
- 状态更新机制



## 自定义hook是什么，如何创建自定义hook

一种在react中复用逻辑的机制

- 定义hook
- 使用自定义hook



## 解释useCallback和useMemo的区别和使用场景

- usecallback缓存函数

- usememo缓存计算结果

  usecallback使用场景： 避免不必要的函数重新创建，尤其在子组件依赖于传递的回调函数时

  usememo的使用场景： 避免昂贵的计算在每次渲染时重复进行，只有在依赖项变化时才会重新计算值，通常用来缓存一些复杂的计算结果

  

## 描述useEffect和useLayoutEffect的不同以及使用场景

- 执行时机不同，useEffect在DOM更新后异步执行， useLayoutEffect在DOM更新后同步执行
- 使用场景，useEffect适用于大部分副作用操作，useLayoutEffect使用于需要在DOM更新后立即执行副作用的场景



## 使用react hooks时需要遵守哪些规则和限制

- 只在函数组件或者自定义hooks使用
- 只能在顶层调用hooks
- 必须以use开头
- 遵循hook的依赖数组规则
- 确保清理副作用
- 避免不必要的useCallback和useMemo
- 确保hook调用顺序保持一致





## 解释React如何追踪Hook的状态，hooks的原理是什么

react使用一个链表或者数组来存储每个组件的hook状态，这个结构类似一个全局的状态存储容器，每次渲染，react依赖容器维护hooks的状态

内部工作流程

1. 首次渲染
2. 后续渲染
3. 状态更新过程



## 什么是react fiber，它如何改善了react应用的性能

fiber是react中一种新刀递归算法，专门用于协调和渲染组件

- 协调阶段： 可中断
- 提交阶段： 同步的

fiber将组件的更新过程分成多个fiber单元，这些单元类似链表节点，每个组件或者DOM元素都有一个对应的fiber节点，fiber节点记录了组件的当前状态，需要更新的内容等信息，并且可以作为更新任务的单位来处理

- 时间切片
- 可中断的更新
- 优先级调度
- 任务重用与恢复

性能提升

- 提升界面响应速度
- 更高效的任务调度
- 平滑的动画和过渡效果
- 大型组件书的渲染优化



## 在react fiber中，什么是fiber节点，它如何与传统的虚拟DOM元素相比

fiber是虚拟DOM的增强版，不仅描述了UI结构，还记录了组件的状态，任务的优先级，更新队列等信息，使得react能够实现可中断，可恢复，优先级调度的渲染过程。



## React fiber的协调算法与之前有什么不同

- 增量渲染
- 可终端的渲染
- 优先级调度
- 链表结构的遍历方式
- 双缓冲
- 协调阶段和提交阶段的分离
- 任务重用



## 什么是虚拟DOM，以及它如何帮助提升React应用的性能的

本质上是一个JavaScript对象，对实际DOM结构的抽象

- 减少对真实DOM的操作
- 高效的diff算法
- 批量更新
- 异步更新和fiber
- 最小化重绘和回流



## React的diff算法是如何工作的，解释它如何比较两个虚拟DOM

- 同类型节点之间的比较
- 同层级比较
- 通过key优化同级节点的比较





## React在处理列表时为什么推荐使用唯一的key属性，这与diff算法有什么关系

- 帮助唯一标识元素
- diff算法更高效的工作
- 避免顺序变化引起的不必要渲染
- 



## React18引入了哪些重要的新特性，简单介绍



## 在react17中，事件处理机制经历了哪些变化？与之前相比，事件委托的处理有何不同



## React引入了自动批处理，解释什么是批处理，以及批处理如何改善了React应用的性能



## React18引入了新的协调器concurrent mode，请从源码角度解释concurrent mode的工作原理是什么





