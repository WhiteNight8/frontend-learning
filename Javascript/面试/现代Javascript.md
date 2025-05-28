# 现代 JavaScript 与 TypeScript 

## ES2022-2025 新特性深度解析与实际应用

### ES2022 (ES13) 关键特性

#### Class Fields & Private Methods

```javascript
class User {
  // 公共字段
  name = 'Anonymous';
  
  // 私有字段
  #password = '';
  
  // 私有方法
  #validatePassword(pwd) {
    return pwd.length >= 8;
  }
  
  // 静态块
  static {
    console.log('User class initialized');
  }
  
  setPassword(pwd) {
    if (this.#validatePassword(pwd)) {
      this.#password = pwd;
    }
  }
}
```

#### Top-level await

```javascript
// 直接在模块顶层使用 await
const config = await fetch('/api/config').then(r => r.json());
const db = await initDatabase(config.dbUrl);

export { db };
```

#### Array.at() 方法

```javascript
const arr = [1, 2, 3, 4, 5];
console.log(arr.at(-1)); // 5 (最后一个元素)
console.log(arr.at(-2)); // 4 (倒数第二个)
```

#### Object.hasOwn()

```javascript
// 替代 hasOwnProperty 的更安全方法
const obj = { name: 'John' };
console.log(Object.hasOwn(obj, 'name')); // true
console.log(Object.hasOwn(obj, 'toString')); // false
```



### ES2023 (ES14) 新特性

#### Array.findLast() 和 findLastIndex()

```javascript
const numbers = [1, 5, 10, 15, 20];
const lastEven = numbers.findLast(n => n % 2 === 0); // 20
const lastEvenIndex = numbers.findLastIndex(n => n % 2 === 0); // 4
```

#### Array.toSorted(), toReversed(), toSpliced(), with()

```javascript
const original = [3, 1, 4, 1, 5];

// 非破坏性排序
const sorted = original.toSorted(); // [1, 1, 3, 4, 5]
console.log(original); // [3, 1, 4, 1, 5] (未改变)

// 非破坏性反转
const reversed = original.toReversed(); // [5, 1, 4, 1, 3]

// 非破坏性替换
const replaced = original.with(2, 99); // [3, 1, 99, 1, 5]
```



### ES2024 (ES15) 新特性

#### Object.groupBy() 和 Map.groupBy()

```javascript
const products = [
  { name: 'iPhone', category: 'electronics' },
  { name: 'Book', category: 'education' },
  { name: 'iPad', category: 'electronics' }
];

// 按类别分组
const grouped = Object.groupBy(products, item => item.category);
// {
//   electronics: [{ name: 'iPhone', ... }, { name: 'iPad', ... }],
//   education: [{ name: 'Book', ... }]
// }
```

#### Promise.withResolvers()

```javascript
function createDeferredPromise() {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  // 可以在任何地方调用 resolve 或 reject
  setTimeout(() => resolve('Success'), 1000);
  
  return promise;
}
```



### ES2025 预期特性

#### Temporal API (Stage 3)

```javascript
// 更好的日期时间处理
const now = Temporal.Now.plainDateTimeISO();
const meeting = Temporal.PlainDateTime.from('2025-06-15T14:30');
const duration = meeting.since(now);
console.log(duration.toString()); // PT2H30M (2小时30分钟)
```



## 深入理解装饰器 (Decorators) 提案及其实现原理

### 装饰器基础概念

装饰器是一种特殊的声明，能够附加到类、方法、属性或参数上，用于修改其行为。



#### 类装饰器

```javascript
function logged(target) {
  const original = target.prototype.constructor;
  target.prototype.constructor = function(...args) {
    console.log(`Creating instance of ${target.name}`);
    return original.apply(this, args);
  };
  return target;
}

@logged
class User {
  constructor(name) {
    this.name = name;
  }
}
```



#### 方法装饰器

```javascript
function measureTime(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} took ${end - start} milliseconds`);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @measureTime
  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```



#### 属性装饰器

```javascript
function validate(validator) {
  return function(target, propertyKey) {
    let value = target[propertyKey];
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return value;
      },
      set(newValue) {
        if (validator(newValue)) {
          value = newValue;
        } else {
          throw new Error(`Invalid value for ${propertyKey}`);
        }
      }
    });
  };
}

class Person {
  @validate(email => email.includes('@'))
  email = '';
}
```



### 装饰器工厂模式

```javascript
function configurable(value) {
  return function(target, propertyKey, descriptor) {
    descriptor.configurable = value;
    return descriptor;
  };
}

function enumerable(value) {
  return function(target, propertyKey, descriptor) {
    descriptor.enumerable = value;
    return descriptor;
  };
}

class Example {
  @configurable(false)
  @enumerable(false)
  method() {
    // 方法逻辑
  }
}
```



## TC39 提案流程与 JavaScript 未来发展方向

### TC39 提案阶段

#### Stage 0: Strawperson (稻草人阶段)

- 初步想法
- 需要 TC39 成员或注册贡献者提出
- 允许自由讨论和探索

#### Stage 1: Proposal (提案阶段)

- 正式提案
- 需要 Champion（倡导者）
- 确定问题和解决方案
- 示例 API 和高级算法

#### Stage 2: Draft (草案阶段)

- 提供初始规范文本
- 语法和语义的精确描述
- 可能会有重大变化

#### Stage 3: Candidate (候选阶段)

- 规范文本完整
- 需要实现和用户反馈
- 只允许有限的变更

#### Stage 4: Finished (完成阶段)

- 准备纳入标准
- 至少两个兼容的实现
- 编辑器签字同意

### 当前重要提案

#### Temporal API (Stage 3)

javascript

```javascript
// 替代 Date 的现代时间处理
const birthday = Temporal.PlainDate.from('1990-05-15');
const age = birthday.until(Temporal.Now.plainDateISO()).years;
```

#### Pattern Matching (Stage 1)

```javascript
// 模式匹配提案
const result = match (value) {
  when Number => `Number: ${value}`,
  when String => `String: ${value}`,
  when Array => `Array with ${value.length} items`,
  else => 'Unknown type'
};
```



## ESM 与 CommonJS 模块系统的区别与兼容处理

![image-20250528094821961](C:/Users/27019/AppData/Roaming/Typora/typora-user-images/image-20250528094821961.png)

### ESM 语法详解

```javascript
// 命名导出
export const PI = 3.14159;
export function calculateArea(radius) {
  return PI * radius * radius;
}

// 默认导出
export default class Circle {
  constructor(radius) {
    this.radius = radius;
  }
}

// 重新导出
export { PI as MATH_PI } from './constants.js';
export * from './utilities.js';
```



### CommonJS 语法

```javascript
// 导出
const PI = 3.14159;
function calculateArea(radius) {
  return PI * radius * radius;
}

module.exports = {
  PI,
  calculateArea
};

// 导入
const { PI, calculateArea } = require('./math');
const Circle = require('./circle');
```



### 兼容性处理策略

#### 在 ESM 中使用 CommonJS

```javascript
// 使用 createRequire
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const lodash = require('lodash');

// 动态导入
const lodash = await import('lodash');
```

#### package.json 配置

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js"
}
```



## JavaScript 中的元编程技术详解

### Proxy 对象深入应用

#### 创建响应式对象

```javascript
function createReactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      onChange(property, value, oldValue);
      return true;
    },
    
    get(target, property) {
      if (typeof target[property] === 'object' && target[property] !== null) {
        return createReactive(target[property], onChange);
      }
      return target[property];
    }
  });
}

const data = createReactive({}, (prop, newVal, oldVal) => {
  console.log(`${prop} changed from ${oldVal} to ${newVal}`);
});
```



#### 实现虚拟对象

```javascript
const virtualObject = new Proxy({}, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    // 动态生成属性
    return `Property ${prop} does not exist, but here's a default value!`;
  },
  
  has(target, prop) {
    return true; // 所有属性都存在
  },
  
  ownKeys(target) {
    return ['dynamicProp1', 'dynamicProp2', ...Object.keys(target)];
  }
});
```



### Reflect API 的使用

```javascript
class ValidationProxy {
  constructor(target, validators = {}) {
    this.target = target;
    this.validators = validators;
    
    return new Proxy(target, {
      set: (target, prop, value) => {
        return this.setValue(target, prop, value);
      }
    });
  }
  
  setValue(target, prop, value) {
    if (this.validators[prop]) {
      if (!this.validators[prop](value)) {
        throw new Error(`Invalid value for ${prop}`);
      }
    }
    return Reflect.set(target, prop, value);
  }
}

const user = new ValidationProxy({}, {
  age: value => typeof value === 'number' && value >= 0
});
```



### WeakMap 和 WeakSet 的高级应用

```javascript
// 私有数据存储
const privateData = new WeakMap();

class SecureClass {
  constructor(secret) {
    privateData.set(this, { secret });
  }
  
  getSecret() {
    return privateData.get(this).secret;
  }
}

// 对象关系映射
const relationships = new WeakMap();

function addRelationship(obj1, obj2, type) {
  if (!relationships.has(obj1)) {
    relationships.set(obj1, new Set());
  }
  relationships.get(obj1).add({ target: obj2, type });
}
```





## Symbol 与 Well-Known Symbols 的高级应用

### Symbol 基础概念

```javascript
// 创建唯一标识符
const id = Symbol('id');
const anotherId = Symbol('id');
console.log(id === anotherId); // false

// 全局 Symbol 注册表
const globalSymbol = Symbol.for('app.id');
const sameSymbol = Symbol.for('app.id');
console.log(globalSymbol === sameSymbol); // true
```



### Well-Known Symbols 应用

#### Symbol.iterator - 自定义迭代器

```javascript
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

const range = new Range(1, 5);
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```



#### Symbol.toPrimitive - 自定义类型转换

```javascript
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }
  
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return this.celsius;
      case 'string':
        return `${this.celsius}°C`;
      default:
        return `Temperature: ${this.celsius}°C`;
    }
  }
}

const temp = new Temperature(25);
console.log(+temp); // 25
console.log(`${temp}`); // "25°C"
```

#### Symbol.hasInstance - 自定义 instanceof

```javascript
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}

console.log([] instanceof MyArray); // true
console.log({} instanceof MyArray); // false
```

### Symbol 在元编程中的应用

```javascript
const PRIVATE_METHODS = Symbol('privateMethods');

class APIClient {
  constructor() {
    this[PRIVATE_METHODS] = {
      authenticate: () => {/* 私有认证逻辑 */},
      refreshToken: () => {/* 刷新令牌逻辑 */}
    };
  }
  
  async request(url, options) {
    await this[PRIVATE_METHODS].authenticate();
    // 公共请求逻辑
  }
}
```



## Records & Tuples 提案解析及其对不可变数据的影响

### Records & Tuples 基础语法

#### Record 语法

```javascript
// Record 语法 (提案中)
const userRecord = #{
  id: 1,
  name: "John",
  email: "john@example.com"
};

// 不可变特性
const updatedUser = #{
  ...userRecord,
  email: "newemail@example.com"
};
```



#### Tuple 语法

```javascript
// Tuple 语法 (提案中)
const coordinates = #[10, 20, 30];
const colors = #["red", "green", "blue"];

// 不可变操作
const newCoordinates = #[...coordinates, 40];
```

### 深度不可变性

```javascript
// 嵌套结构也是不可变的
const complexData = #{
  user: #{
    name: "Alice",
    preferences: #["dark-mode", "notifications"]
  },
  settings: #{
    theme: "dark",
    language: "en"
  }
};

// 任何嵌套修改都会创建新的不可变结构
const updated = #{
  ...complexData,
  user: #{
    ...complexData.user,
    name: "Bob"
  }
};
```



### 与现有不可变方案对比

#### 当前的不可变实现

```javascript
// 使用 Object.freeze (浅冻结)
const frozenObj = Object.freeze({ name: "John" });

// 使用 Immutable.js
import { Map, List } from 'immutable';
const immutableMap = Map({ name: "John" });

// 使用 Immer
import produce from 'immer';
const newState = produce(state, draft => {
  draft.user.name = "Jane";
});
```



### Records & Tuples 的优势

#### 性能优化

```javascript
// 结构共享优化
const largeRecord = #{
  // 大量数据
};

// 只修改一个字段，其他部分结构共享
const updated = #{
  ...largeRecord,
  status: "updated"
};
```

#### 类型安全 (配合 TypeScript)

```typescript
type UserRecord = #{
  readonly id: number;
  readonly name: string;
  readonly email: string;
};

const user: UserRecord = #{
  id: 1,
  name: "John",
  email: "john@example.com"
};
```



### 实际应用场景

#### 状态管理

```javascript
// Redux-like 状态管理
const initialState = #{
  users: #[],
  loading: false,
  error: null
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_USER':
      return #{
        ...state,
        users: #[...state.users, action.payload]
      };
    default:
      return state;
  }
}
```



#### 缓存和比较

```javascript
// 由于 Records & Tuples 是值类型，可以直接比较
const cache = new Map();

function getData(params) {
  const key = #{ ...params }; // Record 作为 key
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = expensiveOperation(params);
  cache.set(key, result);
  return result;
}
```



# TypeScript ⾼级特性

## TypeScript 类型系统的设计哲学与工作原理

### 设计哲学

TypeScript 的类型系统基于以下核心原则：

- **结构化类型系统 (Structural Typing)**：基于对象的形状而非名称来确定类型兼容性
- **渐进式类型化**：允许在现有 JavaScript 代码上逐步添加类型
- **类型擦除**：编译时进行类型检查，运行时移除类型信息
- **开放性原则**：优先保证正确的代码能够通过检查

### 工作原理

```typescript
// 结构化类型示例
interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

let point2d: Point2D = { x: 1, y: 2 };
let point3d: Point3D = { x: 1, y: 2, z: 3 };

// 结构兼容：Point3D 包含 Point2D 的所有属性
point2d = point3d; // ✓ 合法
// point3d = point2d; // ✗ 错误：缺少 z 属性
```



### 类型系统的核心概念

```typescript
// 类型别名与接口的区别
type TypeAlias = {
  name: string;
  age: number;
};

interface Interface {
  name: string;
  age: number;
}

// 接口可以声明合并
interface Interface {
  email: string;
}

// 类型别名更适合联合类型和复杂类型操作
type Status = 'loading' | 'success' | 'error';
type EventHandler<T> = (event: T) => void;
```



## 条件类型与分布式条件类型的高级应用

### 条件类型基础

```typescript
// 基本条件类型语法
type ConditionalType<T> = T extends string ? string[] : T[];

type StringArray = ConditionalType<string>; // string[]
type NumberArray = ConditionalType<number>; // number[]
```



### 分布式条件类型

```typescript
// 当 T 是联合类型时，条件类型会分布式应用
type ToArray<T> = T extends any ? T[] : never;

type UnionArrays = ToArray<string | number>; // string[] | number[]

// 实用工具：提取联合类型中的某些成员
type ExtractArrayTypes<T> = T extends (infer U)[] ? U : never;
type ArrayElementType = ExtractArrayTypes<string[] | number[] | boolean>;
// string | number (boolean 被过滤掉)
```



### 高级条件类型应用

```typescript
// 递归条件类型：深度扁平化数组类型
type DeepFlatten<T> = T extends (infer U)[]
  ? U extends any[]
    ? DeepFlatten<U>
    : U
  : T;

type NestedArray = number[][][];
type FlatType = DeepFlatten<NestedArray>; // number

// 条件类型与 infer 关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ParameterTypes<T> = T extends (...args: infer P) => any ? P : never;

function example(a: string, b: number): boolean {
  return true;
}

type ExampleReturn = ReturnType<typeof example>; // boolean
type ExampleParams = ParameterTypes<typeof example>; // [string, number]

// 模式匹配与字符串操作
type ExtractRouteParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type RouteParams = ExtractRouteParams<'/user/:id/post/:postId'>;
// { id: string; postId: string }
```



## 类型编程：使用 TypeScript 类型系统构建复杂类型

### 类型级别的编程

```typescript
// 类型级别的数组操作
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : [];

type FirstElement = Head<[1, 2, 3]>; // 1
type RestElements = Tail<[1, 2, 3]>; // [2, 3]

// 类型级别的字符串操作
type Split<S extends string, D extends string> = 
  S extends `${infer T}${D}${infer U}` 
    ? [T, ...Split<U, D>] 
    : [S];

type SplitResult = Split<'a.b.c', '.'>; // ['a', 'b', 'c']

// 递归类型：计算元组长度
type Length<T extends readonly any[]> = T['length'];

// 更复杂的递归：实现加法
type Tuple<T extends number, R extends readonly unknown[] = []> = 
  R['length'] extends T ? R : Tuple<T, readonly [...R, unknown]>;

type Add<A extends number, B extends number> = 
  [...Tuple<A>, ...Tuple<B>]['length'];

type Sum = Add<2, 3>; // 5 (类型级别的计算)
```



### 高级类型构造器

```typescript
// 深度只读类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? T[P] extends Function 
      ? T[P] 
      : DeepReadonly<T[P]>
    : T[P];
};

// 深度可选类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? T[P] extends Function 
      ? T[P] 
      : DeepPartial<T[P]>
    : T[P];
};

// 路径类型生成器
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type ObjectPaths<T> = PathsToStringProps<T>[number];

interface NestedObject {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: string;
    };
  };
}

type Paths = ObjectPaths<NestedObject>;
// ['user'] | ['user', 'profile'] | ['user', 'profile', 'name'] | 
// ['user', 'profile', 'age'] | ['user', 'settings'] | ['user', 'settings', 'theme']
```



##  映射类型与索引访问类型的高级应用

### 映射类型基础

```typescript
// 基本映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 键名重映射
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```



### 条件映射类型

```typescript
// 选择性映射
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

class Example {
  name: string = '';
  age: number = 0;
  getName(): string { return this.name; }
}

type ExampleData = NonFunctionProperties<Example>;
// { name: string; age: number }

// 基于值类型的映射
type TypedPropertyNames<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

type StringPropertyNames<T> = TypedPropertyNames<T, string>;
type NumberPropertyNames<T> = TypedPropertyNames<T, number>;
```



### 索引访问类型的高级应用

```typescript
// 深度索引访问
type DeepIndex<T, K> = K extends keyof T
  ? T[K]
  : K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? DeepIndex<T[First], Rest>
    : never
  : never;

interface Data {
  user: {
    profile: {
      name: string;
      contacts: {
        email: string;
      };
    };
  };
}

type UserName = DeepIndex<Data, 'user.profile.name'>; // string
type UserEmail = DeepIndex<Data, 'user.profile.contacts.email'>; // string

// 动态键值对类型
type DynamicObject<T extends Record<string, any>> = {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
  keys(): (keyof T)[];
  values(): T[keyof T][];
};
```



## TypeScript 中的协变与逆变深度解析

### 协变 (Covariance)

```typescript
// 协变：子类型可以赋值给父类型
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 在返回值位置，类型是协变的
type AnimalFactory = () => Animal;
type DogFactory = () => Dog;

let animalFactory: AnimalFactory;
let dogFactory: DogFactory = () => ({ name: 'Rex', breed: 'Labrador' });

animalFactory = dogFactory; // ✓ 协变：Dog 是 Animal 的子类型
```



### 逆变 (Contravariance)

```typescript
// 逆变：父类型可以赋值给子类型（在函数参数位置）
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let animalHandler: AnimalHandler = (animal) => console.log(animal.name);
let dogHandler: DogHandler;

dogHandler = animalHandler; // ✓ 逆变：处理 Animal 的函数可以处理 Dog

// 但反之不行
// animalHandler = dogHandler; // ✗ 错误：Dog 处理器不能处理所有 Animal
```



### 双变性问题与 strictFunctionTypes

```typescript
// 在严格模式下，函数参数是逆变的
interface EventListener<T> {
  (event: T): void;
}

interface MouseEvent {
  clientX: number;
  clientY: number;
}

interface ClickEvent extends MouseEvent {
  button: number;
}

let mouseListener: EventListener<MouseEvent>;
let clickListener: EventListener<ClickEvent>;

// 在严格模式下这是错误的
// clickListener = mouseListener; // ✗ 逆变：不能将父类型处理器赋给子类型
mouseListener = clickListener; // ✓ 逆变：子类型处理器可以赋给父类型
```



### 条件类型中的协变逆变

```typescript
// 利用协变逆变进行类型判断
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// 协变位置的条件类型
type Covariant<T> = T extends { a: infer U } ? U : never;

// 逆变位置的条件类型
type Contravariant<T> = T extends { a: (x: infer U) => void } ? U : never;

type CovariantResult = Covariant<{ a: string | number }>; // string | number
type ContravariantResult = Contravariant<{ a: (x: string | number) => void }>; // string & num
```



##  类型推断机制与控制流分析

### 类型推断基础t

```typescript
// 最佳公共类型推断
let mixed = [1, 'hello', true]; // (string | number | boolean)[]

// 上下文类型推断
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
]; // { name: string; age: number; }[]

// 泛型推断
function identity<T>(arg: T): T {
  return arg;
}

let result = identity('hello'); // string，T 被推断为 string
```



### 控制流分析

```typescript
// 类型守卫与控制流分析
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: string | number) {
  if (isString(value)) {
    // 这里 TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  } else {
    // 这里 TypeScript 知道 value 是 number
    console.log(value.toFixed(2));
  }
}

// 判别联合类型
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

type Shape = Square | Rectangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      // shape 被收窄为 Square
      return shape.size * shape.size;
    case 'rectangle':
      // shape 被收窄为 Rectangle
      return shape.width * shape.height;
  }
}
```



### 高级推断场景

```typescript
// 从使用中推断类型
function createAction<T extends string, P>(
  type: T,
  payload: P
): { type: T; payload: P } {
  return { type, payload };
}

const action = createAction('USER_LOGIN', { userId: 123 });
// 推断类型：{ type: 'USER_LOGIN'; payload: { userId: number } }

// 推断元组类型
function tuple<T extends readonly unknown[]>(...args: T): T {
  return args;
}

const coordinates = tuple(10, 20, 'origin');
// 推断为 [number, number, string]

// 条件推断与递归
type Flatten<T> = T extends (infer U)[]
  ? U extends any[]
    ? Flatten<U>
    : U
  : T;

type Deep = number[][][];
type Flattened = Flatten<Deep>; // number
```



## TypeScript 编译器架构与类型检查实现原理



### 编译器架构概览

TypeScript 编译器 (tsc) 的主要组件：

1. **扫描器 (Scanner)**：将源代码转换为 token 流
2. **解析器 (Parser)**：将 token 构建成抽象语法树 (AST)
3. **绑定器 (Binder)**：创建符号表，建立声明与使用的关系
4. **检查器 (Checker)**：执行类型检查
5. **发射器 (Emitter)**：生成 JavaScript 代码



### 类型检查实现原理

```typescript
// 类型检查的核心概念

// 1. 符号 (Symbol) - 表示程序中的声明
interface Symbol {
  name: string;
  declarations: Declaration[];
  flags: SymbolFlags;
}

// 2. 类型 (Type) - 表示值的类型信息
interface Type {
  flags: TypeFlags;
  symbol?: Symbol;
}

// 3. 签名 (Signature) - 表示函数或构造函数的调用签名
interface Signature {
  parameters: Symbol[];
  returnType: Type;
}

// 类型兼容性检查示例
// TypeScript 使用结构类型系统
interface Point {
  x: number;
  y: number;
}

interface Named {
  name: string;
}

// 编译器会检查：
// 1. Point 是否可以赋值给 Named？否 - 缺少 name 属性
// 2. Named 是否可以赋值给 Point？否 - 缺少 x, y 属性

let point: Point = { x: 1, y: 2 };
let named: Named = { name: 'origin' };

// point = named; // 错误：类型不兼容
```



### 类型推断算法

```typescript
// TypeScript 的类型推断基于以下算法：

// 1. 最佳公共类型 (Best Common Type)
function findBestCommonType(types: Type[]): Type {
  // 简化的算法逻辑：
  // - 如果所有类型相同，返回该类型
  // - 否则尝试找到所有类型的超类型
  // - 如果找不到，创建联合类型
}

// 2. 上下文敏感类型推断
const handler = (event: MouseEvent) => {
  // event 的类型从参数声明推断
  console.log(event.clientX);
};

// 3. 泛型推断
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  // T 从 array 参数推断
  // U 从 fn 的返回类型推断
  return array.map(fn);
}
```



### 编译器 API 使用示例

```typescript
// 使用 TypeScript 编译器 API 进行程序分析
import * as ts from 'typescript';

function analyzeFile(fileName: string) {
  // 创建程序实例
  const program = ts.createProgram([fileName], {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS
  });

  // 获取类型检查器
  const checker = program.getTypeChecker();
  
  // 访问源文件
  const sourceFile = program.getSourceFile(fileName);
  
  if (sourceFile) {
    ts.forEachChild(sourceFile, visit);
  }

  function visit(node: ts.Node) {
    // 分析节点类型
    if (ts.isVariableDeclaration(node) && node.name) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        const type = checker.getTypeOfSymbolAtLocation(symbol, node);
        console.log(`Variable ${symbol.name}: ${checker.typeToString(type)}`);
      }
    }
    
    ts.forEachChild(node, visit);
  }
}
```



### 性能优化策略

```typescript
// TypeScript 编译器的性能优化技术：

// 1. 增量编译
// 编译器缓存之前的类型检查结果，只重新检查改变的部分

// 2. 类型缓存
// 复杂类型的计算结果会被缓存，避免重复计算

// 3. 懒加载
// 类型信息只在需要时才计算

// 4. 项目引用 (Project References)
// 允许将大型项目分解为更小的独立部分
{
  "compilerOptions": {
    "composite": true,
    "declaration": true
  },
  "references": [
    { "path": "../shared" },
    { "path": "../utils" }
  ]
}
```



# JavaScript 元编程

## Proxy 与 Reflect API 的底层原理及高级应用

### Proxy 底层原理

Proxy 提供了拦截和自定义对象操作（如属性查找、赋值、枚举、函数调用等）的能力。它创建一个目标对象的代理，通过 handler 对象定义的 trap 函数来拦截操作。

```javascript
// 基础 Proxy 示例
const target = { name: 'John', age: 30 };

const handler = {
  get(target, property, receiver) {
    console.log(`访问属性: ${property}`);
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    console.log(`设置属性: ${property} = ${value}`);
    if (property === 'age' && typeof value !== 'number') {
      throw new TypeError('年龄必须是数字');
    }
    return Reflect.set(target, property, value, receiver);
  }
};

const proxy = new Proxy(target, handler);
```



### 高级应用：创建响应式对象系统

```javascript
class ReactiveSystem {
  constructor() {
    this.dependencies = new Map();
    this.currentEffect = null;
  }
  
  createReactive(obj) {
    const self = this;
    
    return new Proxy(obj, {
      get(target, key, receiver) {
        // 依赖收集
        if (self.currentEffect) {
          if (!self.dependencies.has(target)) {
            self.dependencies.set(target, new Map());
          }
          if (!self.dependencies.get(target).has(key)) {
            self.dependencies.get(target).set(key, new Set());
          }
          self.dependencies.get(target).get(key).add(self.currentEffect);
        }
        
        const result = Reflect.get(target, key, receiver);
        
        // 如果属性值是对象，也要使其变为响应式
        if (typeof result === 'object' && result !== null) {
          return self.createReactive(result);
        }
        
        return result;
      },
      
      set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver);
        
        // 触发依赖更新
        if (self.dependencies.has(target) && 
            self.dependencies.get(target).has(key)) {
          const effects = self.dependencies.get(target).get(key);
          effects.forEach(effect => effect());
        }
        
        return result;
      }
    });
  }
  
  effect(fn) {
    this.currentEffect = fn;
    fn();
    this.currentEffect = null;
  }
}

// 使用示例
const reactive = new ReactiveSystem();
const state = reactive.createReactive({ count: 0, user: { name: 'Alice' } });

reactive.effect(() => {
  console.log(`Count is: ${state.count}`);
  console.log(`User name: ${state.user.name}`);
});

state.count = 1; // 输出: Count is: 1, User name: Alice
state.user.name = 'Bob'; // 输出: Count is: 1, User name: Bob
```



### Reflect API 的作用

Reflect 提供了与 Proxy trap 对应的静态方法，确保操作的一致性：

```javascript
const advancedHandler = {
  get(target, property, receiver) {
    if (property === 'toString') {
      return function() {
        return `[Proxy object with keys: ${Object.keys(target).join(', ')}]`;
      };
    }
    
    // 使用 Reflect 确保正确的 this 绑定
    return Reflect.get(target, property, receiver);
  },
  
  has(target, property) {
    if (property.startsWith('_')) {
      return false; // 隐藏私有属性
    }
    return Reflect.has(target, property);
  },
  
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(key => !key.startsWith('_'));
  }
};
```



##  Symbol 在元编程中的应用及内部原理’

### Symbol 的内部原理

Symbol 是 ES6 引入的原始数据类型，每个 Symbol 值都是唯一的，主要用于创建对象的唯一属性键。

```javascript
// Symbol 基础使用
const sym1 = Symbol('description');
const sym2 = Symbol('description');
console.log(sym1 === sym2); // false

// 全局 Symbol 注册表
const globalSym1 = Symbol.for('app.version');
const globalSym2 = Symbol.for('app.version');
console.log(globalSym1 === globalSym2); // true
```



### Well-known Symbols 的应用

```javascript
class CustomIterable {
  constructor(data) {
    this.data = data;
  }
  
  // 实现迭代器接口
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
  
  // 自定义类型转换
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return this.data.length;
      case 'string':
        return `CustomIterable(${this.data.join(', ')})`;
      default:
        return this.data.toString();
    }
  }
  
  // 自定义检查
  [Symbol.hasInstance](instance) {
    return Array.isArray(instance.data);
  }
}

const iterable = new CustomIterable([1, 2, 3, 4]);

// 使用 for...of 循环
for (const item of iterable) {
  console.log(item);
}

// 类型转换
console.log(+iterable); // 4 (转为数字)
console.log(`${iterable}`); // "CustomIterable(1, 2, 3, 4)"
```



### 使用 Symbol 创建私有属性和方法

```javascript
const _private = Symbol('private');
const _validate = Symbol('validate');

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this[_private] = {
      id: Math.random().toString(36),
      loginAttempts: 0
    };
  }
  
  [_validate](email) {
    return email.includes('@');
  }
  
  setEmail(email) {
    if (this[_validate](email)) {
      this.email = email;
      return true;
    }
    return false;
  }
  
  getPrivateData() {
    return this[_private];
  }
}

const user = new User('John', 'john@example.com');
console.log(Object.keys(user)); // ['name', 'email'] - 不包含 Symbol 属性
```



## 元属性 (Meta Properties) 及其在框架设计中的作用

### new.target 元属性

```javascript
class Component {
  constructor() {
    // 防止直接实例化基类
    if (new.target === Component) {
      throw new Error('Component 是抽象类，不能直接实例化');
    }
    
    // 记录实际的构造函数
    this.constructor = new.target;
    this.componentName = new.target.name;
  }
  
  render() {
    throw new Error('子类必须实现 render 方法');
  }
}

class Button extends Component {
  constructor(text) {
    super();
    this.text = text;
  }
  
  render() {
    return `<button>${this.text}</button>`;
  }
}

// const comp = new Component(); // 错误：不能直接实例化
const button = new Button('Click me'); // 正常
```



### import.meta 元属性

```javascript
// 在模块中使用 import.meta
console.log(import.meta.url); // 当前模块的 URL
console.log(import.meta.resolve('./utils.js')); // 解析相对路径

// 创建基于模块路径的配置系统
class ModuleConfig {
  static getConfig() {
    const moduleUrl = import.meta.url;
    const configPath = new URL('./config.json', moduleUrl);
    return fetch(configPath).then(res => res.json());
  }
}
```





### 在框架设计中的应用

```javascript
class Framework {
  static createComponent(ComponentClass, props = {}) {
    // 使用 new.target 检查是否正确调用
    if (new.target) {
      throw new Error('createComponent 应该作为静态方法调用');
    }
    
    // 检查组件类的有效性
    if (typeof ComponentClass !== 'function') {
      throw new Error('ComponentClass 必须是一个构造函数');
    }
    
    const instance = new ComponentClass(props);
    
    // 添加框架特有的属性
    instance._frameworkVersion = Framework.version;
    instance._created = new Date();
    
    return instance;
  }
}

Framework.version = '1.0.0';
```



## 实现 JavaScript 对象的深度观察与变更追踪

### 深度观察系统

```javascript
class DeepObserver {
  constructor() {
    this.observers = new WeakMap();
    this.observerCallbacks = new WeakMap();
  }
  
  observe(obj, callback, path = '') {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    // 避免重复观察
    if (this.observers.has(obj)) {
      return this.observers.get(obj);
    }
    
    const self = this;
    const callbacks = this.observerCallbacks.get(obj) || new Set();
    callbacks.add(callback);
    this.observerCallbacks.set(obj, callbacks);
    
    const proxy = new Proxy(obj, {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);
        
        // 对嵌套对象也进行观察
        if (typeof value === 'object' && value !== null) {
          return self.observe(value, callback, `${path}.${property}`);
        }
        
        return value;
      },
      
      set(target, property, value, receiver) {
        const oldValue = target[property];
        const result = Reflect.set(target, property, value, receiver);
        
        if (oldValue !== value) {
          const fullPath = path ? `${path}.${property}` : property;
          
          // 通知所有观察者
          callbacks.forEach(cb => {
            cb({
              type: 'set',
              path: fullPath,
              property,
              oldValue,
              newValue: value,
              target
            });
          });
          
          // 如果新值是对象，也要观察它
          if (typeof value === 'object' && value !== null) {
            self.observe(value, callback, fullPath);
          }
        }
        
        return result;
      },
      
      deleteProperty(target, property) {
        const oldValue = target[property];
        const result = Reflect.deleteProperty(target, property);
        
        if (result) {
          const fullPath = path ? `${path}.${property}` : property;
          callbacks.forEach(cb => {
            cb({
              type: 'delete',
              path: fullPath,
              property,
              oldValue,
              target
            });
          });
        }
        
        return result;
      }
    });
    
    this.observers.set(obj, proxy);
    return proxy;
  }
  
  unobserve(obj) {
    this.observers.delete(obj);
    this.observerCallbacks.delete(obj);
  }
}

// 使用示例
const observer = new DeepObserver();
const data = {
  user: {
    name: 'Alice',
    profile: {
      age: 25,
      settings: {
        theme: 'dark'
      }
    }
  },
  items: [1, 2, 3]
};

const observedData = observer.observe(data, (change) => {
  console.log('变更检测:', change);
});

observedData.user.name = 'Bob'; // 输出变更信息
observedData.user.profile.settings.theme = 'light'; // 输出嵌套变更信息
```



### 变更追踪与回滚系统

```javascript
class ChangeTracker {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }
  
  createTrackableObject(obj) {
    const self = this;
    
    return new Proxy(obj, {
      set(target, property, value, receiver) {
        const oldValue = target[property];
        
        if (oldValue !== value) {
          // 记录变更
          self.recordChange({
            type: 'set',
            target,
            property,
            oldValue,
            newValue: value,
            timestamp: Date.now()
          });
        }
        
        return Reflect.set(target, property, value, receiver);
      }
    });
  }
  
  recordChange(change) {
    // 如果当前不在历史末尾，删除后续历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    this.history.push(change);
    this.currentIndex++;
    
    // 限制历史记录长度
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      const change = this.history[this.currentIndex];
      
      // 执行反向操作
      change.target[change.property] = change.oldValue;
      
      this.currentIndex--;
      return true;
    }
    return false;
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const change = this.history[this.currentIndex];
      
      // 重新应用操作
      change.target[change.property] = change.newValue;
      
      return true;
    }
    return false;
  }
  
  getHistory() {
    return this.history.slice(0, this.currentIndex + 1);
  }
}
```



## 自定义 JS 语言特性：运算符重载与自定义控制结构

### 运算符重载（通过 Symbol 和 Proxy）

```javascript
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  // 实现加法运算符重载
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return Math.sqrt(this.x * this.x + this.y * this.y); // 向量长度
    }
    return `Vector(${this.x}, ${this.y})`;
  }
  
  // 自定义加法
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  
  // 自定义乘法
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  
  // 实现 valueOf 以支持数值运算
  valueOf() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

// 创建运算符重载代理
function createMathProxy(obj) {
  return new Proxy(obj, {
    get(target, property) {
      const value = target[property];
      
      // 重载运算符方法
      if (property === Symbol.toPrimitive) {
        return function(hint) {
          if (hint === 'number' && typeof target.valueOf === 'function') {
            return target.valueOf();
          }
          if (typeof target.toString === 'function') {
            return target.toString();
          }
          return target;
        };
      }
      
      return value;
    }
  });
}

const v1 = new Vector(3, 4);
const v2 = new Vector(1, 2);

console.log(+v1); // 5 (向量长度)
console.log(v1.add(v2)); // Vector(4, 6)
```



### 自定义控制结构

```javascript
// 实现类似 Ruby 的 times 方法
Number.prototype.times = function(callback) {
  for (let i = 0; i < this; i++) {
    callback(i);
  }
};

// 实现 unless 控制结构
function unless(condition, callback) {
  if (!condition) {
    callback();
  }
}

// 实现 with 语句替代品
function withContext(context, callback) {
  const proxy = new Proxy({}, {
    get(target, property) {
      if (property in context) {
        return context[property];
      }
      return global[property] || window[property];
    },
    
    set(target, property, value) {
      context[property] = value;
      return true;
    }
  });
  
  return callback.call(proxy);
}

// 使用示例
5..times(i => console.log(`第 ${i} 次`));

unless(false, () => {
  console.log('条件为假时执行');
});

withContext({ x: 10, y: 20 }, function() {
  console.log(this.x + this.y); // 30
});
```



### 模式匹配实现

```javascript
class PatternMatcher {
  constructor(value) {
    this.value = value;
    this.matched = false;
  }
  
  when(pattern, callback) {
    if (this.matched) return this;
    
    let isMatch = false;
    
    if (typeof pattern === 'function') {
      isMatch = pattern(this.value);
    } else if (pattern instanceof RegExp) {
      isMatch = pattern.test(this.value);
    } else if (Array.isArray(pattern)) {
      isMatch = pattern.includes(this.value);
    } else {
      isMatch = pattern === this.value;
    }
    
    if (isMatch) {
      this.matched = true;
      if (callback) {
        return callback(this.value);
      }
    }
    
    return this;
  }
  
  else(callback) {
    if (!this.matched && callback) {
      return callback(this.value);
    }
    return this;
  }
}

function match(value) {
  return new PatternMatcher(value);
}

// 使用示例
const result = match(42)
  .when(x => x < 0, () => '负数')
  .when([1, 2, 3], () => '小数字')
  .when(x => x > 40, () => '大数字')
  .else(() => '其他');

console.log(result); // '大数字'
```





## 使用元编程实现数据验证与转换系统

### 声明式验证器

```javascript
class Validator {
  constructor() {
    this.rules = new Map();
    this.messages = new Map();
  }
  
  static create() {
    return new Validator();
  }
  
  rule(name, validator, message = `${name} validation failed`) {
    this.rules.set(name, validator);
    this.messages.set(name, message);
    return this;
  }
  
  validate(data) {
    const errors = [];
    
    for (const [name, validator] of this.rules) {
      try {
        const isValid = validator(data);
        if (!isValid) {
          errors.push({
            rule: name,
            message: this.messages.get(name),
            value: data
          });
        }
      } catch (error) {
        errors.push({
          rule: name,
          message: error.message,
          value: data
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 创建模型验证装饰器
function Model(validationRules = {}) {
  return function(target) {
    const originalConstructor = target;
    
    function ModelClass(...args) {
      const instance = new originalConstructor(...args);
      
      // 添加验证方法
      instance.validate = function() {
        const errors = {};
        
        for (const [property, rules] of Object.entries(validationRules)) {
          const value = this[property];
          const validator = Validator.create();
          
          // 应用规则
          rules.forEach(rule => {
            if (typeof rule === 'function') {
              validator.rule(rule.name, rule);
            } else if (typeof rule === 'object') {
              validator.rule(rule.name, rule.validator, rule.message);
            }
          });
          
          const result = validator.validate(value);
          if (!result.isValid) {
            errors[property] = result.errors;
          }
        }
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors
        };
      };
      
      // 添加类型转换
      instance.transform = function() {
        const transformed = { ...this };
        
        for (const [property, rules] of Object.entries(validationRules)) {
          if (rules.transform) {
            transformed[property] = rules.transform(this[property]);
          }
        }
        
        return transformed;
      };
      
      return instance;
    }
    
    ModelClass.prototype = originalConstructor.prototype;
    return ModelClass;
  };
}

// 使用示例
@Model({
  email: [
    {
      name: 'required',
      validator: value => value && value.trim().length > 0,
      message: '邮箱是必填项'
    },
    {
      name: 'email',
      validator: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: '邮箱格式不正确'
    }
  ],
  age: [
    {
      name: 'number',
      validator: value => !isNaN(value) && value > 0,
      message: '年龄必须是正数'
    }
  ]
})
class User {
  constructor(email, age) {
    this.email = email;
    this.age = age;
  }
}

const user = new User('invalid-email', -5);
const validation = user.validate();
console.log(validation.errors);
```





### 自动类型转换系统

```javascript
class TypeConverter {
  constructor() {
    this.converters = new Map();
    this.setupDefaultConverters();
  }
  
  setupDefaultConverters() {
    this.register('string', (value) => String(value));
    this.register('number', (value) => {
      const num = Number(value);
      if (isNaN(num)) throw new Error(`Cannot convert ${value} to number`);
      return num;
    });
    this.register('boolean', (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return Boolean(value);
    });
    this.register('date', (value) => {
      if (value instanceof Date) return value;
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
      return date;
    });
  }
  
  register(type, converter) {
    this.converters.set(type, converter);
  }
  
  convert(value, type) {
    if (!this.converters.has(type)) {
      throw new Error(`No converter for type: ${type}`);
    }
    return this.converters.get(type)(value);
  }
  
  createSchema(schema) {
    return (data) => {
      const result = {};
      
      for (const [key, config] of Object.entries(schema)) {
        if (key in data) {
          try {
            if (typeof config === 'string') {
              result[key] = this.convert(data[key], config);
            } else {
              result[key] = this.convert(data[key], config.type);
              
              // 应用额外的验证
              if (config.validate && !config.validate(result[key])) {
                throw new Error(`Validation failed for ${key}`);
              }
            }
          } catch (error) {
            if (config.default !== undefined) {
              result[key] = config.default;
            } else {
              throw error;
            }
          }
        } else if (config.required) {
          throw new Error(`Required field missing: ${key}`);
        } else if (config.default !== undefined) {
          result[key] = config.default;
        }
      }
      
      return result;
    };
  }
}

// 使用示例
const converter = new TypeConverter();

const userSchema = converter.createSchema({
  id: 'number',
  name: { type: 'string', required: true },
  email: { 
    type: 'string', 
    validate: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  age: { 
    type: 'number', 
    validate: age => age >= 0 && age <= 150,
    default: 0
  },
  isActive: { type: 'boolean', default: true },
  createdAt: { type: 'date', default: () => new Date() }
});

const rawData = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: '25',
  isActive: 'true'
};

const user = userSchema(rawData);
console.log(user);
```



## 元编程在框架开发中的实际应用

### 依赖注入容器

javascript

```javascript
class DIContainer {
  constructor() {
    this.dependencies = new Map();
    this.instances = new Map();
    this.factories = new Map();
  }
  
  // 注册依赖
  register(name, definition, options = {}) {
    this.dependencies.set(name, {
      definition,
      singleton: options.singleton || false,
      factory: options.factory || false
    });
    
    if (options.factory) {
      this.factories.set(name, definition);
    }
    
    return this;
  }
  
  // 解析依赖
  resolve(name) {
    if (!this.dependencies.has(name)) {
      throw new Error(`Dependency ${name} not registered`);
    }
    
    const dep = this.dependencies.get(name);
    
    // 单例模式
    if (dep.singleton && this.instances.has(name)) {
      return this.instances.get(name);
    }
    
    let instance;
    
    if (dep.factory) {
      instance = this.factories.get(name)(this);
    } else if (typeof dep.definition === 'function') {
      // 自动解析构造函数参数
      instance = this.createInstance(dep.definition);
    } else {
      instance = dep.definition;
    }
    
    if (dep.singleton) {
      this.instances.set(name, instance);
    }
    
    return instance;
  }
  
  createInstance(Constructor) {
    // 获取构造函数参数
    const paramNames = this.getParameterNames(Constructor);
    const args = paramNames.map(name => this.resolve(name));
    
    return new Constructor(...args);
  }
  
  getParameterNames(func) {
    const funcStr = func.toString();
    const paramMatch = funcStr.match(/constructor\s*\(([^)]*)\)/);
    
    if (!paramMatch) return [];
    
    return paramMatch[1]
      .split(',')
      .map(param => param.trim().split('=')[0].trim())
      .filter(param => param.length > 0);
  }
}

// 装饰器实现
function Injectable(dependencies = []) {
  return function(target) {
    target._dependencies = dependencies;
    return target;
  };
}

function Inject(token) {
  return function(target, propertyKey, parameterIndex) {
    if (!target._injectTokens) {
      target._injectTokens = {};
    }
    target._injectTokens[parameterIndex] = token;
  };
}

// 使用示例
@Injectable(['database', 'logger'])
class UserService {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }
  
  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.database.find('users', id);
  }
}

const container = new DIContainer();

container
  .register('database', { find: (table, id) => ({ id, table }) })
  .register('logger', { log: (msg) => console.log(`[LOG] ${msg}`) })
  .register('userService', UserService);

const userService = container.resolve('userService');
```





### 组件系统与生命周期管理

```javascript
class ComponentFramework {
  constructor() {
    this.components = new Map();
    this.hooks = new Map();
    this.currentComponent = null;
  }
  
  defineComponent(name, definition) {
    const component = this.createComponentClass(definition);
    this.components.set(name, component);
    return component;
  }
  
  createComponentClass(definition) {
    const framework = this;
    
    return class Component {
      constructor(props = {}) {
        this.props = props;
        this.state = definition.data ? definition.data() : {};
        this.hooks = [];
        this.hookIndex = 0;
        this.mounted = false;
        
        // 绑定方法
        if (definition.methods) {
          Object.entries(definition.methods).forEach(([name, method]) => {
            this[name] = method.bind(this);
          });
        }
        
        // 设置响应式状态
        this.state = framework.createReactiveState(this.state, () => {
          if (this.mounted) {
            this.update();
          }
        });
      }
      
      // 生命周期钩子
      async mount(container) {
        framework.currentComponent = this;
        
        if (definition.beforeMount) {
          await definition.beforeMount.call(this);
        }
        
        this.element = this.render();
        if (container) {
          container.appendChild(this.element);
        }
        
        this.mounted = true;
        
        if (definition.mounted) {
          await definition.mounted.call(this);
        }
        
        framework.currentComponent = null;
      }
      
      async unmount() {
        if (definition.beforeUnmount) {
          await definition.beforeUnmount.call(this);
        }
        
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        
        this.mounted = false;
        
        if (definition.unmounted) {
          await definition.unmounted.call(this);
        }
      }
      
      render() {
        framework.currentComponent = this;
        this.hookIndex = 0;
        
        const result = definition.render.call(this);
        
        framework.currentComponent = null;
        return result;
      }
      
      update() {
        if (this.element) {
          const newElement = this.render();
          this.element.parentNode.replaceChild(newElement, this.element);
          this.element = newElement;
        }
      }
      
      setState(updates) {
        Object.assign(this.state, updates);
      }
    };
  }
  
  createReactiveState(state, callback) {
    return new Proxy(state, {
      set(target, property, value, receiver) {
        const result = Reflect.set(target, property, value, receiver);
        callback();
        return result;
      }
    });
  }
  
  // Hook 系统
  useState(initialValue) {
    const component = this.currentComponent;
    if (!component) {
      throw new Error('useState can only be called inside a component');
    }
    
    const index = component.hookIndex++;
    
    if (!component.hooks[index]) {
      component.hooks[index] = {
        value: initialValue,
        setValue: (newValue) => {
          component.hooks[index].value = newValue;
          component.update();
        }
      };
    }
    
    const hook = component.hooks[index];
    return [hook.value, hook.setValue];
  }
  
  useEffect(effect, dependencies = []) {
    const component = this.currentComponent;
    if (!component) {
      throw new Error('useEffect can only be called inside a component');
    }
    
    const index = component.hookIndex++;
    
    if (!component.hooks[index]) {
      component.hooks[index] = {
        dependencies: [],
        cleanup: null
      };
    }
    
    const hook = component.hooks[index];
    const hasChanged = dependencies.some((dep, i) => dep !== hook.dependencies[i]);
    
    if (hasChanged || hook.dependencies.length === 0) {
      if (hook.cleanup) {
        hook.cleanup();
      }
      
      hook.cleanup = effect();
      hook.dependencies = [...dependencies];
    }
  }
  
  createApp(rootComponent, props = {}) {
    return {
      mount: (selector) => {
        const container = document.querySelector(selector);
        const ComponentClass = this.components.get(rootComponent);
        const instance = new ComponentClass(props);
        instance.mount(container);
        return instance;
      }
    };
  }
}

// 使用示例
const framework = new ComponentFramework();

framework.defineComponent('Counter', {
  data() {
    return {
      count: 0
    };
  },
  
  methods: {
    increment() {
      this.state.count++;
    },
    
    decrement() {
      this.state.count--;
    }
  },
  
  mounted() {
    console.log('Counter component mounted');
  },
  
  render() {
    const [extraCount, setExtraCount] = framework.useState(0);
    
    framework.useEffect(() => {
      console.log(`Count changed to: ${this.state.count}`);
      return () => console.log('Effect cleanup');
    }, [this.state.count]);
    
    const div = document.createElement('div');
    div.innerHTML = `
      <h2>Counter: ${this.state.count}</h2>
      <h3>Extra: ${extraCount}</h3>
      <button onclick="this.increment()">+</button>
      <button onclick="this.decrement()">-</button>
      <button onclick="setExtraCount(extraCount + 1)">Extra +</button>
    `;
    
    // 绑定事件
    const buttons = div.querySelectorAll('button');
    buttons[0].onclick = () => this.increment();
    buttons[1].onclick = () => this.decrement();
    buttons[2].onclick = () => setExtraCount(extraCount + 1);
    
    return div;
  }
});

// 路由系统
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.hooks = {
      beforeEach: [],
      afterEach: []
    };
    
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }
  
  addRoute(path, component, options = {}) {
    this.routes.set(path, {
      component,
      meta: options.meta || {},
      beforeEnter: options.beforeEnter
    });
  }
  
  beforeEach(hook) {
    this.hooks.beforeEach.push(hook);
  }
  
  afterEach(hook) {
    this.hooks.afterEach.push(hook);
  }
  
  async navigate(path) {
    const route = this.routes.get(path);
    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }
    
    // 执行全局前置钩子
    for (const hook of this.hooks.beforeEach) {
      const result = await hook(route, this.currentRoute);
      if (result === false) {
        return; // 阻止导航
      }
    }
    
    // 执行路由前置钩子
    if (route.beforeEnter) {
      const result = await route.beforeEnter(route, this.currentRoute);
      if (result === false) {
        return;
      }
    }
    
    // 卸载当前组件
    if (this.currentRoute && this.currentRoute.instance) {
      await this.currentRoute.instance.unmount();
    }
    
    // 更新 URL
    history.pushState({}, '', path);
    
    // 挂载新组件
    const ComponentClass = route.component;
    const instance = new ComponentClass();
    await instance.mount(document.querySelector('#app'));
    
    this.currentRoute = {
      path,
      route,
      instance
    };
    
    // 执行全局后置钩子
    for (const hook of this.hooks.afterEach) {
      await hook(this.currentRoute);
    }
  }
  
  handleRoute() {
    const path = window.location.pathname;
    if (this.routes.has(path)) {
      this.navigate(path);
    }
  }
}

// 状态管理系统
class Store {
  constructor(options = {}) {
    this.state = this.createReactiveState(options.state || {});
    this.mutations = options.mutations || {};
    this.actions = options.actions || {};
    this.getters = {};
    this.subscribers = [];
    
    // 创建 getters
    if (options.getters) {
      Object.entries(options.getters).forEach(([name, getter]) => {
        Object.defineProperty(this.getters, name, {
          get: () => getter(this.state, this.getters),
          enumerable: true
        });
      });
    }
  }
  
  createReactiveState(state) {
    const store = this;
    
    return new Proxy(state, {
      set(target, property, value, receiver) {
        const result = Reflect.set(target, property, value, receiver);
        
        // 通知订阅者
        store.subscribers.forEach(subscriber => {
          subscriber(store.state, property, value);
        });
        
        return result;
      }
    });
  }
  
  commit(mutationType, payload) {
    if (!this.mutations[mutationType]) {
      throw new Error(`Unknown mutation: ${mutationType}`);
    }
    
    this.mutations[mutationType](this.state, payload);
  }
  
  async dispatch(actionType, payload) {
    if (!this.actions[actionType]) {
      throw new Error(`Unknown action: ${actionType}`);
    }
    
    const context = {
      state: this.state,
      commit: this.commit.bind(this),
      dispatch: this.dispatch.bind(this),
      getters: this.getters
    };
    
    return await this.actions[actionType](context, payload);
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // 返回取消订阅函数
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}

// 中间件系统
class MiddlewareManager {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
  }
  
  async execute(context, next) {
    let index = 0;
    
    const dispatch = async (i) => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      
      index = i;
      
      if (i >= this.middlewares.length) {
        return next ? await next() : undefined;
      }
      
      const middleware = this.middlewares[i];
      return await middleware(context, () => dispatch(i + 1));
    };
    
    return await dispatch(0);
  }
}

// 插件系统
class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} already registered`);
    }
    
    this.plugins.set(name, plugin);
    
    // 安装插件
    if (plugin.install) {
      plugin.install(this);
    }
  }
  
  addHook(name, callback) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    
    this.hooks.get(name).push(callback);
  }
  
  async callHook(name, ...args) {
    if (!this.hooks.has(name)) {
      return;
    }
    
    const callbacks = this.hooks.get(name);
    const results = [];
    
    for (const callback of callbacks) {
      const result = await callback(...args);
      results.push(result);
    }
    
    return results;
  }
  
  removeHook(name, callback) {
    if (this.hooks.has(name)) {
      const callbacks = this.hooks.get(name);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

// 完整的框架使用示例
const app = framework.createApp('Counter');
const router = new Router();
const store = new Store({
  state: {
    user: null,
    items: []
  },
  
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    
    addItem(state, item) {
      state.items.push(item);
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      // 模拟 API 调用
      const user = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }).then(res => res.json());
      
      commit('setUser', user);
      return user;
    }
  },
  
  getters: {
    itemCount: state => state.items.length,
    isLoggedIn: state => !!state.user
  }
});

const pluginSystem = new PluginSystem();

// 注册日志插件
pluginSystem.registerPlugin('logger', {
  install(system) {
    system.addHook('beforeAction', (action, payload) => {
      console.log(`Action: ${action}`, payload);
    });
    
    system.addHook('afterMutation', (mutation, payload) => {
      console.log(`Mutation: ${mutation}`, payload);
    });
  }
});

// 启动应用
app.mount('#app');

console.log('JavaScript 元编程框架示例完成！');
console.log('这个示例展示了如何使用元编程技术构建现代前端框架的核心功能。');
```
