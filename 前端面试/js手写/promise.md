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

catch,finally方法, 类方法resovle, reject

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

function execFunctionWithCatchError(execFn,value,resolve,reject) {
    try {
        const result = execFn(value)
        resolve(result)
    }catch(err) {
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
        
        const resolve = (reason) => {
         	if(this.status === PROMISE_STATUS_PENDING)    {
                queueMicrotaks ( () => {
                if(this.staus !== PROMISE_STATUS_PENDING) return 
                this.status = PROMISE_STATUS_FULFILLED
                this.value = value
                this.onFulfiiledFns.forEach( fn => {
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
                this.reason = reaon
                this.onRejectedFns.forEach( fn => {
                    fn(this.reason)
                })
            })       
            }
        }
        
        try {
        executor(resolve,reject)
        } catch(err) {
            reject(err)
        }
    }
    
    then(onFulfilled,onRejected) { 
        const defaultOnRejected = err => { throw err}
        onRejected = onRejected || defaultOnRejected
        
        return new XXPromise( (resolve,reject) => {
            if(this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
                execFunctionWithCatchError(onFulfilled,this.value,resovle,reject)
            }
            if(this.status === PROMISE_STATUS_REJECTED && onRejected) {
                execFunctionWithCatchError（onRejected,this.reason,resolve,reject)
            }
            
            if(this.status === PROMISE_STATUS_PENDING) {
                if(onFufilled) this.onFulfilledFns.push( () => {
                    execFunctionWithCatchError(onFulfilled,this.value,resovle,reject)
                })
                if(onRejected) this.onRejectedFns.push( () => {
                    execFunctionWithCatchError(onRejected,this.reason,resolve, reject)
                })
            }
        })
    }
    
    catch(onRejected) {
        this.then(undefined,onRejected)
    }
    
    finally(onFinally) {
    this.then( () => {
        onFinally()
    }, () => {
        onFinally()
    })    
    }
    
    static resovle(value){
        return new XXPromise( (resolve) => resovle(value))
    }
    
    static reject(reason) {
        return new XXPromise( (resolve,reject) => reject(reason))
    }
    
    
}
```



all allSettled方法

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

function execFunctionWithCatchError(execFn, value, resolve,reject) {
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
        
        const resolve =(value) => {
            if(this.status === PROMISE_STATUS_PENDING) {
                queueMicrotask( () => {
                    if(this.status !== PROMISE_STATUS_PENDING) return 
                    this.status = PROMISE_STATUS_FULFILLED
                    this.value = value
                    this.onFulfilledFns.forEach( fn => {
                        fn(this.value)
                    })
                })
            }
        }
        
        const reject = (reason) => {
            if(this.status === PROMISE_STATUS_PENDING){
                queueMicrotask( () => {
                    if(this.status !== PROMISE_STATUS_PENDING) return 
                    this.status = PROMISE_STATUS_REREJCTED
                    this.reaon = reason
                    this.onRejectedFns.forEach(fn => {
                        fn(this.reason)
                    })
                })
            }
            
        }
        
        try {
            executor(resolve,reject)
        } catch(err) {
            reject(err)
        }
    }
    
    then(onFulfilled,onRejected) {
        const defaultOnRejected = err => { throw err}
        onRejected = onRejected || defaultOnRejected
        
        const defaultOnFulfilled = value => { return value}
        onFulfilled = onFulfilled || defaultOnFulfilled
        
        return new XXPromise( (resolve,reject) => {
            if(this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
                execFunctionWithCatchError(onFulfilled, this.value,resovle, reject)
            }
            if(this.status === PROMISE_STATUS_REJECTED && onRejected) {
                execFunctionWithCatchError(onRejected,this.reason,resolve,reject)
            }
            
            if(this.status === PROMISE_STATUS_PENDING) {
                if(onFulfilled) this.onFulfilledFns.push( () => {
                    execFunctionWithCatchError(onFulfilled, this.value,resolve,reject)
                })
                if(onRejected) this.onRejectedFns.push( () => {
                    execFunctionWithCatchError(onRejected,this.reason,resolve,reject)
                })
            }
        })
    }
    
    catch(onRejected) {
        return this.then(undefined,onRejected)
    }
    
    finally(onFinally) {
        this.then( () => {
            onFinally()
        }, () => {
            onFinally()
        })
    }
    
    static resolve(value) {
        return new XXPromise( (resolve) => resolve(value))
    }
    static reject(reason) {
        return new XXPromise((resolve,reject) => reject(reason))
    }
    
    static all(promises) {
        return new XXPromise(( resolve,reject) => {
            const values = []
            promises.forEach( promise => {
                promise.then( res => {
                    values.push(res)
                    if(values.length === promises.length) {
                        resolve(values)
                    }
                }, err => {
                    reject(err)
                })
            })
        })
    }
    
    static allSettled(promises) {
        return new XXPromise( (resolve) => {
            const results = []
            promises.forEach( promise => {
                promise.then( res => {
                    results.push({ status:PROMISE_STATUS_FULFILLED,value:res})
                    if(results.length === promises.length) {
                        resolve(results)
                    }
                })
            })
        }, err => {
            results.push({status:PROMISE_STATUS_REJECTED,value:err})
            if(results.length === promises.length) {
                resolve(results)
            }
        })
    }
    
    static any(promises) {
        const reasons =[] 
        return new XXPromise( (ressolve,reject) => {
            promises.forEach( promise => {
                promise.then( resolve,err => {
                    reasons.push(err)
                    if(reasons.length === promises.length) {
                        reject(new AggregateError(reasons))
                    }
                })
            })
        })
    }
    
    static race(promises) {
        return new XXPromise( (resolve,reject) => {
            promises.forEach(promise => {
                promise.then(resolve,reject)
            })
        })
    }
}
```























