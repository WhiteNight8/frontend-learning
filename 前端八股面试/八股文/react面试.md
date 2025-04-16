![image-20250325151944787](C:/Users/27019/AppData/Roaming/Typora/typora-user-images/image-20250325151944787.png)

# react18核心源码

- react fiber架构

  1. Fiber节点： 每个react元素对应一个Fiber节点，是一个轻量级的JavaScript对象，保存了组件的类型，状态，子组件引用等信息。 Fiber节点用于表示虚拟DOM树的每一层
  2. 双缓存机制： FIber架构采用双换从技术，将虚拟DOM树分为两部分， current fiber tree，当前已经渲染的fiber树； work-in-progress fiber tree 正在构建的fiber树，渲染完成后两种进行替换
  3. 异步可中断渲染： fiber允许将渲染任务分片，处理过程可以暂停，继续，取消， 以响应高优先级 任务，通过调度机制实现
  4. 优先级调度： React为不同任务分配优先级， 高优先级任务，输入，点击等； 低优先级任务，DOM更新，动画渲染

- React核心模块

  1. React Core 提供核心API ，负责定义组件和元素的基本行为
  2. React Reconciler： 负责比较当前fiber树与新生成虚拟DOM的节点差异，决定需要更新的部分； 更新策略： 采用单节点更细和树形结构复用
  3. React Renderer： 将虚拟DOM映射到特定平台，React DOM，负责将fiber树转化为真实的DOM树
  4. React Scheduler： 任务切片： 将大任务分为多个小任务，避免阻塞主线程； concurrent mode： 启用并发渲染， 提高性能和用户体验

- React 核心原理

  1. 虚拟DOM： 通过虚拟DOM抽象真实DOM操作， 提升性能
  2. Reconciliation 协调： 核心是diff算法
  3. fiber的工作流程： render阶段：生成新的fiber树，找出需要更新的部分，异步可中断； commit阶段： 将更新应用到真实的DOM，同步的，before mutation， mutation，layout
  4. 事件机制：React的事件系统是基于SyntheticEvent实现的： 合成事件； 事件代理
  5. 调度机制： 优先级分类； 调度算法

- React核心源码分析

  1. 初始化渲染： 创建fiber根节点； 调用sheduleUpdateOnFiber，将更新任务放入调度队列； 开始调度工作，执行fiber构建
  2. setState原理： 生成更新对象；将更新对象放入更新队列； 标记fiber节点为需要更新，并触发调度器； 进入协调阶段，构建新的fiber树； 进入提交阶段，更新真实DOM

  

  React.createElement: JSX到虚拟DOM的转换

  ReactFiber: fiber节点定义与构建逻辑

  ReactReconciler： 协调逻辑和diff算法

  ReactDom： 虚拟DOM到真实DOM的映射

  Scheduler: 调度器的实现

  

  

  

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



## React18引入了哪些重要的新特性，简单介绍

- 并发渲染
- 自动批处理
- transition api
- suspense for data fetching
- 严格模式增强
- useID



## 在react17中，事件处理机制经历了哪些变化？与之前相比，事件委托的处理有何不同

- 事件绑定位置的变化
- 捕获和冒泡阶段的细节优化
- react事件和原生事件的混合使用改进
- 停止事件冒泡的行为改变



## React引入了自动批处理，解释什么是批处理，以及批处理如何改善了React应用的性能

是指将多次状态更新合成一次渲染过程，而不是每次状态更新后都重新触发渲染

1. 减少不必要的渲染
2. 提高用户体验
3. 优化资源利用
4. 支持异步操作



## React18引入了新的协调器concurrent mode，请从源码角度解释concurrent mode的工作原理是什么

- 任务优先级调度
- 任务分片
- 可中断渲染
- suspense和并发数据处理

只要依赖调度器，fiber架构

车道模型



# 1. React Fiber 架构的设计理念及其解决的问题

React Fiber 是 React 16 引入的一种新的内部重构，它的核心设计理念是实现增量渲染，使渲染过程可中断且可恢复。

## 设计理念

1. **增量渲染**: 将渲染工作分割成小块，可以分散到多个帧中执行
2. **优先级**: 不同类型的更新可以分配不同的优先级
3. **可中断与恢复**: 渲染过程可被更高优先级的任务中断，稍后再恢复
4. **复用与回退**: 能够复用之前的工作成果，必要时可以丢弃已完成的工作

## 解决的问题

1. **长时间任务阻塞主线程**: 在 React 15 及之前，一旦开始渲染过程就不能中断，导致大型组件树渲染时可能阻塞主线程，影响用户交互和动画流畅度
2. **不同任务间缺乏优先级区分**: 无法区分高优先级（如用户输入）和低优先级（如数据更新后的界面重绘）任务
3. **同步渲染的局限性**: 递归同步渲染模式限制了异步渲染的可能性

Fiber 架构通过重新实现核心算法，创建了一个可中断的渲染更新流程，解决了上述问题，提高了应用性能和用户体验。



# 2. 深入分析 Fiber 协调过程：reconciliation 与 commit 阶段详解

Fiber 协调过程分为两个主要阶段：协调阶段(Reconciliation/Render Phase)和提交阶段(Commit Phase)。

## 协调阶段 (Reconciliation/Render Phase)

这个阶段是可中断的，主要工作包括：

1. **创建 Fiber 节点**: 为组件创建对应的 Fiber 节点，构建 Fiber 树
2. **对比差异(Diffing)**: 对比当前 Fiber 树与上一次渲染的 Fiber 树的差异
3. **收集副作用(Effects)**: 标记需要进行DOM操作的节点
4. **调度工作**: 根据优先级调度后续工作

关键函数:

- `beginWork()`: 从父到子，创建 Fiber 节点并构建树
- `completeWork()`: 从子到父，完成节点处理，收集副作用

## 提交阶段 (Commit Phase)

这个阶段是不可中断的，一次性完成，主要工作包括：

1. **执行前置操作**: 处理类组件的 `getSnapshotBeforeUpdate` 生命周期
2. **DOM变更**: 根据协调阶段收集的副作用，执行DOM操作(插入、更新、删除)
3. **执行后置操作**: 运行生命周期方法和Hooks副作用函数

关键函数:

- `commitBeforeMutationEffects()`: 执行DOM变更前的操作
- `commitMutationEffects()`: 执行DOM变更
- `commitLayoutEffects()`: 执行DOM变更后的操作

整个过程采用双缓冲技术，`current`树代表当前屏幕显示的状态，而`workInProgress`树是正在构建的新状态。完成后，两者角色互换，确保渲染过程的一致性。

# 3. React 调度器 (Scheduler) 的实现原理及优先级管理机制

React 调度器是 Fiber 架构的核心部分，负责管理和执行工作单元。

## 实现原理

1. **任务队列**: 维护多个优先级任务队列
2. **时间切片**: 使用`requestIdleCallback`或其 polyfill 实现时间切片
3. **任务中断与恢复**: 根据剩余时间决定是否中断当前任务
4. **任务优先级**: 根据不同的更新类型分配不同的优先级

## 优先级管理机制

React 调度器定义了几种优先级级别：

1. **Immediate**: 最高优先级，同步执行，不会被打断
2. **UserBlocking**: 用户交互触发的更新，如点击、输入（250ms 超时）
3. **Normal**: 普通优先级，如网络请求后的数据更新（5000ms 超时）
4. **Low**: 低优先级，可延迟的任务（10000ms 超时）
5. **Idle**: 最低优先级，闲置时才执行，无超时

调度器会根据任务优先级和过期时间决定下一个执行的任务。高优先级任务可以打断正在进行的低优先级任务，被中断的任务会在之后继续执行。

核心机制:

- **时间分片**: 将长任务分成小片段执行，每个时间片大约 5ms
- **任务排序**: 按照优先级和过期时间对任务进行排序
- **任务饥饿预防**: 低优先级任务也有超时机制，防止一直得不到执行

# 4. 从源码角度解析时间分片 (Time Slicing) 的实现方式

时间分片是 React Fiber 架构的核心特性，它使 React 能够将渲染工作分割到多个帧中。

## 实现原理

1. **工作循环**: React 使用`workLoop`函数实现主工作循环

javascript

```javascript
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  if (!nextUnitOfWork && workInProgressRoot) {
    // 完成所有工作，进入提交阶段
    commitRoot();
  }
  
  // 安排下一次工作
  requestIdleCallback(workLoop);
}
```

1. **时间片检查**: 通过检查剩余时间决定是否中断当前工作

javascript

```javascript
shouldYield = deadline.timeRemaining() < 1;
```

1. **任务调度**: 使用 `requestIdleCallback` 或自定义的 scheduler 实现

javascript

```javascript
// React 的 scheduler polyfill 简化版
const scheduler = window.requestIdleCallback || function(callback) {
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
};
```

1. **Fiber 节点处理**: 每个 Fiber 节点作为一个工作单元，可以独立处理

javascript

```javascript
function performUnitOfWork(fiber) {
  // 处理当前 fiber
  // ...
  
  // 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
  
  return null;
}
```

通过这种实现，React 能够在每一帧的空闲时间内执行一部分渲染工作，当没有足够时间时主动让出控制权，确保主线程不被长时间占用，提高应用的响应性。

# 5. 并发模式 (Concurrent Mode) 的内部机制及其应用场景

并发模式是 React 的一个实验性功能，在 React 18 中正式发布。它基于 Fiber 架构，进一步增强了 React 的并发处理能力。

## 内部机制

1. **并发渲染**: 允许多个渲染任务同时存在，根据优先级切换
2. **选择性暂停**: 可以暂停低优先级任务，优先完成高优先级任务
3. **后台预渲染**: 在后台预渲染低优先级内容，不阻塞用户交互
4. **可中断渲染**: 一个渲染过程可以被打断并稍后恢复
5. **可丢弃渲染**: 进行中的渲染可以被丢弃，用新的渲染替代

核心 API:

- `startTransition`: 标记非紧急更新
- `useTransition`: Hook 版本，提供 pending 状态
- `useDeferredValue`: 延迟处理某个值的变化

## 应用场景

1. **数据交互界面**: 在保持界面响应的同时处理大量数据
2. **搜索和过滤**: 在用户输入时不阻塞界面
3. **分页加载**: 在加载下一页数据时保持当前页面的交互性
4. **大型表单**: 在复杂表单中保持输入流畅
5. **动画过渡**: 在数据更新时提供流畅的过渡效果

使用示例:

javascript

```javascript
function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);
  
  function handleChange(e) {
    // 紧急更新：更新输入框
    const value = e.target.value;
    
    // 非紧急更新：搜索结果计算
    startTransition(() => {
      setResults(searchData(value));
    });
  }
  
  // ...
}
```

并发模式让 React 应用在处理复杂交互和大量数据时保持流畅，提高用户体验。



