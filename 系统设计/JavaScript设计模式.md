## 单例模式在前端中的实现与应用场景

单例模式确保一个类只有一个实例，并提供全局访问点

```js
class Singleton {
    constructor() {
        if(Singleton.instance) {
            return Singleton.instance
        }
        this.state = {}
        Singleton.instance = this
    }
    
    setState(key,value) {
        this.state[key] = value
    }
    
    getState(key) {
        return this.state[key]
    }
}
```

应用场景

- 全局状态管理
- 全局缓存对象
- 浏览器中的localStorage封装
- 连接池管理
- 配置管理
- 日志记录器



## 工厂模式与依赖注入在大型应用中的应用

工厂模式实现

```js
// 简单工厂
class UserFactory {
  static createUser(type) {
    switch(type) {
      case 'admin':
        return new AdminUser();
      case 'regular':
        return new RegularUser();
      case 'guest':
        return new GuestUser();
      default:
        throw new Error('Unknown user type');
    }
  }
}

// 使用
const admin = UserFactory.createUser('admin');
```



依赖注入实现

```js
// 简单的DI容器
class DIContainer {
  constructor() {
    this.services = {};
  }
  
  register(name, constructor, dependencies = []) {
    this.services[name] = {
      constructor,
      dependencies,
      instance: null
    };
  }
  
  get(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    
    if (!service.instance) {
      const dependencies = service.dependencies.map(dep => this.get(dep));
      service.instance = new service.constructor(...dependencies);
    }
    
    return service.instance;
  }
}

// 使用
const container = new DIContainer();
container.register('logger', Logger);
container.register('userService', UserService, ['logger']);
container.register('authService', AuthService, ['userService', 'logger']);

const authService = container.get('authService');
```

应用场景

- 组件创建跟管理
- 服务层的组织跟依赖管理
- API接口封装
- 复杂对象的创建



## 观察者模式与发布订阅模式的区别和实现

观察者模式

```js
class Subject {
    constructor() {
        this.observers = []
    }
    
    addObserver(observer) {
        this.observers.push(observer)
    }
    
    removeObserver(observer) {
		this.observers = this.obververs.filter( obs => obs !== observer)	
    }
    
    notify(data) {
        this.observers.forEach(observer => observer.update(data))
    }
}

class Observer{
    update(data) {
        console.log('data reveived',data)
    }
}
```



发布订阅模式

```js
class EventBus {
    constructor() {
        this.handlers = {}
    }
    
    subscribe(event,handler,context) {
        if(!this.handlers[event]) {
            this.handlers[event] = []
        }
        this.handlers[event].push({handler,context})
    }
    
    publish(event,data) {
        if(!this.handlers[event]) return
        
        this.handlers[event].forEach( item => {
            item.handler.call(item.context,data)
        })
    }
    
    unsubscribe(event,handler) {
        if(!this.handlers[event]) return
        
        this.handlers[event] = this.handlers[event].filter(item => item.handler !== handler)
    }
}
}
```

- 观察者和目标之间有直接依赖关系
- 发布订阅模式之间通过一个事件通道解耦，不直接交互

应用场景

- DOM事件处理
- 组件间通信
- 状态变更通知
- 异步操作完成通知
- UI更新



## 装饰器模式在ES6+中的实现与应用

基本装饰器

```js
// 方法装饰器
function log(target, name, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    console.log(`Calling ${name} with arguments: ${args}`);
    const result = original.apply(this, args);
    console.log(`Method ${name} returned: ${result}`);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
}

// 使用
const calc = new Calculator();
calc.add(2, 3); // 输出调用信息和返回值
```



类装饰器

```js
function singleton(target) {
  const original = target;
  
  // 创建一个包装函数作为构造函数
  function construct(constructor, args) {
    const instance = Reflect.construct(constructor, args);
    Object.freeze(instance);
    return instance;
  }
  
  // 创建一个包装类
  const wrapper = function(...args) {
    if (!wrapper.instance) {
      wrapper.instance = construct(original, args);
    }
    return wrapper.instance;
  };
  
  wrapper.prototype = original.prototype;
  return wrapper;
}

@singleton
class ConfigService {
  constructor() {
    this.config = {};
  }
  
  setConfig(key, value) {
    this.config[key] = value;
  }
}
```

应用场景

- 权限验证
- 日志记录
- 性能测试
- 缓存机制
- 异常处理
- 参数验证
- API请求处理



## 策略模式在表单验证中的实践

```js
// 定义验证策略
const validationStrategies = {
  required: {
    validate: value => value !== undefined && value !== null && value !== '',
    message: '此字段为必填项'
  },
  
  minLength: minLength => ({
    validate: value => value.length >= minLength,
    message: `长度不能少于${minLength}个字符`
  }),
  
  maxLength: maxLength => ({
    validate: value => value.length <= maxLength,
    message: `长度不能超过${maxLength}个字符`
  }),
  
  pattern: pattern => ({
    validate: value => pattern.test(value),
    message: '格式不正确'
  }),
  
  email: {
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: '请输入有效的电子邮件地址'
  }
};

// 表单验证类
class FormValidator {
  constructor(formConfig) {
    this.formConfig = formConfig;
  }
  
  validate(formData) {
    const errors = {};
    
    Object.keys(this.formConfig).forEach(field => {
      const fieldRules = this.formConfig[field];
      
      for (const rule of fieldRules) {
        let strategy;
        
        if (typeof rule === 'string') {
          strategy = validationStrategies[rule];
        } else {
          const [strategyName, param] = Object.entries(rule)[0];
          strategy = validationStrategies[strategyName](param);
        }
        
        const value = formData[field];
        const isValid = strategy.validate(value);
        
        if (!isValid) {
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(strategy.message);
          break;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// 使用示例
const loginFormConfig = {
  username: ['required', { minLength: 3 }, { maxLength: 20 }],
  password: ['required', { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/ }],
  email: ['required', 'email']
};

const validator = new FormValidator(loginFormConfig);

const formData = {
  username: 'john',
  password: 'weakpass',
  email: 'invalid-email'
};

const result = validator.validate(formData);
console.log(result);
```

应用场景

- 表单验证逻辑
- 排序算法选择
- 支付方式处理
- 权限验证
- 过滤器实现



## 代理模式在数据响应式系统中的应用

```js
// Vue3 类似的响应式系统实现
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey) {
        trigger(target, key);
      }
      return result;
    }
  };
  
  return new Proxy(target, handler);
}

// 简单的依赖收集和触发更新
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 使用示例
const state = reactive({ count: 0 });

effect(() => {
  console.log('Count changed:', state.count);
});

state.count++; // 触发更新
```

应用场景

- 响应式数据绑定
- 数据验证
- 懒加载
- 缓存机制
- 访问控制



## 命令模式在前端应用状态管理的实现

```js
// 命令接口
class Command {
  execute() {}
  undo() {}
}

// 具体命令
class AddTodoCommand extends Command {
  constructor(receiver, payload) {
    super();
    this.receiver = receiver;
    this.payload = payload;
    this.previousState = null;
  }
  
  execute() {
    this.previousState = [...this.receiver.todos];
    this.receiver.addTodo(this.payload);
    return this.receiver.todos;
  }
  
  undo() {
    this.receiver.todos = this.previousState;
    return this.receiver.todos;
  }
}

class RemoveTodoCommand extends Command {
  constructor(receiver, id) {
    super();
    this.receiver = receiver;
    this.id = id;
    this.previousState = null;
  }
  
  execute() {
    this.previousState = [...this.receiver.todos];
    this.receiver.removeTodo(this.id);
    return this.receiver.todos;
  }
  
  undo() {
    this.receiver.todos = this.previousState;
    return this.receiver.todos;
  }
}

// 接收者
class TodoList {
  constructor() {
    this.todos = [];
    this.nextId = 1;
  }
  
  addTodo(text) {
    this.todos.push({ id: this.nextId++, text, completed: false });
  }
  
  removeTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }
  
  toggleTodo(id) {
    this.todos = this.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
}

// 调用者 - 状态管理器
class TodoStore {
  constructor() {
    this.todoList = new TodoList();
    this.history = [];
    this.redoStack = [];
  }
  
  execute(command) {
    const result = command.execute();
    this.history.push(command);
    this.redoStack = []; // 执行新命令后清空重做栈
    return result;
  }
  
  undo() {
    if (this.history.length === 0) return this.todoList.todos;
    
    const command = this.history.pop();
    const result = command.undo();
    this.redoStack.push(command);
    return result;
  }
  
  redo() {
    if (this.redoStack.length === 0) return this.todoList.todos;
    
    const command = this.redoStack.pop();
    const result = command.execute();
    this.history.push(command);
    return result;
  }
}

// 使用示例
const todoStore = new TodoStore();

// 添加任务
const addCommand = new AddTodoCommand(todoStore.todoList, '学习设计模式');
todoStore.execute(addCommand);

// 添加另一个任务
const addCommand2 = new AddTodoCommand(todoStore.todoList, '实践命令模式');
todoStore.execute(addCommand2);

console.log(todoStore.todoList.todos);

// 撤销
todoStore.undo();
console.log('撤销后:', todoStore.todoList.todos);

// 重做
todoStore.redo();
console.log('重做后:', todoStore.todoList.todos);
```

应用场景

- 撤销重做功能
- 应用状态管理
- 事务处理
- 操作队列
- 历史记录

