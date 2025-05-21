# Promise 与异步模式

## Promise A+ 规范的详细解读及手写实现

Promise A+ 规范是 JavaScript Promise 实现的标准，定义了 Promise 的行为和交互方式。让我们深入理解这个规范并实现一个符合规范的 Promise。

### Promise A+ 规范关键点：

1. **Promise 状态**：Promise 必须处于三种状态之一：pending、fulfilled 或 rejected
2. **状态转换**：pending 可以转换为 fulfilled 或 rejected，但 fulfilled 和 rejected 状态是终态
3. **then 方法**：Promise 必须提供 then 方法访问当前或最终值/原因
4. **thenable**：支持与任何实现了 then 方法的对象或函数进行交互
5. **异步执行**：Promise 的回调必须异步执行（微任务）

```js
/**
 * 符合 Promise/A+ 规范的 Promise 实现
 */

// Promise 状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class PromiseAPlus {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    // resolve 函数实现
    const resolve = (value) => {
      // 处理 Promise 解析过程
      if (value instanceof PromiseAPlus) {
        value.then(resolve, reject);
        return;
      }

      // 使用微任务执行状态转换
      queueMicrotask(() => {
        if (this.state === PENDING) {
          this.state = FULFILLED;
          this.value = value;
          this.onFulfilledCallbacks.forEach(fn => fn());
        }
      });
    };

    // reject 函数实现
    const reject = (reason) => {
      queueMicrotask(() => {
        if (this.state === PENDING) {
          this.state = REJECTED;
          this.reason = reason;
          this.onRejectedCallbacks.forEach(fn => fn());
        }
      });
    };

    // 立即执行 executor
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Promise.prototype.then 方法实现
   * @param {Function} onFulfilled 成功回调
   * @param {Function} onRejected 失败回调
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  then(onFulfilled, onRejected) {
    // 根据规范，如果 onFulfilled 不是函数，则忽略，并将值向下传递
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    // 根据规范，如果 onRejected 不是函数，则忽略，并将错误向下抛出
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    // 创建并返回新的 Promise
    const promise2 = new PromiseAPlus((resolve, reject) => {
      // 处理 fulfilled 状态
      const fulfilledHandler = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      // 处理 rejected 状态
      const rejectedHandler = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      // 根据当前 Promise 状态决定如何处理
      if (this.state === FULFILLED) {
        fulfilledHandler();
      } else if (this.state === REJECTED) {
        rejectedHandler();
      } else {
        // PENDING 状态，将回调存储起来
        this.onFulfilledCallbacks.push(fulfilledHandler);
        this.onRejectedCallbacks.push(rejectedHandler);
      }
    });

    return promise2;
  }

  /**
   * Promise.prototype.catch 方法实现
   * @param {Function} onRejected 失败回调
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * Promise.prototype.finally 方法实现
   * @param {Function} callback 无论成功或失败都会执行的回调
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  finally(callback) {
    return this.then(
      value => PromiseAPlus.resolve(callback()).then(() => value),
      reason => PromiseAPlus.resolve(callback()).then(() => { throw reason; })
    );
  }

  /**
   * Promise.resolve 静态方法
   * @param {any} value 要被解析的值
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  static resolve(value) {
    if (value instanceof PromiseAPlus) {
      return value;
    }

    return new PromiseAPlus(resolve => {
      resolve(value);
    });
  }

  /**
   * Promise.reject 静态方法
   * @param {any} reason 拒绝的原因
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  static reject(reason) {
    return new PromiseAPlus((resolve, reject) => {
      reject(reason);
    });
  }

  /**
   * Promise.all 静态方法
   * @param {Iterable} promises 可迭代的 Promise 对象
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  static all(promises) {
    if (!Array.isArray(promises)) {
      return PromiseAPlus.reject(new TypeError('promises must be an array'));
    }

    return new PromiseAPlus((resolve, reject) => {
      const result = [];
      let count = 0;
      const length = promises.length;

      if (length === 0) {
        resolve(result);
        return;
      }

      for (let i = 0; i < length; i++) {
        PromiseAPlus.resolve(promises[i]).then(
          value => {
            result[i] = value;
            count++;
            if (count === length) {
              resolve(result);
            }
          },
          reason => reject(reason)
        );
      }
    });
  }

  /**
   * Promise.race 静态方法
   * @param {Iterable} promises 可迭代的 Promise 对象
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  static race(promises) {
    if (!Array.isArray(promises)) {
      return PromiseAPlus.reject(new TypeError('promises must be an array'));
    }

    return new PromiseAPlus((resolve, reject) => {
      const length = promises.length;
      if (length === 0) {
        return;
      }

      for (let i = 0; i < length; i++) {
        PromiseAPlus.resolve(promises[i]).then(resolve, reject);
      }
    });
  }

  /**
   * Promise.allSettled 静态方法
   * @param {Iterable} promises 可迭代的 Promise 对象
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  static allSettled(promises) {
    if (!Array.isArray(promises)) {
      return PromiseAPlus.reject(new TypeError('promises must be an array'));
    }

    return new PromiseAPlus(resolve => {
      const result = [];
      let count = 0;
      const length = promises.length;

      if (length === 0) {
        resolve(result);
        return;
      }

      for (let i = 0; i < length; i++) {
        PromiseAPlus.resolve(promises[i]).then(
          value => {
            result[i] = { status: 'fulfilled', value };
            count++;
            if (count === length) {
              resolve(result);
            }
          },
          reason => {
            result[i] = { status: 'rejected', reason };
            count++;
            if (count === length) {
              resolve(result);
            }
          }
        );
      }
    });
  }

  /**
   * Promise.any 静态方法
   * @param {Iterable} promises 可迭代的 Promise 对象
   * @returns {PromiseAPlus} 新的 Promise 实例
   */
  static any(promises) {
    if (!Array.isArray(promises)) {
      return PromiseAPlus.reject(new TypeError('promises must be an array'));
    }

    return new PromiseAPlus((resolve, reject) => {
      const errors = [];
      let count = 0;
      const length = promises.length;

      if (length === 0) {
        reject(new AggregateError(errors, 'All promises were rejected'));
        return;
      }

      for (let i = 0; i < length; i++) {
        PromiseAPlus.resolve(promises[i]).then(
          value => {
            resolve(value);
          },
          reason => {
            errors[i] = reason;
            count++;
            if (count === length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          }
        );
      }
    });
  }
}

/**
 * 处理 Promise 解析过程
 * @param {PromiseAPlus} promise2 promise.then 方法返回的 Promise
 * @param {any} x 回调函数的返回值
 * @param {Function} resolve promise2 的 resolve 函数
 * @param {Function} reject promise2 的 reject 函数
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 如果 promise2 和 x 是同一个对象，抛出类型错误
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  // 如果 x 是 Promise，采用其状态
  if (x instanceof PromiseAPlus) {
    x.then(
      value => resolvePromise(promise2, value, resolve, reject),
      reject
    );
    return;
  }

  // 如果 x 是对象或函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false;

    try {
      // 尝试获取 x.then
      const then = x.then;

      // 如果 then 是函数，则将 x 作为 this 调用它
      if (typeof then === 'function') {
        then.call(
          x,
          // resolvePromise
          value => {
            if (called) return;
            called = true;
            resolvePromise(promise2, value, resolve, reject);
          },
          // rejectPromise
          reason => {
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } else {
        // 如果 then 不是函数，则以 x 为值 fulfill promise
        resolve(x);
      }
    } catch (error) {
      // 如果获取或调用 x.then 抛出异常
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 如果 x 不是对象或函数，则以 x 为值 fulfill promise
    resolve(x);
  }
}

// 使用示例
const promise = new PromiseAPlus((resolve, reject) => {
  console.log('Promise executor running');
  setTimeout(() => {
    resolve('Success!');
  }, 1000);
});

promise
  .then(value => {
    console.log('First then:', value);
    return 'Return from first then';
  })
  .then(value => {
    console.log('Second then:', value);
    throw new Error('Error in second then');
  })
  .catch(error => {
    console.log('Caught error:', error.message);
    return 'Recovery value';
  })
  .finally(() => {
    console.log('Finally runs regardless of success or failure');
  })
  .then(value => {
    console.log('After finally:', value);
  });

// 示例：Promise.all
const promiseAll = PromiseAPlus.all([
  PromiseAPlus.resolve(1),
  new PromiseAPlus(resolve => setTimeout(() => resolve(2), 100)),
  3
]);
promiseAll.then(values => {
  console.log('Promise.all result:', values);
});

// 示例：Promise.race
const promiseRace = PromiseAPlus.race([
  new PromiseAPlus(resolve => setTimeout(() => resolve('slow'), 200)),
  new PromiseAPlus(resolve => setTimeout(() => resolve('fast'), 100)),
  new PromiseAPlus((_, reject) => setTimeout(() => reject(new Error('error')), 300))
]);
promiseRace.then(
  value => console.log('Promise.race winner:', value),
  error => console.log('Promise.race error:', error.message)
);
```



## Promise 链式调用的实现原理及常见错误分析

Promise 链式调用是 Promise 最强大的特性之一，让我们深入理解其工作原理和常见错误。

### 链式调用的实现原理：

1. **返回新 Promise**：`.then()` 方法每次调用都返回一个新的 Promise 对象
2. **值传递**：前一个 Promise 的结果会作为参数传给下一个 then 的回调函数
3. **错误传递**：错误会沿着链条向下传递，直到被 catch 捕获
4. **状态转换**：根据回调的返回值决定新 Promise 的状态

```js
/**
 * Promise 链式调用常见错误分析与最佳实践
 */

// ======= 错误 1: 没有返回值，导致链断裂 =======
function brokenChain() {
  console.log('\n===== 错误 1: 没有返回值，导致链断裂 =====');
  
  // 错误示例
  Promise.resolve('初始值')
    .then(value => {
      console.log('第一个 then:', value);
      // 没有返回值，下一个 then 将收到 undefined
      // 应该: return '新值';
    })
    .then(value => {
      console.log('第二个 then:', value); // 输出: undefined
    });
  
  // 正确示例
  Promise.resolve('初始值')
    .then(value => {
      console.log('正确示例 - 第一个 then:', value);
      return '新值'; // 显式返回值
    })
    .then(value => {
      console.log('正确示例 - 第二个 then:', value); // 输出: 新值
    });
}

// ======= 错误 2: 错误处理不当 =======
function errorHandlingIssues() {
  console.log('\n===== 错误 2: 错误处理不当 =====');
  
  // 错误示例 1: catch 后没有继续处理错误
  Promise.resolve()
    .then(() => {
      throw new Error('发生错误');
    })
    .catch(err => {
      console.log('捕获错误:', err.message);
      throw err; // 重新抛出错误但未处理
    })
    .then(() => {
      console.log('这里不会执行');
    }, err => {
      // 应该在这里处理重新抛出的错误
      console.log('没有处理重新抛出的错误');
    });
  
  // 错误示例 2: 全局捕获不处理具体错误
  Promise.resolve()
    .then(() => {
      // 一些操作
      return '第一步成功';
    })
    .then(() => {
      throw new Error('第二步错误');
    })
    .then(() => {
      // 不会执行到这里
    })
    .catch(err => {
      console.log('统一捕获所有错误:', err.message);
      // 无法区分错误来源和进行针对性处理
    });
  
  // 正确示例: 局部错误处理
  Promise.resolve()
    .then(() => {
      // 一些操作
      return '第一步成功';
    })
    .then(result => {
      try {
        throw new Error('第二步可恢复错误');
      } catch (e) {
        console.log('局部处理错误:', e.message);
        return '错误后的恢复值'; // 优雅降级
      }
    })
    .then(result => {
      console.log('继续执行:', result);
    })
    .catch(err => {
      console.log('捕获未处理的错误');
    });
}

// ======= 错误 3: 嵌套 Promise（回调地狱的变种）=======
function nestedPromises() {
  console.log('\n===== 错误 3: 嵌套 Promise =====');
  
  // 错误示例
  function fetchDataBad() {
    return Promise.resolve('初始数据')
      .then(initialData => {
        // 嵌套 Promise 而不是返回
        Promise.resolve(`处理 ${initialData}`)
          .then(processedData => {
            console.log('内部 then:', processedData);
            // 这个结果不会传递到外部链
          });
        // 没有返回值，导致外部链断裂
      })
      .then(data => {
        console.log('外部 then 无法获得内部结果:', data); // undefined
      });
  }
  
  // 正确示例
  function fetchDataGood() {
    return Promise.resolve('初始数据')
      .then(initialData => {
        // 返回 Promise，保持链式结构
        return Promise.resolve(`处理 ${initialData}`);
      })
      .then(processedData => {
        console.log('能够获得处理后的数据:', processedData);
        return processedData;
      });
  }
  
  fetchDataBad();
  fetchDataGood();
}

// ======= 错误 4: 没有处理异步操作的错误 =======
function unhandledAsyncErrors() {
  console.log('\n===== 错误 4: 没有处理异步操作的错误 =====');
  
  // 错误示例
  function fetchWithTimeout(url, timeout) {
    // 创建一个会失败的请求
    const fetchPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('网络错误')), 100);
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), timeout);
    });
    
    // 没有处理 race 可能产生的错误
    return Promise.race([fetchPromise, timeoutPromise])
      .then(response => {
        console.log('请求成功');
        return response;
      });
      // 缺少 .catch() 处理程序
  }
  
  // 正确示例
  function fetchWithTimeoutGood(url, timeout) {
    const fetchPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('网络错误')), 100);
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), timeout);
    });
    
    return Promise.race([fetchPromise, timeoutPromise])
      .then(response => {
        console.log('请求成功');
        return response;
      })
      .catch(error => {
        console.log('正确处理错误:', error.message);
        // 根据错误类型进行不同处理
        if (error.message === '请求超时') {
          return { status: 'timeout', data: null };
        }
        return { status: 'error', message: error.message };
      });
  }
  
  fetchWithTimeout('https://example.com', 50)
    .then(data => console.log('这不会执行', data))
    .catch(err => console.log('最后捕获错误:', err.message));
  
  fetchWithTimeoutGood('https://example.com', 50)
    .then(data => console.log('获得处理后的结果:', data));
}

// ======= 错误 5: 忽略 Promise 的返回值 =======
function ignoringPromiseResults() {
  console.log('\n===== 错误 5: 忽略 Promise 的返回值 =====');
  
  // 错误示例
  function saveData() {
    // 没有返回 Promise，调用者无法知道操作是否完成
    Promise.resolve()
      .then(() => {
        // 模拟保存操作
        return '保存成功';
      });
  }
  
  // 正确示例
  function saveDataGood() {
    // 返回 Promise，调用者可以继续链式操作
    return Promise.resolve()
      .then(() => {
        // 模拟保存操作
        return '保存成功';
      });
  }
  
  // 调用方无法继续链式操作
  saveData();
  // 以下无效，saveData 没有返回 Promise
  // saveData().then(result => console.log(result));
  
  // 调用方可以继续链式操作
  saveDataGood().then(result => console.log('保存结果:', result));
}

// 执行所有示例
setTimeout(() => {
  brokenChain();
  setTimeout(() => {
    errorHandlingIssues();
    setTimeout(() => {
      nestedPromises();
      setTimeout(() => {
        unhandledAsyncErrors();
        setTimeout(() => {
          ignoringPromiseResults();
        }, 300);
      }, 300);
    }, 300);
  }, 300);
}, 300);

/**
 * Promise 链式调用最佳实践总结：
 * 
 * 1. 始终在 then 中返回值或 Promise，保持链的完整性
 * 2. 使用合适的错误处理策略，区分不同类型的错误
 * 3. 避免嵌套 Promise，保持扁平的链式结构
 * 4. 所有异步操作都应该有错误处理机制
 * 5. 函数返回 Promise 时，让调用方能够继续链式操作
 * 6. 使用 async/await 可以简化复杂的链式调用
 * 7. 谨慎使用 Promise.all 和 Promise.race，始终处理可能的错误
 * 8. 利用 finally 进行清理操作，无论成功或失败
 */
```



## 异步错误处理最佳实践与设计模式

异步错误处理是 JavaScript 开发中的重要挑战。下面我将介绍一些最佳实践和设计模式，帮助有效处理异步错误。

```js
// 1. 使用 try/catch 与 async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取数据失败:', error);
    // 可以选择重试、返回默认值或继续抛出
    throw error; // 重新抛出以便上层处理
  }
}

// 2. 错误边界模式
class ErrorBoundary {
  async execute(asyncFn) {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  handleError(error) {
    console.error('错误被边界捕获:', error);
    // 可以添加日志、监控或用户通知
  }
}

// 3. 使用装饰器模式进行错误处理
function withErrorHandling(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`函数 ${fn.name} 执行失败:`, error);
      // 可以添加重试逻辑
      throw error;
    }
  };
}

const safeRequest = withErrorHandling(fetchData);
```




## Promise 并发控制策略与实现

控制 Promise 的并发执行对于避免资源耗尽和优化性能至关重要。

```js
// 1. 批量控制并发
class ConcurrencyManager {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    // 返回一个promise，让调用者可以等待任务完成
    return new Promise((resolve, reject) => {
      // 将任务和其resolve/reject函数加入队列
      this.queue.push({ fn, resolve, reject });
      this.run();
    });
  }

  async run() {
    // 如果没有达到最大并发且队列中有等待任务
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      // 增加运行计数并取出一个任务
      this.running++;
      const { fn, resolve, reject } = this.queue.shift();

      try {
        // 执行任务并解析原始promise
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        // 无论成功失败，减少运行计数并尝试执行下一个任务
        this.running--;
        this.run();
      }
    }
  }
}

// 使用示例
const manager = new ConcurrencyManager(3); // 最多同时运行3个任务

const urls = Array(10).fill().map((_, i) => `https://api.example.com/${i}`);
const results = await Promise.all(
  urls.map(url => manager.add(() => fetch(url).then(r => r.json())))
);

// 2. 队列执行
class AsyncQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      // 处理下一个任务
      this.processQueue();
    }
  }
}
```



## 从零实现一个完整的异步任务调度器

一个完整的异步任务调度器需要支持任务添加、优先级、并发控制和错误处理

```js
/**
 * 异步任务调度器
 * 支持：
 * - 任务优先级
 * - 并发控制
 * - 任务重试
 * - 任务取消
 * - 任务超时
 */
class AsyncTaskScheduler {
  constructor({ maxConcurrent = 2, defaultTimeout = 30000, defaultRetries = 0 } = {}) {
    this.maxConcurrent = maxConcurrent;
    this.defaultTimeout = defaultTimeout;
    this.defaultRetries = defaultRetries;
    
    // 按优先级存储任务的队列
    this.queues = {
      high: [],    // 优先级高
      normal: [],  // 优先级中
      low: []      // 优先级低
    };
    
    this.runningTasks = new Set();  // 存储正在运行的任务
    this.events = {};               // 事件监听器
    this.taskMap = new Map();       // 存储任务引用(用于取消)
  }

  /**
   * 添加任务到调度器
   * @param {Function} taskFn - 返回Promise的任务函数
   * @param {Object} options - 任务配置
   * @returns {Promise} 表示任务执行的Promise
   */
  addTask(taskFn, {
    id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    priority = 'normal',
    timeout = this.defaultTimeout,
    retries = this.defaultRetries,
    retryDelay = 1000
  } = {}) {
    return new Promise((resolve, reject) => {
      const task = {
        id,
        taskFn,
        priority,
        timeout,
        retries,
        retriesLeft: retries,
        retryDelay,
        resolve,
        reject,
        cancelled: false,
        abortController: new AbortController()
      };
      
      // 存储任务以便可以取消
      this.taskMap.set(id, task);
      
      // 将任务添加到对应优先级的队列
      this.queues[priority].push(task);
      
      // 尝试执行任务
      this.runNext();
      
      // 触发任务添加事件
      this.emit('taskAdded', { taskId: id, priority });
    });
  }

  /**
   * 取消指定ID的任务
   * @param {string} taskId - 要取消的任务ID
   * @returns {boolean} 是否成功取消
   */
  cancelTask(taskId) {
    const task = this.taskMap.get(taskId);
    if (!task) return false;
    
    // 如果任务已经在运行
    if (this.runningTasks.has(task)) {
      task.cancelled = true;
      task.abortController.abort();
      task.reject(new Error('Task cancelled'));
      this.runningTasks.delete(task);
      this.emit('taskCancelled', { taskId });
      this.runNext();
      return true;
    }

    // 如果任务还在队列中
    for (const priority of Object.keys(this.queues)) {
      const index = this.queues[priority].findIndex(t => t.id === taskId);
      if (index !== -1) {
        const [removedTask] = this.queues[priority].splice(index, 1);
        removedTask.cancelled = true;
        removedTask.reject(new Error('Task cancelled'));
        this.emit('taskCancelled', { taskId });
        return true;
      }
    }
    
    return false;
  }

  /**
   * 执行下一个任务
   */
  runNext() {
    if (this.runningTasks.size >= this.maxConcurrent) {
      return; // 达到最大并发数，暂不执行新任务
    }
    
    // 按优先级获取下一个任务
    const nextTask = this.getNextTask();
    if (!nextTask) return; // 没有待执行的任务
    
    // 将任务标记为正在运行
    this.runningTasks.add(nextTask);
    
    // 设置超时处理
    const timeoutId = setTimeout(() => {
      if (this.runningTasks.has(nextTask)) {
        nextTask.abortController.abort();
        this.handleTaskFailure(nextTask, new Error(`Task ${nextTask.id} timed out after ${nextTask.timeout}ms`));
      }
    }, nextTask.timeout);
    
    // 执行任务
    this.executeTask(nextTask)
      .then(result => {
        clearTimeout(timeoutId);
        
        if (nextTask.cancelled) return; // 任务已被取消
        
        this.runningTasks.delete(nextTask);
        nextTask.resolve(result);
        this.emit('taskCompleted', { taskId: nextTask.id, result });
        
        // 执行下一个任务
        this.runNext();
      })
      .catch(error => {
        clearTimeout(timeoutId);
        
        if (nextTask.cancelled) return; // 任务已被取消
        
        this.handleTaskFailure(nextTask, error);
      });
  }

  /**
   * 处理任务失败
   * @param {Object} task - 失败的任务
   * @param {Error} error - 错误对象
   */
  handleTaskFailure(task, error) {
    this.runningTasks.delete(task);
    
    // 检查是否应该重试
    if (task.retriesLeft > 0 && !task.cancelled && error.name !== 'AbortError') {
      task.retriesLeft--;
      
      // 重试延迟
      setTimeout(() => {
        this.queues[task.priority].unshift(task); // 将任务放回队列前端
        this.emit('taskRetry', { 
          taskId: task.id, 
          retriesLeft: task.retriesLeft,
          error: error.message 
        });
        this.runNext();
      }, task.retryDelay);
    } else {
      // 不再重试，报告失败
      task.reject(error);
      this.emit('taskFailed', { 
        taskId: task.id, 
        error: error.message 
      });
      this.runNext();
    }
  }

  /**
   * 执行单个任务
   * @param {Object} task - 要执行的任务
   * @returns {Promise} 任务执行的结果
   */
  async executeTask(task) {
    try {
      // 传递AbortSignal给任务函数
      const result = await task.taskFn({ signal: task.abortController.signal });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取下一个要执行的任务
   * @returns {Object|null} 下一个任务或null
   */
  getNextTask() {
    // 按优先级顺序检查队列
    for (const priority of ['high', 'normal', 'low']) {
      if (this.queues[priority].length > 0) {
        return this.queues[priority].shift();
      }
    }
    return null;
  }

  /**
   * 清空所有队列，取消所有运行中的任务
   */
  clear() {
    // 取消所有运行中的任务
    for (const task of this.runningTasks) {
      task.cancelled = true;
      task.abortController.abort();
      task.reject(new Error('Scheduler cleared'));
    }
    
    // 取消所有排队中的任务
    for (const priority of Object.keys(this.queues)) {
      while (this.queues[priority].length > 0) {
        const task = this.queues[priority].shift();
        task.cancelled = true;
        task.reject(new Error('Scheduler cleared'));
      }
    }
    
    this.runningTasks.clear();
    this.taskMap.clear();
    this.emit('schedulerCleared');
  }

  /**
   * 获取当前调度器状态
   * @returns {Object} 调度器状态
   */
  getStatus() {
    return {
      runningTasks: this.runningTasks.size,
      queueLengths: {
        high: this.queues.high.length,
        normal: this.queues.normal.length,
        low: this.queues.low.length
      },
      totalQueued: 
        this.queues.high.length + 
        this.queues.normal.length + 
        this.queues.low.length,
      maxConcurrent: this.maxConcurrent
    };
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 事件回调
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return this;
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} data - 事件数据
   */
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }
}

// 使用示例
async function example() {
  const scheduler = new AsyncTaskScheduler({ 
    maxConcurrent: 3,
    defaultTimeout: 5000,
    defaultRetries: 2
  });
  
  // 监听事件
  scheduler.on('taskCompleted', ({ taskId, result }) => {
    console.log(`任务 ${taskId} 完成，结果:`, result);
  });
  
  scheduler.on('taskFailed', ({ taskId, error }) => {
    console.log(`任务 ${taskId} 失败:`, error);
  });
  
  // 添加几个测试任务
  const task1 = scheduler.addTask(
    async ({ signal }) => {
      // 模拟API请求
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1', { signal });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    },
    { id: 'fetch-todo', priority: 'high' }
  );
  
  const task2 = scheduler.addTask(
    async () => {
      // 模拟长时间运行的计算
      return new Promise(resolve => {
        setTimeout(() => resolve('计算完成'), 2000);
      });
    },
    { priority: 'normal', timeout: 3000 }
  );
  
  const task3 = scheduler.addTask(
    async () => {
      // 模拟一个失败的任务
      throw new Error('任务故意失败');
    },
    { priority: 'low', retries: 3, retryDelay: 1000 }
  );
  
  // 取消一个任务
  setTimeout(() => {
    scheduler.cancelTask('fetch-todo');
  }, 500);
  
  // 等待任务完成
  try {
    const result2 = await task2;
    console.log('任务2结果:', result2);
  } catch (error) {
    console.error('任务2错误:', error);
  }
  
  // 查看调度器状态
  console.log('调度器状态:', scheduler.getStatus());
}

// example();
```



## 实现支持取消的 Promise 及其应用场景

支持取消的 Promise 是处理异步操作的重要工具，特别是在用户交互或资源管理中。

```js
// 1. 使用 AbortController 实现可取消的 Promise
function createCancellablePromise(promiseFn) {
  const controller = new AbortController();
  const { signal } = controller;
  
  const promise = promiseFn(signal).catch(error => {
    if (error.name === 'AbortError') {
      return Promise.reject(new Error('Promise cancelled'));
    }
    return Promise.reject(error);
  });
  
  // 返回带有取消方法的增强版 Promise
  const cancellablePromise = promise;
  cancellablePromise.cancel = () => controller.abort();
  
  return cancellablePromise;
}

// 使用示例
const fetchWithCancel = createCancellablePromise(signal => 
  fetch('https://api.example.com/data', { signal })
    .then(res => res.json())
);

// 取消 Promise
fetchWithCancel.cancel();

// 2. 应用场景例子：搜索面板
class SearchPanel {
  constructor() {
    this.currentRequest = null;
  }
  
  async search(query) {
    // 取消之前的请求
    if (this.currentRequest) {
      this.currentRequest.cancel();
    }
    
    // 创建新的请求
    this.currentRequest = createCancellablePromise(signal => 
      fetch(`https://api.example.com/search?q=${query}`, { signal })
        .then(res => res.json())
    );
    
    try {
      const results = await this.currentRequest;
      this.updateResults(results);
    } catch (error) {
      if (error.message !== 'Promise cancelled') {
        console.error('搜索失败:', error);
      }
    }
  }
  
  updateResults(results) {
    console.log('显示搜索结果:', results);
  }
}
```





## 手写 Promise 扩展方法：retry、timeout、finally 等

```js
/**
 * Promise 扩展方法集合
 * 包含：retry, timeout, delayedResolve, props, reflect, sequence, 
 * map, throttle, cache, progress
 */

/**
 * 为 Promise 添加重试功能
 * @param {Function} promiseFn - 返回Promise的函数
 * @param {Object} options - 重试选项
 * @returns {Promise} 带重试功能的Promise
 */
function retry(promiseFn, { 
  retries = 3, 
  retryDelay = 300, 
  onRetry = null,
  shouldRetry = error => true // 默认所有错误都重试
} = {}) {
  return new Promise(async (resolve, reject) => {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // 执行Promise函数
        const result = await promiseFn();
        return resolve(result);
      } catch (error) {
        lastError = error;
        
        // 判断是否应该重试
        if (!shouldRetry(error)) {
          return reject(error);
        }
        
        // 是否还有重试次数
        if (attempt >= retries) {
          break;
        }
        
        // 通知重试事件
        if (onRetry) {
          onRetry({ error, attempt: attempt + 1, remaining: retries - attempt - 1 });
        }
        
        // 等待重试延迟
        if (retryDelay > 0) {
          await new Promise(r => setTimeout(r, retryDelay));
        }
      }
    }
    
    // 达到最大重试次数，仍然失败
    reject(lastError);
  });
}

/**
 * 为 Promise 添加超时功能
 * @param {Promise} promise - 原始Promise
 * @param {number} ms - 超时毫秒数
 * @param {string} message - 超时错误消息
 * @returns {Promise} 带超时功能的Promise
 */
function timeout(promise, ms, message = 'Operation timed out') {
  let timeoutId;
  
  // 创建一个超时Promise
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
  
  // 竞争原始Promise和超时Promise
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * 为 Promise 添加延迟解析功能
 * @param {Promise} promise - 原始Promise
 * @param {number} ms - 最小解析时间（毫秒）
 * @returns {Promise} 至少延迟指定时间才解析的Promise
 */
function delayedResolve(promise, ms) {
  const delay = new Promise(resolve => setTimeout(resolve, ms));
  
  return Promise.all([promise, delay])
    .then(([result]) => result);
}

/**
 * 类似 Promise.all 但适用于对象
 * @param {Object} obj - 包含Promise的对象
 * @returns {Promise<Object>} 解析后的结果对象
 */
function props(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return Promise.reject(new TypeError('Expected an object'));
  }
  
  const keys = Object.keys(obj);
  const promises = keys.map(key => obj[key]);
  
  return Promise.all(promises).then(results => {
    return keys.reduce((resolved, key, index) => {
      resolved[key] = results[index];
      return resolved;
    }, {});
  });
}

/**
 * 转换Promise为始终成功的Promise
 * 失败时返回带 {error} 的对象，成功时返回带 {value} 的对象
 * @param {Promise} promise - 原始Promise
 * @returns {Promise} 一个总是解析的Promise
 */
function reflect(promise) {
  return promise
    .then(value => ({ status: 'fulfilled', value }))
    .catch(error => ({ status: 'rejected', error }));
}

/**
 * 按顺序执行Promise数组
 * @param {Array<Function>} promiseFns - 返回Promise的函数数组
 * @returns {Promise<Array>} 所有结果的数组
 */
function sequence(promiseFns) {
  return promiseFns.reduce(
    (promise, fn) => promise.then(result => 
      fn().then(value => [...result, value])
    ),
    Promise.resolve([])
  );
}

/**
 * 带并发限制的映射方法
 * @param {Array} items - 要处理的数组
 * @param {Function} fn - 返回Promise的映射函数
 * @param {number} concurrency - 并发限制
 * @returns {Promise<Array>} 结果数组
 */
function map(items, fn, concurrency = Infinity) {
  return new Promise((resolve, reject) => {
    const results = Array(items.length);
    let completed = 0;
    let started = 0;
    let running = 0;
    let errored = false;
    
    function handleResult(index, result) {
      results[index] = result;
      completed++;
      running--;
      
      // 如果所有任务已完成，解析Promise
      if (completed === items.length) {
        resolve(results);
      } else {
        // 否则继续启动新任务
        startNext();
      }
    }
    
    function startNext() {
      // 只要没有达到并发限制且还有任务，就继续启动
      while (running < concurrency && started < items.length && !errored) {
        const index = started++;
        running++;
        
        Promise.resolve(fn(items[index], index, items))
          .then(
            result => {
              if (!errored) handleResult(index, result);
            }, 
            error => {
              if (!errored) {
                errored = true;
                reject(error);
              }
            }
          );
      }
    }
    
    // 如果传入的数组为空，直接解析
    if (items.length === 0) {
      resolve([]);
    } else {
      // 启动初始任务
      startNext();
    }
  });
}

/**
 * 节流Promise，确保一定时间内只执行一次
 * @param {Function} promiseFn - 返回Promise的函数 
 * @param {number} wait - 等待时间
 * @returns {Function} 节流后的函数
 */
function throttle(promiseFn, wait) {
  let lastResult = null;
  let lastTime = 0;
  let pending = false;
  
  return function(...args) {
    const now = Date.now();
    
    // 如果在等待时间内且没有等待中的请求，返回上次结果
    if (!pending && now - lastTime < wait) {
      return Promise.resolve(lastResult);
    }
    
    // 如果已经超过等待时间或没有上次结果
    if (now - lastTime >= wait) {
      lastTime = now;
      pending = true;
      
      return promiseFn(...args)
        .then(result => {
          lastResult = result;
          pending = false;
          return result;
        })
        .catch(error => {
          pending = false;
          return Promise.reject(error);
        });
    }
    
    // 如果正在等待，返回一个Promise等待当前执行完成
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!pending) {
          clearInterval(checkInterval);
          resolve(lastResult);
        }
      }, 30);
    });
  };
}

/**
 * 为Promise添加缓存功能
 * @param {Function} promiseFn - 返回Promise的函数
 * @param {Object} options - 缓存选项
 * @returns {Function} 带缓存的函数
 */
function cache(promiseFn, { 
  maxSize = 100, 
  maxAge = 60000, // 默认缓存1分钟
  keyFn = (...args) => JSON.stringify(args)
} = {}) {
  const cache = new Map();
  const timestamps = new Map();
  
  return async function(...args) {
    const key = keyFn(...args);
    const now = Date.now();
    
    // 检查是否有缓存项且未过期
    if (cache.has(key) && now - timestamps.get(key) < maxAge) {
      return cache.get(key);
    }
    
    // 缓存未命中，执行原始函数
    try {
      const result = await promiseFn(...args);
      
      // 如果缓存太大，删除最旧的项
      if (cache.size >= maxSize) {
        const oldestKey = [...timestamps.entries()]
          .sort((a, b) => a[1] - b[1])[0][0];
        
        cache.delete(oldestKey);
        timestamps.delete(oldestKey);
      }
      
      // 缓存结果
      cache.set(key, result);
      timestamps.set(key, now);
      
      return result;
    } catch (error) {
      // 不缓存错误
      throw error;
    }
  };
}

/**
 * 为Promise添加进度报告功能
 * @param {Array<Promise>} promises - Promise数组
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Array>} 结果数组
 */
function progress(promises, onProgress) {
  if (!Array.isArray(promises)) {
    return Promise.reject(new TypeError('Expected an array of promises'));
  }
  
  const total = promises.length;
  let completed = 0;
  
  // 通知初始进度
  if (onProgress) {
    onProgress({ completed, total, percent: 0 });
  }
  
  // 如果没有promise，立即完成
  if (total === 0) {
    if (onProgress) {
      onProgress({ completed: 0, total: 0, percent: 100 });
    }
    return Promise.resolve([]);
  }
  
  // 包装每个Promise以报告进度
  const wrappedPromises = promises.map(promise => 
    Promise.resolve(promise)
      .then(value => {
        completed++;
        
        if (onProgress) {
          onProgress({
            completed,
            total,
            percent: Math.round((completed / total) * 100)
          });
        }
        
        return value;
      })
      .catch(error => {
        completed++;
        
        if (onProgress) {
          onProgress({
            completed,
            total,
            percent: Math.round((completed / total) * 100)
          });
        }
        
        return Promise.reject(error);
      })
  );
  
  return Promise.all(wrappedPromises);
}

/**
 * 实现类似 Promise.prototype.finally 的功能
 * 兼容不支持 finally 的环境
 * @param {Promise} promise - 原始Promise
 * @param {Function} onFinally - 无论成功失败都会执行的回调
 * @returns {Promise} 返回原始Promise的结果
 */
function promiseFinally(promise, onFinally) {
  // 确保回调是函数
  const cb = typeof onFinally === 'function' 
    ? onFinally 
    : () => {};
  
  return promise.then(
    // 成功情况
    value => Promise.resolve(cb()).then(() => value),
    // 失败情况
    error => Promise.resolve(cb()).then(() => Promise.reject(error))
  );
}

/**
 * 实现类似 Promise.allSettled 的功能
 * 兼容不支持 allSettled 的环境
 * @param {Array<Promise>} promises - Promise数组
 * @returns {Promise<Array>} 全部结果的数组，每个结果包含status和value/reason
 */
function allSettled(promises) {
  return Promise.all(
    promises.map(promise => 
      Promise.resolve(promise)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
}

/**
 * 实现类似 Promise.any 的功能
 * 兼容不支持 any 的环境
 * @param {Array<Promise>} promises - Promise数组 
 * @returns {Promise} 第一个成功的Promise结果
 */
function any(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises) || promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }
    
    let rejectionCount = 0;
    const errors = new Array(promises.length);
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(error => {
          errors[index] = error;
          rejectionCount++;
          
          // 如果所有promise都被拒绝
          if (rejectionCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
}

/**
 * 创建一个可以无限链式调用的Promise
 * @param {Function} executor - Promise执行器
 * @returns {Promise} 可链式调用的Promise
 */
function chainablePromise(executor) {
  // 创建基础Promise
  const promise = new Promise(executor);
  
  // 代理所有Promise方法
  const chainable = new Proxy(promise, {
    get(target, prop) {
      // 获取原始方法
      const method = target[prop];
      
      // 如果不是函数或已经处理过，直接返回
      if (typeof method !== 'function' || prop === 'then' || prop === 'catch' || prop === 'finally') {
        return method;
      }
      
      // 返回一个包装函数
      return function(...args) {
        // 调用原始方法，返回结果
        const result = method.apply(target, args);
        
        // 如果结果是Promise，使其可链式调用
        if (result instanceof Promise) {
          return new Proxy(result, chainable);
        }
        
        return result;
      };
    }
  });
  
  // 重写 then, catch, finally 方法以保持链式调用
  chainable.then = function(onFulfilled, onRejected) {
    return chainablePromise((resolve, reject) => {
      promise.then(
        value => {
          if (!onFulfilled) {
            resolve(value);
            return;
          }
          
          try {
            resolve(onFulfilled(value));
          } catch (error) {
            reject(error);
          }
        },
        reason => {
          if (!onRejected) {
            reject(reason);
            return;
          }
          
          try {
            resolve(onRejected(reason));
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };
  
  chainable.catch = function(onRejected) {
    return this.then(undefined, onRejected);
  };
  
  chainable.finally = function(onFinally) {
    return this.then(
      value => {
        onFinally();
        return value;
      },
      reason => {
        onFinally();
        throw reason;
      }
    );
  };
  
  return chainable;
}

// 使用示例
async function examples() {
  // 使用 retry 扩展
  const fetchWithRetry = () => retry(
    () => fetch('https://api.example.com/data').then(r => r.json()),
    { 
      retries: 3, 
      retryDelay: 1000,
      onRetry: ({ attempt }) => console.log(`重试第 ${attempt} 次`)
    }
  );
  
  // 使用 timeout 扩展
  const fetchWithTimeout = () => timeout(
    fetch('https://api.example.com/data').then(r => r.json()),
    5000, 
    '请求超时，请稍后再试'
  );
  
  // 使用 props 扩展
  const results = await props({
    users: fetch('https://api.example.com/users').then(r => r.json()),
    posts: fetch('https://api.example.com/posts').then(r => r.json()),
    comments: fetch('https://api.example.com/comments').then(r => r.json())
  });
  
  // 使用 reflect 扩展处理可能失败的请求
  const apis = [
    fetch('https://api.example.com/endpoint1').then(r => r.json()),
    fetch('https://api.example.com/endpoint2').then(r => r.json()),
    fetch('https://api.example.com/endpoint3').then(r => r.json())
  ];
  
  const apiResults = await Promise.all(apis.map(reflect));
  const successfulResults = apiResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
  
  // 使用带缓存的接口请求
  const cachedFetch = cache(
    url => fetch(url).then(r => r.json()),
    { maxAge: 60000, maxSize: 50 }
  );
  
  // 第一次请求会执行fetch
  const data1 = await cachedFetch('https://api.example.com/users');
  // 1分钟内再次请求相同URL会使用缓存
  const data2 = await cachedFetch('https://api.example.com/users');
  
  // 使用并发控制请求多个URL
  const urls = [
    'https://api.example.com/1',
    'https://api.example.com/2',
    'https://api.example.com/3',
    'https://api.example.com/4',
    'https://api.example.com/5'
  ];
  
  const concurrentResults = await map(
    urls, 
    url => fetch(url).then(r => r.json()),
    2 // 最多同时请求2个URL
  );
  
  // 使用进度报告下载多个文件
  const downloads = [
    fetch('https://example.com/file1'),
    fetch('https://example.com/file2'),
    fetch('https://example.com/file3')
  ];
  
  await progress(downloads, ({ completed, total, percent }) => {
    console.log(`下载进度: ${completed}/${total} (${percent}%)`);
  });
}

// 导出扩展方法
export {
  retry,
  timeout,
  delayedResolve,
  props,
  reflect,
  sequence,
  map,
  throttle,
  cache,
  progress,
  promiseFinally,
  allSettled,
  any,
  chainablePromise
};
```

## Promise 扩展方法的实际应用场景

### 1. 使用 retry 处理网络请求失败

```javascript
import { retry } from './promise-extensions';

// API 请求服务
class ApiService {
  async fetchUserData(userId) {
    return retry(
      async () => {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      },
      { 
        retries: 3,
        retryDelay: 1000,
        onRetry: ({ attempt, error }) => {
          console.log(`正在重试获取用户数据 (${attempt}/3): ${error.message}`);
        },
        // 只有在网络错误或服务器错误(5xx)时重试
        shouldRetry: error => 
          error.name === 'TypeError' || 
          (error.message && error.message.includes('5'))
      }
    );
  }
}
```

### 2. 使用 timeout 防止长时间挂起的请求

```javascript
import { timeout } from './promise-extensions';

// 用户搜索组件
class SearchComponent {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.resultsContainer = document.getElementById('results');
    
    this.searchInput.addEventListener('input', this.debounce(this.search.bind(this), 300));
  }
  
  async search(event) {
    const query = event.target.value.trim();
    if (query.length < 2) return;
    
    try {
      this.resultsContainer.innerHTML = '<div class="loading">搜索中...</div>';
      
      // 添加5秒超时
      const results = await timeout(
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
          .then(res => res.json()),
        5000,
        '搜索请求超时'
      );
      
      this.displayResults(results);
    } catch (error) {
      this.resultsContainer.innerHTML = `<div class="error">${error.message}</div>`;
    }
  }
  
  // 简单的防抖实现
  debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  
  displayResults(results) {
    // 显示结果的逻辑
  }
}
```

### 3. 使用 cache 优化重复请求

```javascript
import { cache } from './promise-extensions';

// 产品目录服务
class ProductCatalog {
  constructor() {
    // 缓存产品数据，有效期5分钟
    this.fetchProductWithCache = cache(
      this.fetchProduct.bind(this),
      { 
        maxAge: 5 * 60 * 1000, // 5分钟
        maxSize: 100 // 最多缓存100个产品
      }
    );
  }
  
  // 原始获取产品的方法
  async fetchProduct(productId) {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) throw new Error(`获取产品失败: ${response.status}`);
    return response.json();
  }
  
  // 获取多个产品
  async getProducts(productIds) {
    // 使用缓存版本的方法获取多个产品
    return Promise.all(productIds.map(id => this.fetchProductWithCache(id)));
  }
}
```

### 4. 使用 map 控制并发请求

```javascript
import { map } from './promise-extensions';

// 图片加载器
class ImageLoader {
  // 加载多张图片，限制并发数
  async loadImages(imageUrls) {
    const images = await map(
      imageUrls,
      url => this.loadSingleImage(url),
      3 // 最多同时加载3张图片
    );
    
    return images;
  }
  
  async loadSingleImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`无法加载图片: ${url}`));
      img.src = url;
    });
  }
}
```

### 5. 使用 progress 实现文件上传进度

```javascript
import { progress } from './promise-extensions';

// 文件上传器
class FileUploader {
  constructor() {
    this.progressBar = document.getElementById('upload-progress');
    this.uploadButton = document.getElementById('upload-button');
    
    this.uploadButton.addEventListener('click', this.uploadFiles.bind(this));
  }
  
  async uploadFiles() {
    const fileInput = document.getElementById('file-input');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) return;
    
    // 为每个文件创建上传Promise
    const uploadPromises = files.map(file => this.uploadFile(file));
    
    try {
      // 带进度的上传
      await progress(uploadPromises, ({ percent }) => {
        this.progressBar.style.width = `${percent}%`;
        this.progressBar.textContent = `${percent}%`;
      });
      
      alert('所有文件上传成功！');
    } catch (error) {
      alert(`上传过程中发生错误: ${error.message}`);
    }
  }
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}`);
    }
    
    return response.json();
  }
}
```

## 总结

以上这些实现和例子展示了如何在实际项目中处理各种异步编程挑战：

1. **异步错误处理最佳实践**：使用 try/catch 与 async/await 结合，以及错误边界和装饰器模式。
2. **Promise 并发控制**：使用 ConcurrencyManager 和 AsyncQueue 管理异步任务的并发执行。
3. **异步任务调度器**：支持优先级、并发控制、重试、取消和超时的完整实现。
4. **可取消的 Promise**：利用 AbortController 实现取消功能，特别适用于搜索和用户交互场景。
5. **Promise 扩展方法**：包括 retry、timeout、finally、props、reflect、sequence、map、throttle、cache 和 progress 等实用功能。
