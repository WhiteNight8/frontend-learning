## 基础包结构

- react ： 提供定义react组件的必要函数
- react-dom： react渲染器之一， 是react与web平台连接的桥梁，将react-reconciler中的运行结果输出到web界面上
- react-reconciler： react运行的核心包，管理react应用状态的输入和结果的输出， 将输入信号最终转成输出信号传递给渲染器；将fiber树生成逻辑封装到一个回调函数中
- scheduler：调度机制的核心实现，控制由react-reconciler送入的回调函数的执行时机； 核心任务就是执行回调，通过控制回调函数的执行时机，来达到任务分片的目的，实现中断渲染

## 宏观总览

### 架构分层

接口层

1. 内核层

   1. 调度器
   2. 构造器
   3. 渲染器

   