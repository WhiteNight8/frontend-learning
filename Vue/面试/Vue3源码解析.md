# Vue3架构概览

## 响应式系统

Vue3的响应式系统核心是基于Proxy实现的的

reactive函数的工作原理

react函数接受一个对象，返回该对象的响应式代理

```js
function reactive(target) {
  // 如果目标已经是响应式对象，直接返回
  if (isReactive(target)) {
    return target
  }
  
  // 创建响应式代理
  const proxy = new Proxy(target, mutableHandlers)
  // 存储原始对象到代理对象的映射
  proxyMap.set(target, proxy)
  
  return proxy
}

const mutableHandlers = {
  get(target, key, receiver) {
    // 追踪依赖
    track(target, TrackOpTypes.GET, key)
    
    const res = Reflect.get(target, key, receiver)
    // 如果结果是对象，递归地进行响应式转换
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  },
  
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    
    // 如果值发生改变，触发依赖更新
    if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }
    return result
  }
  // 其他拦截器...
}
```

trigger和track的工作原理

track：在属性读取时收集依赖

trigger：属性修改时触发依赖更新

```js
// 存储依赖关系的全局变量
const targetMap = new WeakMap()
// 当前激活的 effect
let activeEffect = null

function track(target, type, key) {
  if (!activeEffect) return
  
  // 获取当前对象的依赖映射
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  // 获取特定属性的依赖集合
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  // 添加当前 effect 作为依赖
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

function trigger(target, type, key, newValue, oldValue) {
  // 获取对象的依赖映射
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  // 获取需要触发的依赖集合
  const effects = new Set()
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => effects.add(effect))
    }
  }
  
  // 添加属性相关的依赖
  if (key !== undefined) {
    add(depsMap.get(key))
  }
  
  // 运行所有收集的 effects
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}
```

## 简易版Vue3响应式系统的实现

```js
// 存储对象和它们的响应式代理之间的映射
const proxyMap = new WeakMap()

// 存储依赖关系的 WeakMap
const targetMap = new WeakMap()

// 当前激活的 effect
let activeEffect = undefined

// 创建响应式对象
function reactive(target) {
  // 如果不是对象，直接返回
  if (typeof target !== 'object' || target === null) {
    return target
  }
  
  // 如果该对象已经有了响应式代理，直接返回已有的代理
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  
  // 创建代理
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      
      // 追踪依赖
      track(target, key)
      
      // 如果返回值是对象，将其转换为响应式对象
      if (typeof res === 'object' && res !== null) {
        return reactive(res)
      }
      return res
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      // 如果值确实改变了，触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      return result
    }
  })
  
  // 存储原始对象到代理的映射
  proxyMap.set(target, proxy)
  return proxy
}

// ref 实现
function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue
        trigger(refObject, 'value')
      }
    }
  }
  return refObject
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (dep) {
    [...dep].forEach(effect => {
      // 避免递归调用导致的栈溢出
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      }
    })
  }
}

// effect 实现
function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn
      // 清除之前的依赖关系
      cleanup(effectFn)
      return fn()
    } finally {
      activeEffect = undefined
    }
  }
  
  // 存储 effect 的配置项
  effectFn.options = options
  // 用于存储所有与该 effect 相关的依赖集合
  effectFn.deps = []
  // 存储调度器函数
  if (options.scheduler) {
    effectFn.scheduler = options.scheduler
  }
  
  // 执行 effect 并返回
  if (!options.lazy) {
    effectFn.run = effectFn
    effectFn()
  } else {
    effectFn.run = effectFn
  }
  
  return effectFn
}

// 清除 effect 的依赖关系
function cleanup(effect) {
  // 从依赖集合中移除当前 effect
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}

// computed 实现
function computed(getter) {
  // 缓存值和脏状态标记
  let value
  let dirty = true
  
  // 创建一个 effect
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      // 当依赖项发生变化时，将脏状态标记为 true
      if (!dirty) {
        dirty = true
        // 触发计算属性的订阅者
        trigger(computedObj, 'value')
      }
    }
  })
  
  const computedObj = {
    get value() {
      // 如果是脏的，重新计算值
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 收集对计算属性的依赖
      track(computedObj, 'value')
      return value
    }
  }
  
  return computedObj
}

// 使用示例
const user = reactive({
  name: 'Alice',
  age: 25
})

const nameRef = ref('Bob')

effect(() => {
  console.log(`User: ${user.name}, Age: ${user.age}`)
})

// 会触发 effect 重新执行
user.name = 'Charlie'

effect(() => {
  console.log(`Name from ref: ${nameRef.value}`)
})

// 会触发 effect 重新执行
nameRef.value = 'David'

// 计算属性示例
const ageDoubled = computed(() => user.age * 2)

effect(() => {
  console.log(`Age doubled: ${ageDoubled.value}`)
})

// 修改 user.age 会触发 ageDoubled 的重新计算，并导致相关 effect 执行
user.age = 30
```

effect，ref和computed实现区别

- effect实现

  `effect` 是响应式系统的核心，它接收一个函数并立即执行

  执行期间会自动追踪其依赖的响应式数据

  当依赖的数据变化时会重新执行

  支持调度器选项，可以自定义触发时的行为

- ref实现

  `ref` 用于基本类型的响应式封装

  创建一个带有 `value` 属性的对象

  通过 getter/setter 拦截对 `value` 的访问和修改

  在 getter 中调用 `track`，在 setter 中调用 `trigger`

- computed实现

  `computed` 创建一个计算属性

  结合了 `effect` 和 `ref` 的特性

  使用 `lazy` 选项延迟计算

  通过 `dirty` 标志缓存计算结果

  使用调度器实现依赖变化时的延迟重新计算

##  Vue 3 的 Proxy 与 Vue 2 的 Object.defineProperty 对比

![image-20250512100751169](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250512100751169.png)

性能对比：

初始化性能：

Vue 2: 递归遍历对象所有属性进行劫持，初始化开销大

Vue 3: 仅代理对象本身，属性访问时才递归代理，初始化更快

运行时性能：

Vue 2: 由于初始化时已完成所有属性劫持，运行时查找依赖更快

Vue 3: 每次访问深层属性可能触发新的代理创建，但通过缓存代理对象优化了性能

内存使用：

Vue 3 利用 WeakMap 存储原始对象到代理对象的映射，避免内存泄漏

Vue 2 对大型对象的劫持会创建大量的 getter/setter，占用更多内存



##  深层嵌套对象的响应式处理及性能优化

Vue 3 采用了"懒递归"的方式处理深层嵌套对象:

```js
function reactive(target) {
  // ...创建代理
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // ...
      const res = Reflect.get(target, key, receiver)
      // 只有当访问值为对象时才递归创建响应式
      if (isObject(res)) {
        return reactive(res)
      }
      return res
    }
    // ...
  })
}
```

性能优化技巧

- 代理缓存：使用 WeakMap 缓存已创建的代理，避免重复创建
- 兰递归转换：只在实际访问嵌套对象时才进行响应式转换
- 只读代理：对于不需要触发更新的数据，使用 `readonly` 创建只读代理
- 浅层响应：提供 `shallowReactive` 和 `shallowRef` API 只对顶层属性做响应式
- 集合类型优化：特殊处理 Map、Set 等集合类型，提供专门的处理器

## 处理循环依赖问题

循环依赖指的是两个或者多个对象相互引用的情况

- WeakMap缓存

  使用 WeakMap 存储已经代理过的对象

  检查对象是否已经有代理，避免无限递归

- 懒递归代理

  在访问属性时才进行递归代理，而不是初始化时

- 标记和检测

  在处理过程中标记对象正在被处理

  如果检测到正在处理的对象被再次访问，则返回已有的代理

## WeakMap，WeakSet在响应式系统中的应用

WeakMap：

**存储原始对象到代理的映射**:

```javascript
const proxyMap = new WeakMap()
```

- 避免内存泄漏，当原始对象不再被引用时，映射关系也会被垃圾回收

**存储依赖关系**:

```javascript
const targetMap = new WeakMap()
```

- 当响应式对象被垃圾回收时，相关的依赖关系也会被回收

WeakSet

**标记原始值**:

```javascript
const rawSet = new WeakSet()
```

- 用于标记和识别原始对象，区分原始对象和代理对象

**避免重复依赖收集**:

- 可以使用 WeakSet 存储已收集过的依赖，避免重复添加



### 重要性

1. 内存管理:
   - 允许对象被垃圾回收，即使它们仍然被响应式系统引用
   - 避免内存泄漏，尤其是在长时间运行的应用中
2. 性能优化:
   - 减少冗余的代理创建和依赖收集
   - 当对象不再使用时，相关的响应式资源会被自动清理

## Vue 3 中的响应式陷阱及避免方法

### 常见响应式陷阱

1. 解构丢失响应性:

   ```javascript
   const { name } = reactive({ name: 'John' })
   // name 不再是响应式的
   ```

2. **数组索引和长度修改**: 虽然比 Vue 2 好，但某些操作仍可能引起非预期行为

3. 新属性添加:

   ```javascript
   const obj = reactive({})
   // 在模板中使用 obj.newProp 前需要先定义
   obj.newProp = 'value'
   ```

4. **Set/Map 的嵌套数据**: 复杂嵌套的集合类型可能导致响应性追踪不完整

5. **Vue 2 兼容 API 的限制**: 使用 `setup()` 与 `data()` 混合使用时可能出现的问题

### 避免方法

1. 使用 toRefs/toRef:

   ```javascript
   const state = reactive({ name: 'John' })
   const { name } = toRefs(state) // name 保持响应式
   ```

2. 使用 ref 包装基本类型

   ```javascript
   const count = ref(0) // 而不是从 reactive 解构
   ```

3. 提前声明所有属性

   ```javascript
   const state = reactive({
     dynamicProp: null // 提前声明，即使值为 null
   })
   ```

4. 使用 computed 处理复杂计算

   

   ```javascript
   const fullName = computed(() => `${user.firstName} ${user.lastName}`)
   ```

5. 避免频繁替换整个对象

   ```javascript
   // 不好的做法
   state.value = newObject
   
   // 好的做法
   Object.assign(state.value, newObject)
   ```

6. 正确使用 reactive 和 ref:

   - 对象使用 `reactive`
   - 基本类型使用 `ref`





构建与打包  1. Vite 在 Vue 项⽬中的应⽤及原理分析，与 Webpack 的对⽐ 2.  如何优化 Vue 项⽬的构建速度和产物体积 3.  模块联邦在 Vue 项⽬中的应⽤，实现微前端架构 4. Vue 库的按需加载设计与实现 5. Vue 项⽬的构建流⽔线设计与 CI/CD 实践 6.  详解 Vue SFC 的构建流程及⾃定义块处理 7.  ⼤型 Vue 项⽬的分包策略与缓存优化

