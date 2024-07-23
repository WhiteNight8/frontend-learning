结构设计

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTD  = 'rejected'

class XXPromise {
    constructor(executor) {
        this.status = PROMISE_STATUS_PENDING
        this.value = undefined
        this.reason = undefined
        
        const resolve = (value) => {
            if(this.status  === PROMISE_STATUS_PENDING) {
                this.status = PROMISE_STATUS_FULFILLED
                this.value = value
            }
        }
        
        const reject = (reason) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                this.status = PROMISE_STATUS_REJECTED
                this.reason = reason
            }
        }
        
        executor(resolve,reject)
    }
}
```

then方法设计

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTD  = 'rejected'


class XXPromise {
    constructor(executor) {
        this.status = PROMISE_STATUS_PENDING
        this.value = undefined
        this.reason = undefined
        
        const resolve = (value) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                this.status = PROMISE_STATUS_FULFILLED
                queueMicrotask( () => {
                    this.value = value
                    this.onFulfilled(this.value)
                })
            }
        }
        
        const reject = (reason) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                this.status = PROMISE_STATUS_REJECTED
                queueMicrotask( () => {
					this.reason = reason
                    this.OnRejected(this.reason)
                })
            }
        }
        
        executor(resovle, reject)
    }
    
    then(onFulfilled, onRejected) {
        this.onFulfilled = onFulfilled
        this.onRejected = onRejected
    }
}
```

then方法优化1

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

class XXPromise {
    constructor(executor) {
        this.status = PROMISE_STATUS_PENDING
        this.value = undefined
        this.reason = undefiend
        this.onFulfilledFns = []
        this.onRejectedFns  = []
        
        const resolve = (value) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                queueMicrotask( () => {
                    if(this.status === PROMISE_STATUS_PENDING) return
                    this.status = PROMISE_STATUS_FULFILLED
                    this.value = value 
                    this.onFUlfilledFns,forEach( fn => {
                        fn(this.value)
                    })
                })
            }
        }
        
        const reject = (reason) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                queueMicrotask( () => {
                    if(this.status !== PROMISE_STATUS_PENDING) return 
                    this.status = PROMISE_STATUS_REJECTED
                    this.reason = reason
                    this.onRejecetedFns.forEach( fn => {
                        fn(this.reason)
                    })
                })
            }
        }
        
        executor(resolve, reject)
    }
    
    then(onFulfilled,onRejected) {
        if(this.status === PROMISE_STATUS_FULFILLED && onFUfilled) {
            onFulfilled(this.value)
        }
       if(this.status === PROMISE_STATUS_REJECTED && onRejected) {
           onRejected(this.reason)
       }
        
        if(this.status === PROMISE_STATUS_PENDING) {
            this.onFulfilledFns.push(onFulfilled)
            this.onRejectedFns.push(onRejected)
        }
    }
}
```

then方法优化2

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

function execFunctionWithCatchError(execFn, value,resolve,reject) {
    try {
        const result = execFn(value)
        resolve(result)
    } catch(err) {
        reject(err)
    }
}

class XXPromise {
    constructor(executor) {
        this.status = PROMISE_STATUS_PENDING
        this.value = undefined
        this.reason = undefined
        this.onFulfilledFns = []
        this.onRejectedFns = []
        
        const resolve = (value) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                queueMicrotask( () => {
                    if(this.status !== PROMISE_STATUS_PENDING) return 
                    this.status = PROMISE_STATUS_FULFILLED
                    this.value = value
                    this.onFulfilledFns.forEach( fn =< {
                        fn(this.value)
                    })
                })
            }
        }
        
        const reject =(reason) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                queueMicrotask( () => {
                    if(this.status !== PROMISE_STATUS_PENDING) return 
                    this.status = PROMISE_STATUS_REJECTED
                    this.reason = reason
                    this.onRejectedFns.forEach( fn => {
                        fn(this.reason)
                    })
                })
            }
        }
              
                try {
                    executor(resolve,reject)
                } catch(err)  {
                    reject(err)
                }
    }
    
    then(onFullfilled, onRejected) {
        return new XXPromise( (resolve,reject) => {
            if(this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
                execFunctionWithCatchError(onFUlfilled,this.value, resolve,reject)
            }
           if(this.status === PROMISE_STATUS_REJECTED && onReject) {
               execFunctionWithCatchError(onRejected,this.reason,resolve,reject)
               
           }
     if(this.status === PROMISE_STATUS_PENDING)        {
         this.onFulfilledFns.push( () => {
             execFunctionWithCatchError(onFUlfilled,this.value,resolve,reject)
             this.onRejectedFns.push( () => {
                 execFunctionWithCatchError(onRejected, this.reason,resolve,reject)
             })
         })
     }
        })
    }
}
```

