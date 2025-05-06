## vue中key的作用是什么，为什么要绑定key，为什么不建议使用index作为key

主要用于帮助vue识别和追踪列表的每个节点，从而优化渲染性能和保持组件状态

- 高效的虚拟DOM更新
- 状态维护

会发生状态错位



## 虚拟DOM和真实DOM在性能上的对比如何

虚拟DOM并非绝对快，而是通过智能的更新策略，在大多数场景下显著优化了渲染性能

虚拟DOM是一个轻量级的JavaScript对象，对真实DON的抽象表示



## diff算法的原理是什么，如何提高性能

原理：虚拟DOM比较两个虚拟DOM树差异的高效算法

- 找出两个虚拟DOM的最小变更集
- 将最小变更应用到真实DOM上
- 最大限度的减少DOM操作次数

优化策略

- 层级比较
- 唯一标识key
- 最小变更原则
- 缓存和记忆化
- 异步渲染



## 虚拟DOM的解析过程是什么样的

虚拟DOM解析是一个将模板或者渲染函数转换为轻量级JavaScript对象的过程

模板解析阶段

- 词法分析
- 语法分析
- 转换为虚拟DOM

性能优化技术

- 缓存与复用
- 增量解析



## 虚拟DOM是什么， 为什么要使用虚拟DOM

虚拟DOM真实DOM的轻量级JavaScript对象表示

- 性能优化
- 最小化DOM操作
- 跨平台渲染
- 声明式编程





## Vue3响应式系统使用proxy代替Object.defineProperty有什么优势

- 可以监听整个对象，而不是单个属性
- 支持数组和map set等复杂数据结构
- 性能更好，无需递归遍历整个对象，代理整个对象
- 可以监听in，for in 操作符和循环
- 更好的可扩展性



## vue3的diff算法与vue2比有什么改进，这些改进如何影响了性能

- 静态标记优化，对动态节点添加标记，只更新有变化的部分，跳过静态内容的diff计算
- 静态提升，将不变的节点提升为变量，避免重复创建VNode
- Fragment机制，允许返回多个节点，避免不必要的div包裹
- 更高效的v-if Diff， 使用最长递增子序列优化
- 缓存事件监听， 避免重复绑定事件



## vue3的composition API与React hooks在设计和用法中有什么主要的不同

![image-20250328143215656](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328143215656.png)



## 解释vue3中的reactive，ref的区别和使用场景

![image-20250328143324919](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328143324919.png)



## vue3中的watch和watchEffect有什么不同，它们各自适用什么场景

![image-20250328143712158](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328143712158.png)



![image-20250328143820542](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328143820542.png)



## 什么使得vue3在性能上比vue2有优势

- 响应式系统优化
- 组件渲染优化
- 事件侦听优化
- Fragment支持
- Treeshaking 优化
- 组合式API
- 服务端渲染优化
- suspense 异步组件优化



## vue3在编译过程中进行了哪些优化，以提高运行时性能

- 静态提升
- Patch Flags标记动态节点，优化diff算法
- 静态prop分离
- 事件缓存
- Fragment
- suspense，异步优化



## vue3的响应式是如何工作的，与vue2的实现有什么不同

## ![image-20250328144442311](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328144442311.png)



## 描述pinia的核心工作原理，如何管理和维护应用状态的

基于reactive作为底层状态管理

1. 创建响应式state
2. 使用getters进行派生计算
3. 使用action直接修改state，支持异步操作



## 相较于vuex，pinia在设计和适用上有哪些显著的优势和可能的劣势

![image-20250328144548018](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328144548018.png)



## vuex状态管理跟使用全局对象进行状态管理由什么本质区别

![image-20250328144855342](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328144855342.png)



## vuex状态管理与localStorage有什么不同

![image-20250328144935696](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328144935696.png)



## vue中的nextTick方法的原理是什么，在vue中有什么用途

vue的响应式系统基于异步队列，当状态发生变化时，vue会在下一个事件循环周期批量更新DOM。nexttick时vue内部用于将回调放到这个异步更新队列的工具

用途

- 确保DOM更新完成后操作DOM
- 确保更新后的视图已经渲染
- 提高性能，减少不必要的渲染

![image-20250328145353613](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328145353613.png)



## 解释vue中keep-alive组件的作用和实现机制，具体缓存的内容是什么

作用

- 缓存组件实例
- 提高性能
- 保持状态

实现机制 

- 缓存组件实例
- 生命周期管理

缓存的内容

- 组件实例
- DOM状态



## vue对象或者数组的属性变化监听是如何实现的，描述工作原理

![image-20250328145757054](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328145757054.png)



## vue中双向绑定是如何工作的，简述其基本原理

![](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328150005849.png)



## vue中使用object.defineProperty进行数据劫持有哪些潜在的缺点和限制， 3为什么选用proxy

![image-20250328150128954](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328150128954.png)



## vue在哪些情况下进行依赖收集， 依赖收集的机制是什么

![image-20250328150214193](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328150214193.png)



## vue中的template与jsx有什么不同， 各种优势是什么

![image-20250328150317042](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250328150317042.png)



## vue的模板编译过程，具体步骤包括哪些

- 解析模板
- 优化模板
- 生成渲染函数
- 挂载个更新



