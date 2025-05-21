# JavaScript 事件循环

## 浏览器与 Node.js 事件循环的异同

### 浏览器事件循环

浏览器的事件循环主要由以下部分组成：

- 调用栈（Call Stack）
- Web API（DOM、AJAX、setTimeout等）
- 任务队列（Task Queue）
- 微任务队列（Microtask Queue）



### Node.js 事件循环

Node.js 的事件循环基于 libuv 库实现，包含以下几个主要阶段：

1. timers：处理 setTimeout 和 setInterval 的回调
2. pending callbacks：执行某些系统操作的回调
3. idle, prepare：内部使用
4. poll：获取新的 I/O 事件
5. check：执行 setImmediate 的回调
6. close callbacks：执行关闭事件的回调

### 主要差异

- 浏览器环境中，微任务会在每个宏任务执行完后立即执行
- Node.js 在不同版本中处理微任务的时机有所不同：
  - Node.js 11 之前：每个阶段执行完所有任务后才会执行微任务
  - Node.js 11 之后：与浏览器行为趋同，每个宏任务执行完后立即执行微任务



## 微任务与宏任务的执行顺序及其底层实现

### 宏任务（Macrotasks）

- setTimeout、setInterval
- setImmediate (Node.js)
- requestAnimationFrame (浏览器)
- I/O 操作
- UI 渲染（浏览器）

### 微任务（Microtasks）

- Promise.then/catch/finally
- process.nextTick (Node.js，优先级高于其他微任务)
- MutationObserver (浏览器)
- queueMicrotask

### 执行顺序

1. 执行同步代码（当前宏任务）
2. 清空微任务队列
3. 执行下一个宏任务
4. 重复步骤 2-3

### 底层实现

微任务在 V8 中通过 MicrotaskQueue 实现，宏任务则通过宿主环境（浏览器或 Node.js）的相应 API 实现。V8 引擎会在适当时机检查并执行微任务队列中的任务。



## 从 V8 源码角度分析 Promise 的实现原理

Promise 在 V8 中的实现主要涉及以下几个关键部分：

1. **PromiseReactionJob**：处理 Promise 的 then/catch 回调
2. **EnqueueJob**：将任务加入微任务队列
3. **Promise构造函数**：创建 Promise 对象并执行 executor 函数

Promise 状态变化时（通过 resolve 或 reject），相应的回调会被包装成 PromiseReactionJob 并通过 EnqueueJob 加入微任务队列。当主线程空闲时，微任务队列中的任务会被依次执行。

V8 源码中，Promise 的状态使用内部槽（InternalSlot）存储，包括 [[PromiseState]] 和 [[PromiseResult]]。Promise 链式调用则通过 [[PromiseFulfillReactions]] 和 [[PromiseRejectReactions]] 实现。



## 复杂异步场景的事件循环分析

让我们分析一个复杂异步场景的执行顺序：

```javascript
console.log('1');
setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);
Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => {
    console.log('5');
  }, 0);
});
console.log('6');
```

执行顺序分析：

1. 输出 '1'（同步代码）
2. 设置一个宏任务（setTimeout）
3. 设置一个微任务（Promise.then）
4. 输出 '6'（同步代码）
5. 执行微任务，输出 '4'，并设置新的宏任务（setTimeout）
6. 执行第一个宏任务（第一个 setTimeout），输出 '2'，并设置新的微任务
7. 立即执行新的微任务，输出 '3'
8. 执行第二个宏任务（第二个 setTimeout），输出 '5'

最终输出顺序：1, 6, 4, 2, 3, 5



## 异步任务调度与优先级管理机制

JavaScript 的异步任务优先级管理：

1. **最高优先级**：同步代码
2. **次高优先级**：微任务，其中 process.nextTick (Node.js) 优先于 Promise
3. **普通优先级**：宏任务，按照事件循环的顺序执行

在 Node.js 环境中，不同类型的宏任务也有优先级差异：

- process.nextTick 优先于 Promise.then
- setTimeout 和 setInterval 根据设定的时间执行
- setImmediate 在 I/O 操作后执行

浏览器中，任务调度还需考虑渲染周期，requestAnimationFrame 会在渲染前执行，而普通宏任务和微任务则在不同时机执行。



## 浏览器渲染与事件循环的交互机制

浏览器渲染与事件循环的交互遵循以下流程：

1. 执行一个宏任务
2. 执行所有微任务
3. 如果需要，执行 requestAnimationFrame 回调
4. 如果需要，执行 IntersectionObserver 回调
5. 如果需要，更新渲染（计算样式、布局、绘制、合成）
6. 执行下一个宏任务

关键渲染路径包括：

- 解析 HTML 生成 DOM
- 解析 CSS 生成 CSSOM
- 合并 DOM 和 CSSOM 生成渲染树
- 计算布局
- 绘制页面

浏览器通常以约 60Hz 的频率进行渲染，这与 requestAnimationFrame 的执行频率相匹配。这也是为什么动画相关的代码最好放在 requestAnimationFrame 回调中执行。



## 手写实现简易版事件循环系统

```js
/**
 * 简易事件循环系统实现
 */

class SimpleEventLoop {
  constructor() {
    // 调用栈
    this.callStack = [];
    // 微任务队列
    this.microTaskQueue = [];
    // 宏任务队列
    this.macroTaskQueue = [];
    // 当前正在执行的任务
    this.currentTask = null;
    // 是否正在运行事件循环
    this.isRunning = false;
  }

  /**
   * 添加微任务
   * @param {Function} callback 微任务回调函数
   */
  addMicroTask(callback) {
    this.microTaskQueue.push(callback);
  }

  /**
   * 添加宏任务
   * @param {Function} callback 宏任务回调函数
   */
  addMacroTask(callback) {
    this.macroTaskQueue.push(callback);
  }

  /**
   * 执行所有微任务
   */
  flushMicroTasks() {
    while (this.microTaskQueue.length > 0) {
      const microTask = this.microTaskQueue.shift();
      this.currentTask = microTask;
      try {
        microTask();
      } catch (error) {
        console.error('微任务执行错误:', error);
      }
      this.currentTask = null;
    }
  }

  /**
   * 执行一个宏任务
   */
  executeNextMacroTask() {
    if (this.macroTaskQueue.length > 0) {
      const macroTask = this.macroTaskQueue.shift();
      this.currentTask = macroTask;
      try {
        macroTask();
      } catch (error) {
        console.error('宏任务执行错误:', error);
      }
      this.currentTask = null;
    }
  }

  /**
   * 运行事件循环
   */
  run() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.macroTaskQueue.length > 0 || this.microTaskQueue.length > 0) {
      // 1. 执行一个宏任务
      this.executeNextMacroTask();
      
      // 2. 执行所有微任务
      this.flushMicroTasks();
    }

    this.isRunning = false;
    console.log('事件循环结束');
  }

  /**
   * 模拟 setTimeout
   * @param {Function} callback 回调函数
   * @param {number} ms 延迟时间（毫秒）
   */
  setTimeout(callback, ms) {
    // 实际实现中会使用真正的定时器
    // 这里为了简化，直接添加到宏任务队列
    setTimeout(() => {
      this.addMacroTask(callback);
    }, ms);
  }

  /**
   * 模拟 Promise.resolve().then()
   * @param {Function} callback 回调函数
   */
  promiseThen(callback) {
    this.addMicroTask(callback);
  }
}

// 使用示例
const eventLoop = new SimpleEventLoop();

console.log('开始');

eventLoop.addMacroTask(() => {
  console.log('宏任务 1');
  eventLoop.promiseThen(() => {
    console.log('来自宏任务 1 的微任务');
  });
});

eventLoop.promiseThen(() => {
  console.log('微任务 1');
  eventLoop.addMacroTask(() => {
    console.log('来自微任务 1 的宏任务');
  });
});

eventLoop.addMacroTask(() => {
  console.log('宏任务 2');
});

console.log('同步代码结束');

// 启动事件循环
eventLoop.run();

/**
 * 预期输出:
 * 开始
 * 同步代码结束
 * 宏任务 1
 * 来自宏任务 1 的微任务
 * 微任务 1
 * 来自微任务 1 的宏任务
 * 宏任务 2
 * 事件循环结束
 */
```

## Promise A+ 规范实现

```js
/**
 * 简易版 Promise 实现（符合 Promise/A+ 规范的核心部分）
 */

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 实现 Promise.prototype.then
   * @param {Function} onFulfilled 成功回调
   * @param {Function} onRejected 失败回调
   * @returns {MyPromise} 新的 Promise 对象
   */
  then(onFulfilled, onRejected) {
    // 处理回调函数不是函数的情况
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

    // 创建新的 Promise 对象用于链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      // 封装微任务执行函数
      const enqueueMicrotask = (callback) => {
        // 使用 queueMicrotask 加入微任务队列
        queueMicrotask(callback);
      };

      if (this.state === FULFILLED) {
        enqueueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === REJECTED) {
        enqueueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          enqueueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          enqueueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  /**
   * 处理 Promise 解析过程
   * @param {MyPromise} promise2 新创建的 Promise
   * @param {any} x then 方法的返回值
   * @param {Function} resolve promise2 的 resolve 函数
   * @param {Function} reject promise2 的 reject 函数
   */
  resolvePromise(promise2, x, resolve, reject) {
    // 如果 promise2 和 x 是同一个对象，抛出循环引用错误
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected for promise'));
    }

    // 判断 x 是否为 Promise
    if (x instanceof MyPromise) {
      x.then(
        value => this.resolvePromise(promise2, value, resolve, reject),
        reason => reject(reason)
      );
      return;
    }

    // 处理 x 为对象或函数的情况
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false;
      try {
        const then = x.then;
        if (typeof then === 'function') {
          // x 是 thenable 对象
          then.call(
            x,
            value => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, value, resolve, reject);
            },
            reason => {
              if (called) return;
              called = true;
              reject(reason);
            }
          );
        } else {
          // x 是普通对象或函数
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      // x 是原始值
      resolve(x);
    }
  }

  /**
   * 实现 Promise.prototype.catch
   * @param {Function} onRejected 失败回调
   * @returns {MyPromise} 新的 Promise 对象
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * 实现 Promise.prototype.finally
   * @param {Function} callback 无论成功或失败都会执行的回调
   * @returns {MyPromise} 新的 Promise 对象
   */
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason; })
    );
  }

  /**
   * 静态方法 Promise.resolve
   * @param {any} value 要解析为 Promise 对象的值
   * @returns {MyPromise} 新的 Promise 对象
   */
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise(resolve => resolve(value));
  }

  /**
   * 静态方法 Promise.reject
   * @param {any} reason 拒绝的原因
   * @returns {MyPromise} 新的 Promise 对象
   */
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  /**
   * 静态方法 Promise.all
   * @param {Iterable} promises 可迭代的 Promise 对象集合
   * @returns {MyPromise} 新的 Promise 对象
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('promises must be an array'));
      }
      
      const results = [];
      let completedCount = 0;
      const len = promises.length;
      
      if (len === 0) {
        return resolve([]);
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completedCount++;
            if (completedCount === len) {
              resolve(results);
            }
          },
          reason => reject(reason)
        );
      });
    });
  }

  /**
   * 静态方法 Promise.race
   * @param {Iterable} promises 可迭代的 Promise 对象集合
   * @returns {MyPromise} 新的 Promise 对象
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('promises must be an array'));
      }
      
      if (promises.length === 0) {
        return;
      }

      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 使用示例
const promise = new MyPromise((resolve, reject) => {
  console.log('MyPromise 执行器运行');
  setTimeout(() => {
    resolve('成功');
  }, 1000);
});

promise
  .then(value => {
    console.log('第一个 then:', value);
    return new MyPromise(resolve => {
      setTimeout(() => {
        resolve('来自第一个 then 的新 Promise');
      }, 1000);
    });
  })
  .then(value => {
    console.log('第二个 then:', value);
    throw new Error('故意的错误');
  })
  .catch(error => {
    console.log('catch:', error.message);
    return 'catch 的返回值';
  })
  .finally(() => {
    console.log('finally 执行');
  })
  .then(value => {
    console.log('最后的 then:', value);
  });

console.log('同步代码结束');
```

## 事件循环与实际应用

了解事件循环机制对于开发高性能 JavaScript 应用至关重要。以下是一些实际应用场景：

### 1. 优化长任务

通过将大型计算任务分解为多个小任务并使用 `setTimeout` 或 `requestAnimationFrame` 来调度，可以避免阻塞主线程，提高应用响应性。

### 2. 控制任务优先级

利用微任务和宏任务的特性，可以为不同任务设置优先级。例如，关键的用户交互响应可以使用微任务，而后台数据处理可以使用宏任务。

### 3. 优化动画性能

使用 `requestAnimationFrame` 可以确保动画代码在浏览器的渲染周期中的最佳时机执行，提高动画流畅度。

### 4. 避免渲染阻塞

理解浏览器的渲染时机，可以避免在关键渲染路径中执行耗时操作，提高首屏加载速度。

### 5. 处理大量数据

使用分时处理（time slicing）技术，可以在不阻塞主线程的情况下处理大量数据，改善用户体验。
