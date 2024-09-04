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



# 在react中，哪些方法或者操作会触发组件的重新渲染？ 当一个组件重新渲染时，render函数内部会发生什么



# 如何避免React中的不必要的渲染，以提高应用性能



# setState在React中的调用原理是什么？ 调用setState后，React内部发生了什么



# setState调用的过程是同步的还是异步的



