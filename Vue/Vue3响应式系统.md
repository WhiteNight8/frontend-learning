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





# 构建与打包  

## 1. Vite 在 Vue 项⽬中的应⽤及原理分析，与 Webpack 的对⽐ 

### Vite 的核心原理

Vite 是一个由 Vue 团队开发的现代前端构建工具，主要由两部分组成：

1. **开发服务器**：基于原生 ES 模块提供快速的模块热更新（HMR）
2. **构建命令**：使用 Rollup 打包项目，针对生产环境优化

Vite 的主要优势在于其开发服务器启动极快，因为它不需要在启动时打包所有文件，而是利用浏览器原生支持的 ES 模块特性，实现按需编译：

## 2.  如何优化 Vue 项⽬的构建速度和产物体积 

### 构建速度优化

1. 缓存加速

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       // 启用持久化缓存
       cache: true
     }
   })
   ```

2. esbuild 优化

   ```javascript
   // vite.config.js
   export default defineConfig({
     esbuild: {
       // 使用esbuild进行更快的转换
       jsxFactory: 'h',
       jsxFragment: 'Fragment'
     }
   })
   ```

3. **多线程构建**: 在 Webpack 中可使用 `thread-loader`，Vite 默认已多线程

4. 合理使用 source-map

   ```javascript
   // 开发环境使用完整 source-map, 生产环境可禁用或使用简化版本
   build: {
     sourcemap: process.env.NODE_ENV === 'production' ? false : 'inline'
   }
   ```

### 产物体积优化

1. Tree-shaking

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       // 自动 tree-shaking
       treeshake: true
     }
   })
   ```

2. 代码分割

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['vue', 'vue-router', 'pinia'],
             // 将大型依赖单独分割
             lodash: ['lodash-es']
           }
         }
       }
     }
   })
   ```

3. 压缩优化

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,
           drop_debugger: true
         }
       }
     }
   })
   ```

4. 图片优化

   ```javascript
   // vite.config.js
   import viteImagemin from 'vite-plugin-imagemin'
   
   export default defineConfig({
     plugins: [
       viteImagemin({
         gifsicle: { optimizationLevel: 7 },
         optipng: { optimizationLevel: 7 },
         mozjpeg: { quality: 80 },
         pngquant: { quality: [0.8, 0.9] },
         svgo: {
           plugins: [
             { name: 'removeViewBox' },
             { name: 'removeEmptyAttrs', active: false }
           ]
         }
       })
     ]
   })
   ```

5. 使用现代浏览器构建

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       target: 'es2015' // 或更现代的目标
     }
   })
   
   ```

## 3.  模块联邦在 Vue 项⽬中的应⽤，实现微前端架构 

模块联邦 (Module Federation) 是 Webpack 5 引入的一种高级特性，允许多个独立的构建组合成一个应用。在 Vue 项目中，可以用来实现微前端架构

```js
// 主应用配置 (webpack.config.js)
const { defineConfig } = require('@vue/cli-service')
const { ModuleFederationPlugin } = require('webpack').container

module.exports = defineConfig({
  publicPath: 'http://localhost:8080/',
  configureWebpack: {
    plugins: [
      new ModuleFederationPlugin({
        name: 'host',
        filename: 'remoteEntry.js',
        remotes: {
          app1: 'app1@http://localhost:8081/remoteEntry.js',
          app2: 'app2@http://localhost:8082/remoteEntry.js'
        },
        shared: {
          vue: {
            singleton: true,
            requiredVersion: '^3.2.0'
          },
          'vue-router': {
            singleton: true,
            requiredVersion: '^4.0.0'
          },
          pinia: {
            singleton: true,
            requiredVersion: '^2.0.0'
          }
        }
      })
    ]
  }
})

// 子应用1配置 (webpack.config.js)
const { defineConfig } = require('@vue/cli-service')
const { ModuleFederationPlugin } = require('webpack').container

module.exports = defineConfig({
  publicPath: 'http://localhost:8081/',
  configureWebpack: {
    plugins: [
      new ModuleFederationPlugin({
        name: 'app1',
        filename: 'remoteEntry.js',
        exposes: {
          './Feature': './src/components/Feature.vue',
          './routes': './src/router'
        },
        shared: {
          vue: {
            singleton: true,
            requiredVersion: '^3.2.0'
          },
          'vue-router': {
            singleton: true,
            requiredVersion: '^4.0.0'
          }
        }
      })
    ]
  }
})

// 在主应用中异步加载子应用组件
// src/App.vue
<template>
  <div class="app">
    <h1>主应用</h1>
    <Suspense>
      <RemoteFeature />
    </Suspense>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    RemoteFeature: defineAsyncComponent(() => import('app1/Feature'))
  }
}
</script>

// 在Vite中通过插件实现模块联邦
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'host-app',
      remotes: {
        remote_app: 'http://localhost:5001/assets/remoteEntry.js',
      },
      shared: ['vue']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name].js',
        minifyInternalExports: false
      }
    }
  }
})
```



## 4. Vue 库的按需加载设计与实现 

### 微前端架构实现要点

1. 共享依赖

   - 共享核心库如 Vue、Vue Router 和状态管理库，避免重复加载

2. 应用间通信

   - 使用 CustomEvent 事件总线
   - 利用共享状态库如 Pinia
   - 使用 URL 参数传递简单状态

3. 样式隔离

   - 使用 CSS Modules 或 CSS-in-JS
   - 采用命名空间避免冲突
   - 考虑 Shadow DOM 实现完全隔离

4. 路由整合

   ```javascript
   // 主应用中整合子应用路由
   const router = createRouter({
     history: createWebHistory(),
     routes: [
       ...localRoutes,
       {
         path: '/app1',
         name: 'app1',
         component: () => import('./AppWrapper.vue'),
         children: () => import('app1/routes').then(m => m.default)
       }
     ]
   })
   ```

### 组件库按需加载方案

1. 基于 ES 模块的导入

   ```javascript
   // 直接导入需要的组件
   import { Button, Table } from 'my-vue-lib'
   ```

2. 自动导入插件

   

   ```javascript
   // vite.config.js
   import Components from 'unplugin-vue-components/vite'
   import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
   
   export default defineConfig({
     plugins: [
       Components({
         resolvers: [ElementPlusResolver()]
       })
     ]
   })
   ```

3. 按需加载插件设计实现

   ```javascript
   // plugin-component.js - 组件库插件核心
   import { kebabCase } from 'lodash-es'
   
   const components = import.meta.glob('./components/*.vue')
   
   export default {
     install(app) {
       for (const path in components) {
         const name = path.match(/\.\/components\/(.*?)\.vue$/)[1]
         app.component(name, defineAsyncComponent(() => components[path]()))
       }
     }
   }
   
   // 单个组件导出
   export { default as Button } from './components/Button.vue'
   export { default as Input } from './components/Input.vue'
   // ...其他组件
   ```

### 路由级别的代码分割

```javascript
// router/index.js
const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue') // 懒加载路由组件
  },
  {
    path: '/about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
    // 嵌套路由也可以懒加载
    children: [
      {
        path: 'analytics',
        component: () => import('../views/dashboard/Analytics.vue')
      }
    ]
  }
]
```



## 5. Vue 项⽬的构建流⽔线设计与 CI/CD 实践 

```
# GitHub Actions 工作流示例
name: Vue App CI/CD Pipeline

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  # 代码质量检查
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run ESLint
        run: npm run lint
      - name: Run TypeScript check
        run: npm run type-check

  # 单元测试
  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # 构建
  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Analyze bundle size
        run: npm run analyze
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist

  # 部署到预发环境
  deploy-staging:
    if: github.ref == 'refs/heads/dev'
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v3
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist
      - name: Deploy to staging
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: my-vue-app-staging
          channelId: live

  # 部署到生产环境
  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v3
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist
      - name: Deploy to production
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: my-vue-app-prod
          channelId: live

# GitLab CI/CD 工作流示例
stages:
  - setup
  - test
  - build
  - analyze
  - deploy

variables:
  NODE_VERSION: "16"
  NPM_CACHE_DIR: "$CI_PROJECT_DIR/.npm"

# 缓存 node_modules
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - $NPM_CACHE_DIR
    - node_modules/

install_dependencies:
  stage: setup
  image: node:${NODE_VERSION}
  script:
    - npm ci --cache $NPM_CACHE_DIR

lint:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm run lint
    - npm run type-check

unit_test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm run test:unit
  artifacts:
    paths:
      - coverage/
    reports:
      junit: coverage/junit.xml

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

bundle_analysis:
  stage: analyze
  image: node:${NODE_VERSION}
  script:
    - npm run analyze
  artifacts:
    paths:
      - stats.html

deploy_staging:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm install -g firebase-tools
    - firebase use staging
    - firebase deploy --only hosting --token $FIREBASE_TOKEN
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - dev

deploy_production:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm install -g firebase-tools
    - firebase use production
    - firebase deploy --only hosting --token $FIREBASE_TOKEN
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
```



### CI/CD 最佳实践

1. 分支策略
   - 主分支 (main/master): 稳定版本，用于生产部署
   - 开发分支 (dev): 集成各种功能，用于测试部署
   - 功能分支 (feature/*): 单个功能开发
   - 修复分支 (hotfix/*): 紧急 bug 修复
2. 环境配置
   - 使用环境变量区分不同环境 (.env.development, .env.production)
   - 敏感信息存储在 CI/CD 系统的安全变量中
3. 自动化测试
   - 单元测试: Jest 或 Vitest
   - 组件测试: Vue Test Utils
   - E2E 测试: Cypress 或 Playwright
4. 构建分析与优化
   - 使用 `rollup-plugin-visualizer` 或 `webpack-bundle-analyzer`
   - 持续监控构建产物大小变化
5. 部署策略
   - 蓝绿部署: 完全并行的两个环境
   - 金丝雀发布: 先向部分用户发布
   - A/B 测试: 不同版本并行提供给不同用户



## 6.  详解 Vue SFC 的构建流程及⾃定义块处理

### Vue SFC 构建流程

Vue 单文件组件 (SFC) 的构建过程由 `@vue/compiler-sfc` 处理，主要包括以下步骤：

1. 解析阶段将 .vue文件解析为 SFC 描述对象

   ```javascript
   const { parse } = require('@vue/compiler-sfc')
   const sfc = parse(source, { filename })
   ```

2. 处理阶段

   : 处理各个块 (block)

   - `<template>`: 编译为渲染函数
   - `<script>`: 处理为 JS 模块
   - `<style>`: 提取并处理 CSS

3. **代码生成阶段**: 将处理后的各块组合成最终输出

### 自定义块处理

Vue SFC 允许添加自定义块，如 `<docs>`、`<i18n>` 等，可以通过加载器插件处理它们：

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      customElement: /^my-/,
      // 自定义块处理
      customBlockTransforms: {
        i18n(block) {
          return `export default ${JSON.stringify(block.content)}`
        },
        docs(block) {
          return `export default function(Component) {
            Component.docs = ${JSON.stringify(block.content)}
          }`
        }
      }
    })
  ]
}
```

### 实现自定义 Vite 插件处理 Vue SFC

```javascript
// vite-plugin-vue-docs.js
export default function vueDocsPlugin() {
  const virtualModuleId = 'virtual:vue-docs'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  
  let docs = {}
  
  return {
    name: 'vite-plugin-vue-docs',
    
    transform(code, id) {
      // 处理 .vue 文件
      if (id.endsWith('.vue')) {
        const customBlockMatch = code.match(/<docs>([\s\S]*?)<\/docs>/)
        
        if (customBlockMatch) {
          const componentName = id.split('/').pop().replace('.vue', '')
          docs[componentName] = customBlockMatch[1].trim()
          
          // 移除自定义块，防止 Vue 编译器报错
          return code.replace(/<docs>[\s\S]*?<\/docs>/, '')
        }
      }
      
      // 提供虚拟模块
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(docs)}`
      }
    },
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    }
  }
}

// 使用方式
// 在组件中
/*
<docs>
这是按钮组件的文档。
它用于触发操作。
</docs>

<template>
  <button class="btn">{{ text }}</button>
</template>
*/

// 在应用中
/*
import vueDocs from 'virtual:vue-docs'
console.log(vueDocs.Button) // 输出按钮组件的文档
*/
```

##  

## 7.  ⼤型 Vue 项⽬的分包策略与缓存优化

### 分包策略

1. 路由级分包

   ```javascript
   // router/index.js
   const routes = [
     {
       path: '/dashboard',
       // 路由级代码分割
       component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue')
     }
   ]
   ```

2. 模块级分包

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             // 框架代码分离
             'vue-vendor': ['vue', 'vue-router', 'pinia'],
             // UI 组件库分离
             'ui-vendor': ['element-plus'],
             // 工具库分离
             'utils-vendor': ['lodash-es', 'axios', 'dayjs']
           }
         }
       }
     }
   })
   ```

3. 动态导入

   ```javascript
   // 按需加载大型组件
   const Editor = defineAsyncComponent(() => 
     import(/* webpackChunkName: "editor" */ './components/Editor.vue')
   )
   
   // 条件加载功能模块
   if (user.hasPermission('analytics')) {
     import(/* webpackChunkName: "analytics" */ './modules/analytics')
       .then(module => {
         app.use(module.default)
       })
   }
   ```

### 缓存优化策略

1. 文件名哈希

   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           // 使用内容哈希命名
           entryFileNames: 'js/[name].[hash].js',
           chunkFileNames: 'js/[name].[hash].js',
           assetFileNames: 'assets/[name].[hash].[ext]'
         }
       }
     }
   })
   ```

2. 运行时缓存

   - 利用 Service Worker 缓存关键资源
   - 实现应用外壳架构 (App Shell)

   ```javascript
   // vite.config.js
   import { VitePWA } from 'vite-plugin-pwa'
   
   export default defineConfig({
     plugins: [
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           // 缓存策略
           runtimeCaching: [
             {
               urlPattern: /^https:\/\/api\.example\.com\/.*/i,
               handler: 'NetworkFirst',
               options: {
                 cacheName: 'api-cache',
                 expiration: {
                   maxEntries: 100,
                   maxAgeSeconds: 60 * 60 * 24 // 24小时
                 }
               }
             },
             {
               urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'images-cache',
                 expiration: {
                   maxEntries: 60,
                   maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
                 }
               }
             }
           ]
         }
       })
     ]
   })
   ```

3. 预加载关键资源

   :

   ```html
   <!-- index.html -->
   <head>
     <!-- 预加载关键JS文件 -->
     <link rel="modulepreload" href="/assets/vendor.js">
     
     <!-- 预加载可能需要的组件 -->
     <link rel="prefetch" href="/assets/Dashboard.js">
     
     <!-- 预连接到API域名 -->
     <link rel="preconnect" href="https://api.example.com">
   </head>
   ```

4. 共享运行时

   : 在微前端架构中，共享核心库以减少重复加载：

   ```javascript
   // moduleFederation.config.js
   new ModuleFederationPlugin({
     shared: {
       vue: { 
         singleton: true,
         requiredVersion: "^3.2.0" 
       },
       'vue-router': { 
         singleton: true,
         requiredVersion: "^4.0.0" 
       },
       pinia: { 
         singleton: true,
         requiredVersion: "^2.0.0" 
       }
     }
   })
   ```

### 高级缓存技巧

1. HTTP 缓存控制

   

   ```javascript
   // server.js (Express)
   app.use('/assets', express.static('dist/assets', {
     etag: true,
     lastModified: true,
     maxAge: '1y', // 静态资源缓存1年
     immutable: true // 不变资源标识
   }))
   
   app.use('/', express.static('dist', {
     etag: true,
     lastModified: true,
     maxAge: '1d' // HTML 缓存1天
   }))
   ```

2. 依赖预构建

   : Vite 默认预构建 node_modules 依赖，加速开发:

   ```javascript
   // vite.config.js
   export default defineConfig({
     optimizeDeps: {
       include: [
         'vue', 'vue-router', 'pinia',
         'lodash-es', 'axios'
       ]
     }
   })
   ```
