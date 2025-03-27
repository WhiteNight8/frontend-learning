## 回调

onload通常会在脚本加载和执行完成后执行一个函数

### 在回调中回调

![image-20250324110544631](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250324110544631.png)

### 处理Error

Error优先回调



### 厄运金字塔

独立函数可以解决，但是代码的可读性变差了，需要代码之间的跳转

## 

## Promise

promise是将生产者代码和消费者代码连接在一起的一个特殊的JavaScript对象

```js
let promise = new Promise(function(resolve,reject) {
//	executor()
})
```

promise的内部属性

- state
- result

![image-20250325103630152](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250325103630152.png)

总之，executor应该执行一项花费时间的工作，然后调用resolve，或者reject来改变对应的promise对象的状态

**只有一个结果或者一个error**， 一个由executor完成的工作只能有一个结果或者一个error，并且，resolve，reject只需要一个参数，并且将忽略额外的参数

**建议以Error对象reject**

**resolve，reject可以立即进行**

**state和result都是内部的**



### 消费者：then，catch

promise对象充当的是executor和消费函数之间的连接，后者将接受结果或者error，可以通过使用then和catch方法注册消费函数

**then**

```js
promise.then( 
function(result) { // hanlde a successful result}
function(error) { // handle an error}
)
```



then的第一个参数是函数，该函数将在promise resolved且接收到结果后执行

then的第二个参数也是函数，该函数将在promise rejected且接受到error信息后执行



**catch**

如果只对error感兴趣，可以使用null作为第一个参数，也可以使用catch



**清理：finally**

功能是设置一个处理程序在前面的操作完成后，执行清理终结

finally与then(f,f)的区别

- finally处理程序没有参数，不知道promise是否成功，
- promise的结果由下一个处理程序处理
- 也不返回任何内容，返回值默认会被忽略，但是抛出error会转到最近的error处理程序

**promise非常灵活，可以所处添加处理程序，如果结果已经在了，它们就会执行**

![image-20250325105553662](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250325105553662.png)





## Promise链

从技术上讲，可以将多个then添加到一个promise上，但是这不是promise链



### 返回promise

then中所使用的处理程序可以创建并返回一个promise

### fetch

通常被用于网络请求

![image-20250326081318582](C:/Users/27019/AppData/Roaming/Typora/typora-user-images/image-20250326081318582.png)





## 使用promise进行错误处理

当一个promise被reject时， 控制权将移交到最近的rejection处理程序



### 隐式try catch

promise的executor和promise处理程序周围有个隐式的try catch，如果发生异常，就会被捕获，并被视为rejection进行处理



### 再次抛出

无法处理error，可以将其再次抛出

### 未处理的rejection

如果出现了error，并且没有在catch，那么unhandledrejection处理程序就会触发，并且获取具有error相关信息的event对象，就可以进行后续处理



## Promise API

## promise.all

接受一个可迭代对象，并返回一个新的promise

结果数组中元素的顺序与源promise中的顺序相同

**如果任意一个promise被reject，由Promise.all返回的promise就会立即reject，并且带有的就是这个error**

如果出现error，其他promise将被忽略

promise.all没有取消的概念

允许使用非promise值，将被原样返回



### Promise.allSettled

获取所有给定的promise的结果，即使其中一些被reject



### Promise.race

等待第一个settled的promise并获取结果或者error



### Promise.any

与race类似，但是any只等待第一个fulfilled的promise

如果都rejected，那么返回的promise会带有AggregateError



### Promise.resolve/reject

使用给定的value/error，闯将一个resolved/ rejected的promise





## Promisification

指的是将一个接受回调的函数转换为返回promise的函数

一个promise可能只有一个结果，但是一个回调可能被调用很多次







