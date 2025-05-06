## 初级场景题

### 1.事件循环与异步

```js
console.log('1');
 setTimeout(() => console.log('2'), 0);
 Promise.resolve().then(() => console.log('3'));
 console.log('4');
```

