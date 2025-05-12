## generator

常规函数只会返回一个单一值，generator可以按需一个接着一个返回多个值。与iterable配合，创建数据流

### generator函数

```js
function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}
```

函数调用时不会运行代码，而是返回一个generator object的特殊对象，来管理执行流程

### generator是可迭代的

所以可以使用for of循环遍历所有值

但是不会显示done为true的值

### 使用generator进行迭代

generator可以永远产出yield值

### generator组合

将一个generator流插入到另一个generator流的自然的方式

### yield是一条双向路

不仅可以向外返回结果，而且还可以将外部的值传递到generator内



## 异步迭代和generator

异步迭代允许通过异步请求得到的数据进行迭代

### 异步可迭代对象

1. 使用 `Symbol.asyncIterator` 取代 `Symbol.iterator`。
2. next()方法应该返回一个promise（带有下一个值，并且状态为fulfilled）。
3. 我们应该使用for await (let item of iterable)循环来迭代这样的对象。



