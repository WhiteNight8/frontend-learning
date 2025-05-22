## React Fiber架构解析

### React Fiber架构的设计理念及其解决的问题

**设计理念**

- 增量渲染：将渲染工作分解为多个小单元，可以中断和恢复，而不是一次性完成整个渲染过程
- 优先级管理： 为不同类型的更新分配不同的优先级
- 可中断和可恢复：长时间运行的任务可以被中断，让浏览器处理更高优先级的事件
- 并发性：多个状态更新可以并发运行并不会互相阻塞

**解决的问题**

- 渲染过程不可中断
- 没有任务优先级概念
- 组件更新的瓶颈
- 同步渲染的限制

**Fiber数据结构**

Fiber一种新的数据结构，每个Fiber节点对应一个React元素，并包含该元素的类型，props和状态等信息

```js
{
        tag:WorkTag,
        key:null||string,
        elementType:any,
        type:any,
       	stateNode:any,
        
        return:Fiber | null,
        child:Fiber| null,
        sibling:Fiber| null,
            
        index:number,
            
        pendingProps:any,
        memoizeProps:any,
            
        updateQueue: UpdateQueue<any> | null,
            
        meoizdState:any,
        
        dependencies: Dependencies | null
    
    	flags:Flags,
         subtreeFlags:Flags,
         deletions: Array<Fiber> | null,
         
         lanes:Lanes,
         childLanes:Lanes
         
         alternate:Fiber | null
}
```



### 深入分析Fiber协调过程，reconciliation和commit阶段

React Fiber的工作流程主要分为两个阶段： reconciliation协调阶段，commit阶段

**Reconciliation阶段**

可中断

- 创建或更新Fiber节点：基于当前的props，state和上下文构建新的Fiber树
- 调用生命周期方法
- 对比新旧Fiber树
- 收集副作用：标记需要在DOM上执行的操作

Reconciliation 阶段的核心函数是 `workLoopConcurrent`：

```js
function workLoopConcurrent() {
  // 当有工作单元并且时间片没有用完时，继续处理
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

**commit阶段**

- 执行副作用：根据reconciliation阶段收集的副作用列表，执行DOM操作
- 调用生命周期方法
- 调用userEffect/useLayoutEffect

commit阶段可以分为三个子阶段

1. before mutation：读取DOM状态，调用getSnapshotBeforeUpdate生命周期
2. Mutation：执行DOM插入，更新，删除操作
3. Layout：更新refs，调用componentDidMount/componentDidUpdate，执行useLayoutEffect

这个阶段的核心函数是 `commitRoot`

```js
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  // 预处理副作用列表
  let firstEffect = finishedWork.firstEffect;
  
  // 阶段1: DOM 变更前
  commitBeforeMutationEffects(firstEffect);
  
  // 阶段2: DOM 变更
  commitMutationEffects(root, firstEffect);
  
  // 此时 DOM 已经更新，设置当前渲染树为最新树
  root.current = finishedWork;
  
  // 阶段3: DOM 变更后
  commitLayoutEffects(firstEffect);
  
  // 安排异步副作用（useEffect）
  schedulePassiveEffects(finishedWork);
}
```

**双缓存技术**

Fiber架构使用双缓存技术，维护两棵树

1. current树：表示当前已经渲染到屏幕上的状态
2. workInProgress树： 表示正在构建的新状态

### React调度器scheduler的实现原理和优先级管理机制

**调度器的实现原理**

React的调度器是Scheduler是一个独立的包，负责调度任务的执行。核心功能

- 时间分片：将长任务拆分成小片段，每个片段执行时间有限制
- 任务队列：维护不同优先级的任务队列
- 协作式调度：定期让出主线程控制权，检查是否有高优先级任务需要执行

**任务优先级和过期时间**

每个任务都有一个优先级和一个过期时间。过期时间根据优先级计算，高优先级任务的过期时间更短，确保它们能更快被处理

```js
function unstable_scheduleCallback(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  
  // 根据优先级和可选的延迟计算开始时间
  let startTime;
  if (typeof options === 'object' && options !== null && options.delay > 0) {
    startTime = currentTime + options.delay;
  } else {
    startTime = currentTime;
  }
  
  // 根据优先级计算超时时间
  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  
  // 计算任务过期时间
  const expirationTime = startTime + timeout;
  
  // 创建新任务
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  
  // 设置排序索引
  if (startTime > currentTime) {
    // 这是一个延迟任务
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    // 启动或重置定时器
    // ...
  } else {
    // 这是一个需要立即执行的任务
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // 如果需要，请求新的工作循环
    // ...
  }
  
  return newTask;
}
```

**任务调度循环**

调度器使用requestIdleCallback来在浏览器空闲时执行任务。React使用了MessageChannel作为requestIdleCallback的polyfill

```js
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}

function performWorkUntilDeadline() {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    // 确定当前帧的截止时间
    deadline = currentTime + yieldInterval;
    const hasTimeRemaining = true;
    
    try {
      // 执行回调并确定是否有更多工作要做
      const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
      
      if (!hasMoreWork) {
        // 没有更多工作，停止消息循环
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      } else {
        // 还有工作要做，安排下一个消息
        port.postMessage(null);
      }
    } catch (error) {
      // 如果有错误，安排下一个消息并重新抛出
      port.postMessage(null);
      throw error;
    }
  } else {
    isMessageLoopRunning = false;
  }
}
```

**优先级管理机制**

React定义了几种不同的优先级级别，用于区分不同类型的更新

- Immediate Priority：立即优先级，需要同步执行的任务，用户输入，点击事件等
- User Blocking Priority： 用户阻塞优先级，需要快速反馈的任务，拖动，滚动事件等
- Normal Priority：普通优先级，不需要立即响应的任务，网络请求后的更新等
- Low Priority：低优先级，可以延迟执行的任务，数据预加载等
- Idle Priority：空闲优先级，可以无限延迟的任务，隐藏内容的渲染等

React17以后，使用了基于lanes的优先级模型，使用位运算各高校处理优先级

```js
// 定义不同的优先级车道
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

// 同步车道
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;

// 连续事件车道
export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane: Lane = /*            */ 0b0000000000000000000000000000100;

// 默认车道
export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane: Lane = /*                    */ 0b0000000000000000000000000010000;

// 过渡车道
export const TransitionHydrationLane: Lane = /*         */ 0b0000000000000000000000000100000;
export const TransitionLanes: Lanes = /*                */ 0b0000000000000000000011111000000;
```

Scheduler 使用过期时间来确保任务不会被无限期地延迟。即使低优先级任务，如果等待时间过长，也会被提升优先级执行。这种机制确保了所有任务最终都能完成，避免"饿死"低优先级更新。



### 从源码角度分析时间分片的实现方式

时间分片，允许React将长时间运行的任务分解为小块，从而可以中断和恢复渲染过程

**核心实现机制**

核心思想是让渡：在处理一个工作单元检查是否应该暂停工作，让出控制权给浏览器处理更高优先级的任务

- shouldYield函数

  这个函数决定是否应该暂停当前工作

  ```js
  function shouldYield() {
    // 获取当前时间
    const currentTime = getCurrentTime();
    
    // 如果当前时间超过了截止时间，就应该暂停
    if (currentTime >= deadline) {
      // 有过期任务需要立即处理
      if (needsPaint || scheduler.shouldYieldToHost()) {
        return true;
      }
      // 延长截止时间
      // ...
    }
    
    return false;
  }
  ```

- workLoopConcurrent函数

  工作循环函数会定期检查是否应该暂停

  ```js
  function workLoopConcurrent() {
    // 当有工作单元并且不应该暂停时，继续处理
    while (workInProgress !== null && !shouldYield()) {
      // 处理一个工作单元
      performUnitOfWork(workInProgress);
    }
  }
  ```

- performUnitOfWork函数

  处理单个Fiber节点的工作

  ```js
  function performUnitOfWork(fiber) {
    // 获取备用节点（alternate）
    const current = fiber.alternate;
    
    // 处理当前 fiber 并返回下一个工作单元
    let next;
    
    // 使用 Profile 记录渲染时间
    // ...
    
    // 开始工作
    next = beginWork(current, fiber, renderLanes);
    
    // ...调试相关代码
    
    // 清除挂起的 props
    fiber.pendingProps = null;
    
    if (next === null) {
      // 如果没有子节点，我们可以完成这个 fiber
      completeUnitOfWork(fiber);
    } else {
      // 否则继续处理子节点
      workInProgress = next;
    }
  }
  ```

- 时间片大小控制

  React默认时间片大小为5ms

**中断与恢复机制**

当工作被中断时，React需要能够在之后恢复。通过保存当前进度和上下文信息来实现的

- 工作队列：保存了待处理的更新
- workInProgress树：保存了部分构建的UI状态
- renderLanes： 标记了当前处理的优先级级别

当React恢复工作时，会从上次停止的地方继续，使用保存的上下文信息

**时间分片的实际效果**

- 保持UI响应：即使在进行大量渲染工作时，用户的点击、输入等高优先级交互能够及时响应
- 减少卡顿：通过将长任务分解为多个小任务，避免长时间占用主线程
- 优先处理重要更新：先处理用户交互等高优先级更新，再处理数据加载等低优先级更新



### 并发模式的内部机制及其应用场景

并发模式是React的一种新的渲染模式，利用Fiber架构提供的可中断渲染能力，让React能够同时准备多个版本的UI，并不是真正的多线程并发，而是通过时间分片和优先级管理实现的协作式多任务处理

**内部机制**

- 启发并发模式

  ```js
  import { createRoot } from 'react-dom/client';
  
  // 启用并发特性
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
  ```

- 并发更新

  ```js
  // 在 React 内部，更新会被标记为不同的优先级
  const DiscreteEventPriority = SyncLane;         // 离散事件（如点击）
  const ContinuousEventPriority = InputContinuousLane; // 连续事件（如拖动）
  const DefaultEventPriority = DefaultLane;      // 默认事件
  const IdleEventPriority = IdleLane;           // 空闲事件
  ```

- 并发特性API

  - useTransition：允许将状态更细标记为非紧急，让紧急更新如用户输入等先执行

  ```js
  function SearchResults() {
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState('');
    
    function handleChange(e) {
      // 紧急更新：更新输入框值
      setSearchQuery(e.target.value);
      
      // 非紧急更新：搜索结果可以稍后显示
      startTransition(() => {
        setSearchResults(computeSearchResults(e.target.value));
      });
    }
    
    // ...
  }
  ```

  - useDeferedValue：为值创建一个延迟版本，优先级较低

    ```js
    function SearchResults({ query }) {
      // deferredQuery 会在浏览器空闲时更新
      const deferredQuery = useDeferredValue(query);
      
      // 使用延迟值来计算结果
      const results = useMemo(
        () => computeSearchResults(deferredQuery),
        [deferredQuery]
      );
      
      // ...
    }
    ```

  - 并发渲染的工作流程

    - **多个渲染分支**：React 可以同时处理多个渲染请求，优先处理高优先级更新
    - **中断和丢弃**：低优先级渲染可以被中断，甚至在有更高优先级更新时被完全丢弃
    - **可恢复渲染**：被中断的渲染可以在之后恢复，不需要从头开始

  **lane模型**

  并发模式使用Lane模型管理优先级，更细粒度的优先级表示方式

  ```js
  // 定义优先级车道
  export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
  export const InputContinuousLane: Lane = /*            */ 0b0000000000000000000000000000100;
  export const DefaultLane: Lane = /*                    */ 0b0000000000000000000000000010000;
  export const TransitionLanes: Lanes = /*                */ 0b0000000000000000000011111000000;
  export const IdleLane: Lane = /*                        */ 0b0100000000000000000000000000000;
  
  // 工作循环中使用车道
  function workLoopConcurrent() {
    while (workInProgress !== null && !shouldYield()) {
      performUnitOfWork(workInProgress);
    }
  }
  
  // 在 beginWork 中基于优先级处理更新
  function beginWork(current, workInProgress, renderLanes) {
    // 使用位运算检查当前工作是否有足够高的优先级
    if ((current.lanes & renderLanes) !== NoLanes) {
      // 处理更新
    } else {
      // 可以重用之前的工作结果
    }
  }
  ```

  **应用场景**

  - 复杂表单和实时搜索

    在用户输入是，可以立即响应输入操作，同时在后台处理搜索逻辑

    ```js
    function SearchComponent() {
      const [query, setQuery] = useState('');
      const [isPending, startTransition] = useTransition();
      const [results, setResults] = useState([]);
      
      function handleChange(e) {
        // 立即更新输入框
        setQuery(e.target.value);
        
        // 在过渡中更新搜索结果
        startTransition(() => {
          // 复杂的搜索逻辑
          setResults(search(e.target.value));
        });
      }
      
      return (
        <>
          <input value={query} onChange={handleChange} />
          {isPending ? <Spinner /> : <SearchResults results={results} />}
        </>
      );
    }
    ```

  - 数据可视化和动态图表

    对于需要处理大量数据的可视化应用，可以先渲染界面框架，然后逐步填充数据

    ```js
    function DataVisualization({ data }) {
      const deferredData = useDeferredValue(data);
      
      // 使用延迟数据计算图表
      const chart = useMemo(() => {
        return <ComplexChart data={deferredData} />;
      }, [deferredData]);
      
      return (
        <div>
          <h1>Data Visualization</h1>
          {data !== deferredData ? <LoadingIndicator /> : null}
          {chart}
        </div>
      );
    }
    ```

  - 分页内容和无限滚动

    可以优先加载视口内的内容，然后再后台准备更多的内容

    ```js
    function InfiniteList() {
      const [visibleItems, setVisibleItems] = useState([]);
      const [isPending, startTransition] = useTransition();
      
      function loadMoreItems() {
        // 立即显示加载状态
        setIsLoading(true);
        
        // 在过渡中加载更多项目
        startTransition(() => {
          const newItems = fetchMoreItems();
          setVisibleItems([...visibleItems, ...newItems]);
          setIsLoading(false);
        });
      }
      
      // ...
    }
    ```

  - 复杂UI更新

    当状态变化导致大规模UI更新时，可以先更新关键部分，后更新次要部分

    ```js
    function ComplexDashboard({ data }) {
      const [isPending, startTransition] = useTransition();
      const [currentTab, setCurrentTab] = useState('overview');
      
      function switchTab(tab) {
        // 立即更新选项卡指示器
        setActiveTab(tab);
        
        // 在过渡中更新选项卡内容
        startTransition(() => {
          setCurrentTab(tab);
        });
      }
      
      // ...
    }
    ```

    并发模式不仅提高了应用的响应性，还简化了开发人员处理复杂交互的工作。通过区分紧急和非紧急更新，React 能够提供更好的用户体验，尤其是在处理大型数据集和复杂 UI 时。

    

### 简易版React Fiber架构

基本数据结构

```js
// Fiber 节点结构
function createFiber(tag, key, pendingProps) {
  return {
    // 实例类型
    tag,
    
    // 唯一标识
    key,
    
    // 元素类型
    type: null,
    
    // DOM 节点
    stateNode: null,
    
    // Fiber 关系
    return: null,  // 父节点
    child: null,   // 第一个子节点
    sibling: null, // 下一个兄弟节点
    
    // 工作状态
    pendingProps,      // 新的属性
    memoizedProps: null, // 旧的属性
    memoizedState: null, // 状态
    updateQueue: null,   // 更新队列
    
    // 副作用
    flags: 0,  // 标记需要进行的 DOM 操作
    
    // 替代 fiber
    alternate: null,  // 指向另一颗树中对应的节点
    
    // 调试信息
    index: 0,
  };
}

// Fiber 标签类型
const HostRoot = 3;     // 根节点
const HostComponent = 5; // 原生 DOM 节点
const FunctionComponent = 0; // 函数组件

// 副作用标记
const Placement = 0b0000000000000000000000010; // 插入
const Update = 0b0000000000000000000000100;    // 更新
const Deletion = 0b0000000000000000000001000;  // 删除
const NoFlags = 0b0000000000000000000000000;   // 无操作
```

创建和更新队列

```js
function createUpdateQueue(baseState) {
  return {
    baseState,
    firstUpdate: null,
    lastUpdate: null
  };
}

function enqueueUpdate(updateQueue, update) {
  // 第一个更新
  if (updateQueue.lastUpdate === null) {
    updateQueue.firstUpdate = updateQueue.lastUpdate = update;
  } else {
    // 追加到队列末尾
    updateQueue.lastUpdate.next = update;
    updateQueue.lastUpdate = update;
  }
  return updateQueue;
}

function createUpdate() {
  return {
    payload: null,
    next: null
  };
}

function processUpdateQueue(updateQueue) {
  const firstUpdate = updateQueue.firstUpdate;
  let newState = updateQueue.baseState;
  
  // 处理队列中的每个更新
  if (firstUpdate !== null) {
    let update = firstUpdate;
    do {
      // 基于以前的状态计算新状态
      const action = update.payload;
      newState = typeof action === 'function' 
        ? action(newState) 
        : action;
        
      update = update.next;
    } while (update !== null);
    
    // 清空队列
    updateQueue.firstUpdate = updateQueue.lastUpdate = null;
  }
  
  updateQueue.baseState = newState;
  return newState;
}

### 3. 调度器实现


// 模拟浏览器的 requestIdleCallback
const IdlePriority = 0;
const ImmediatePriority = 1;
const UserBlockingPriority = 2;
const NormalPriority = 3;
const LowPriority = 4;

let nextUnitOfWork = null;  // 下一个工作单元
let currentRoot = null;     // 当前渲染树
let workInProgressRoot = null; // 正在构建的树
let workInProgressFiber = null; // 当前正在工作的 fiber
let deletions = null;       // 需要删除的节点列表

function scheduleUpdateOnFiber(fiber) {
  // 设置下一个工作单元
  nextUnitOfWork = fiber;
  workInProgressRoot = fiber;
}

// 工作循环 - 可中断
function workLoop(deadline) {
  let shouldYield = false;
  
  // 当有工作且不应该暂停时，继续处理
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    
    // 检查是否应该暂停工作
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  // 如果所有工作已完成，提交更改
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }
  
  // 继续调度工作
  requestIdleCallback(workLoop);
}

// 开始调度
requestIdleCallback(workLoop);

### 4. Fiber 工作单元处理

function performUnitOfWork(fiber) {
  // 1. 添加 DOM 节点
  if (!fiber.stateNode) {
    if (fiber.tag === HostComponent) {
      // 创建 DOM 节点
      fiber.stateNode = document.createElement(fiber.type);
      
      // 设置属性
      updateProperties(fiber.stateNode, fiber.pendingProps, {});
    } else if (fiber.tag === HostRoot) {
      fiber.stateNode = fiber.stateNode || {};
    }
  }
  
  // 2. 创建新的子 Fiber 节点
  reconcileChildren(fiber, fiber.pendingProps.children);
  
  // 3. 返回下一个工作单元
  if (fiber.child) {
    // 如果有子节点，先处理子节点
    return fiber.child;
  }
  
  // 没有子节点，查找兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    // 如果有兄弟节点，处理兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 否则返回父节点
    nextFiber = nextFiber.return;
  }
  
  return null;
}

// 协调子节点
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
  let prevSibling = null;
  
  // 遍历子元素
  while (index < elements.length || oldFiber != null) {
    const element = index < elements.length ? elements[index] : null;
    let newFiber = null;
    
    // 比较新旧节点
    const sameType = oldFiber && element && element.type === oldFiber.type;
    
    if (sameType) {
      // 更新现有节点
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        flags: Update,
      };
    }
    
    if (element && !sameType) {
      // 添加新节点
      newFiber = createFiber(
        typeof element.type === 'string' ? HostComponent : FunctionComponent,
        element.key,
        element.props
      );
      newFiber.type = element.type;
      newFiber.return = wipFiber;
      newFiber.flags = Placement;
    }
    
    if (oldFiber && !sameType) {
      // 删除旧节点
      oldFiber.flags = Deletion;
      deletions.push(oldFiber);
    }
    
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    // 添加到 fiber 树
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    
    prevSibling = newFiber;
    index++;
  }
}

// 更新 DOM 属性
function updateProperties(dom, newProps, oldProps) {
  // 处理事件监听器和属性...
  Object.keys(newProps).forEach(key => {
    // 不处理子节点
    if (key === 'children') return;
    
    // 处理特殊属性和事件
    if (key.startsWith('on')) {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  });
}

### 5. 提交阶段实现

function commitRoot() {
  // 提交删除操作
  deletions.forEach(commitWork);
  
  // 提交添加和更新操作
  commitWork(workInProgressRoot.child);
  
  // 保存当前完成的树作为"上一个"树
  currentRoot = workInProgressRoot;
  
  // 清除工作进度
  workInProgressRoot = null;
  deletions = [];
}

function commitWork(fiber) {
  if (!fiber) return;
  
  // 找到最近的有 DOM 节点的父 fiber
  let parentFiber = fiber.return;
  while (parentFiber && !parentFiber.stateNode) {
    parentFiber = parentFiber.return;
  }
  
  const parentDom = parentFiber.stateNode;
  
  // 根据标记执行 DOM 操作
  if (fiber.flags & Placement && fiber.stateNode) {
    // 新增节点
    parentDom.appendChild(fiber.stateNode);
  } else if (fiber.flags & Update && fiber.stateNode) {
    // 更新节点
    updateProperties(fiber.stateNode, fiber.pendingProps, fiber.memoizedProps);
  } else if (fiber.flags & Deletion) {
    // 删除节点
    commitDeletion(fiber, parentDom);
    return; // 注意：不继续处理子节点
  }
  
  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, parentDom) {
  if (fiber.stateNode) {
    parentDom.removeChild(fiber.stateNode);
  } else {
    // 对于没有 DOM 节点的组件，递归查找
    commitDeletion(fiber.child, parentDom);
  }
}

### 6. 创建更新的 API

// 创建应用程序
function createFiberRoot(container) {
  const root = {
    current: createFiber(HostRoot, null, { children: [] }),
    containerInfo: container,
  };
  root.current.stateNode = root;
  return root;
}

// 渲染函数
function render(element, container) {
  // 创建或获取 fiber 根节点
  const root = container._reactRootContainer || 
               (container._reactRootContainer = createFiberRoot(container));
  
  // 创建更新
  const update = createUpdate();
  update.payload = { element };

  // 将 Element 添加到更新队列
  if (!root.current.updateQueue) {
    root.current.updateQueue = createUpdateQueue({ element });
  }
  enqueueUpdate(root.current.updateQueue, update);
  
  // 设置替代节点
  const current = root.current;
  const workInProgress = createFiber(HostRoot, null, { children: [element] });
  workInProgress.stateNode = root;
  workInProgress.alternate = current;
  current.alternate = workInProgress;
  
  // 开始调度更新
  scheduleUpdateOnFiber(workInProgress);
}
```



### 批处理的实现原理

批处理是React性能优化的重要机制，将多个状态更新合并一次重新渲染。React18以后自动批处理，使得批处理再所有情况下都能自动执行

**批处理的意义**

可以显著提高性能，避免不必要的重复渲染

**实现原理**

- 批处理入口点

  ```js
  function ensureRootIsScheduled(root, currentTime) {
    const existingCallbackNode = root.callbackNode;
    
    // 检查是否有高优先级任务取消旧的任务
    // ...
    
    // 确定新任务的优先级
    const newCallbackPriority = getHighestPriorityLane(nextLanes);
    
    // 如果已有相同优先级的任务，批处理到一起
    if (existingCallbackNode !== null) {
      const existingCallbackPriority = root.callbackPriority;
      if (existingCallbackPriority === newCallbackPriority) {
        // 已经调度了同优先级的任务，无需再次调度
        return;
      }
      // 取消之前的任务
      cancelCallback(existingCallbackNode);
    }
    
    // 调度新的任务
    let newCallbackNode;
    if (newCallbackPriority === SyncLane) {
      // 同步任务
      newCallbackNode = scheduleSyncCallback(
        performSyncWorkOnRoot.bind(null, root)
      );
    } else {
      // 异步任务
      const schedulerPriorityLevel = lanePriorityToSchedulerPriority(newCallbackPriority);
      newCallbackNode = scheduleCallback(
        schedulerPriorityLevel,
        performConcurrentWorkOnRoot.bind(null, root)
      );
    }
    
    // 保存任务节点和优先级
    root.callbackPriority = newCallbackPriority;
    root.callbackNode = newCallbackNode;
  }
  ```

- React18中的批处理控制

  transition过度上下文，用于控制批处理和任务优先级

  ```js
  // 简化的批处理控制对象
  const ReactCurrentBatchConfig = {
    transition: null,
  };
  
  // 开始批处理
  export function batchedUpdates(fn, a) {
    const prevTransition = ReactCurrentBatchConfig.transition;
    try {
      ReactCurrentBatchConfig.transition = null;
      return fn(a);
    } finally {
      ReactCurrentBatchConfig.transition = prevTransition;
    }
  }
  ```

- 并发更新的批处理

  通过任务调度系统对状态更新进行分组和排序

  ```js
  function dispatchSetState(fiber, queue, action) {
    // 获取当前 fiber 的车道（优先级）
    const lane = requestUpdateLane(fiber);
    
    // 创建更新对象
    const update = {
      lane,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null,
    };
    
    // 尝试"快速路径"：直接计算新状态
    const { lastRenderedReducer } = queue;
    if (lastRenderedReducer !== null) {
      const currentState = queue.lastRenderedState;
      const eagerState = lastRenderedReducer(currentState, action);
      update.hasEagerState = true;
      update.eagerState = eagerState;
      if (Object.is(eagerState, currentState)) {
        // 状态未变化，可以提前终止更新
        return;
      }
    }
    
    // 将更新添加到队列
    const root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    const eventTime = requestEventTime();
    
    // 安排更新，这里会进行批处理
    scheduleUpdateOnFiber(root, fiber, lane, eventTime);
  }
  ```

- 自动批处理的核心改进

  ```js
  function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
    // 检查是否在并发事件中
    if (lane === SyncLane && 
        (executionContext & BatchedContext) !== NoContext && 
        (executionContext & (RenderContext | CommitContext)) === NoContext) {
      // 在批处理上下文中，收集更新但不立即处理
      schedulePendingInteractions(root, lane);
      
      // 注册微任务，在事件循环结束时处理所有更新
      if (currentEventTransitionLane === NoLane) {
        currentEventTransitionLane = lane;
        scheduleMicrotask(() => {
          // 微任务中，进行真正的工作
          flushSyncCallbacks();
          currentEventTransitionLane = NoLane;
        });
      }
      return;
    }
    
    // 标记根节点有待处理的工作
    markRootUpdated(root, lane, eventTime);
    
    // 确保根节点已调度
    ensureRootIsScheduled(root, eventTime);
  }
  ```

- createRoot API的作用

  ```js
  import { createRoot } from 'react-dom/client';
  
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
  ```

**关闭自动批处理**

在某些特殊情况下，可能需要关闭批处理，React 18 提供了 `flushSync` API 来实现立即更新：

```js
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // React 已更新 DOM
  
  flushSync(() => {
    setFlag(f => !f);
  });
  // React 已再次更新 DOM
}
```

**自动批处理的性能影响**

- 减少渲染次数：将多个状态更新合并为一次渲染，减少计算和 DOM 操作
- **降低内存使用**：减少临时对象的创建和 GC 压力
- **提高响应性**：减少主线程阻塞时间，使用户交互更流畅
- **减少闪烁**：防止中间状态被渲染，提供更一致的用户体验



## React技术发展趋势与前景分析

### React核心团队的发展路线图解析

React 核心团队在近期的发展路线中主要聚焦几个关键方向：

首先是 React Server Components (RSC) 的全面推广与完善，这是 React 18 后最重要的架构转变。团队正致力于简化 RSC 的开发体验，并提供更完善的文档与工具支持。

其次是渐进式采用策略，允许开发者按需使用新特性而不必完全重构应用，例如通过 React 的"use"钩子平滑过渡到并发特性。

性能优化也是重点，特别是减少 JavaScript 包大小、改进首次加载体验，以及增强可访问性支持。

此外，团队正在推进"编译时优化"方向，通过静态分析减少运行时开销，类似于 React Compiler (前身为 React Forget) 自动记忆化的工作。



### Server Components与客户端渲染的融合趋势

RSC 与客户端渲染的融合代表着 React 的"全栈化"趋势：

这种融合创建了"零 API"的无缝体验，开发者可以在同一组件树中混合使用服务器和客户端组件，让框架负责边界协调。

Next.js 和 Remix 等框架通过统一的路由系统，实现了服务器与客户端逻辑的协同工作，使组件可以根据其职责自然地分布在适当的运行环境。

这种融合还带来了渐进式增强的新模式，应用可以先在服务器渲染出完整内容，再在客户端逐步添加交互性，大大改善了首屏加载体验和性能指标。

未来趋势是进一步模糊服务器/客户端边界，创建更加声明式的开发模型，让开发者专注于组件功能而非运行环境。



### React编译时优化的发展方向

React 编译时优化正经历重大转变：

React Compiler (曾用名 React Forget) 是核心创新，它通过静态分析自动推断组件依赖，无需手动添加记忆化代码，显著减少不必要的重渲染。

模板编译优化与 JSX 转换的进一步发展也在路线图中，通过在编译阶段分析模板结构，生成更高效的渲染代码。

静态分析工具链的增强将帮助开发者在构建阶段发现潜在问题，如不必要的重渲染和内存泄漏风险。

未来，React 可能采用更激进的编译优化，包括部分求值、死代码消除和自动代码分割，进一步减少运行时负担。



### 原子化状态管理与细粒度更新的未来

状态管理正向更细粒度、更精确的方向发展：

Signals、Jotai、Zustand 等原子化状态管理方案正获得越来越多关注，它们提供比传统 Redux 或 Context 更精细的更新粒度。

React 自身也在探索更高效的状态更新机制，如 useSyncExternalStore 和 useOptimistic 等钩子，使外部状态与 React 更新周期更好地协同。

未来趋势包括"基于依赖追踪"的自动订阅系统，只在实际使用的数据发生变化时触发组件更新，避免过度渲染。

与编译时优化结合，细粒度状态管理将实现高度优化的更新路径，使大型应用保持流畅响应。



### React在WebAssembly中的应用前景

React 与 WebAssembly 的融合展现出几个有前景的方向：

性能密集型组件可以采用 Wasm 实现，如复杂可视化、图像处理或实时分析，同时保持与 React 组件树的无缝集成。

React 运行时本身的部分模块可能迁移到 Wasm，特别是协调算法和虚拟 DOM 比较等计算密集型部分，提高整体性能。

跨平台组件库可以通过 Wasm 实现更一致的行为，减少对特定平台 API 的依赖。

React Native 和 React 的 Web 版本可能通过 WebAssembly 实现更统一的底层实现，简化跨平台开发。



### React与AI技术的结合可能性

React 与 AI 的结合正创造新的开发范式：

AI 辅助组件开发工具已经出现，如可以根据描述生成组件、自动优化性能或生成测试用例的工具。

智能 UI 生成正变得实用，允许从设计图或描述直接生成可用的 React 组件代码。

交互式 AI 组件正在增加，如内置智能搜索、自动内容生成或内容分析功能的组件。

未来，我们可能看到 AI 赋能的自适应界面，根据用户行为和偏好自动调整布局、交互模式和内容展示。



### React生态在企业级应用中的竞争力与发展趋势

企业级应用中，React 生态展现出持续竞争力：

"全栈 React"解决方案如 Next.js、Remix 和 RedwoodJS 正成为企业选择的主流，提供从前端到 API 层的完整开发体验。

企业级组件库和设计系统基于 React 的实现越来越成熟，如 Ant Design、Material-UI 和 Chakra UI 等。

微前端架构采用 React 作为基础框架的案例增多，通过模块联邦等技术实现大型应用的解耦和团队自主开发。

安全性和可访问性增强工具在 React 生态中日益完善，满足企业对合规性的严格要求。

未来趋势包括更完善的企业级开发工具链、更强的类型安全机制，以及更优化的大规模应用性能方案，进一步巩固 React 在企业市场的地位。

