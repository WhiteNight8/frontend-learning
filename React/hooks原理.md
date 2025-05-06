 

## 什么是Fiber

GUI渲染跟JS代码执行是在一个线程的， 互斥

Fiber是一个执行单元碎片

## hooks原理

链表

## React Fiber Architecture

headline feature

- incremental rendering: the ability to split rendering work into chunks and spread it out over multiple frames
- to pause, abort , or resues work as new updateas; the ability to assign priority to different types of updates ; new concurrency primitives



## reconciliation

the algorithm React uses to diff one tree with another to determine which parts need to be changed

## scheduling

the preocess of determining when work should be performed

## what is fiber

requestIdleCallback, schedule a low pripority



requestAnimatioFrame: schedule a high priority



a virtual stack frame

structure

- a JavaScript object that contains information about a component, its input , and it output
- type , key
- child, sibiling
- return
- pendingProps and memorizeProps
- pendingWorkPriority
- alternate
- output
- 





