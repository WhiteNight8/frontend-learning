## 虚拟DOM的优势

1. 真实DOM元素操作不方便，例如element的元素的属性非常多，而使用JavaScript抽象Vnode，可以利用js的计算能力
2. 跨平台的能力

## 三大核心系统

1. compiler模块： 编译模板系统
2. renderer模块： 渲染模块
3. reactivity模块： 响应式系统

## miniVue的实现

### 渲染系统模块

主要功能

1. h函数，用于返回一个VNode对象

2. mount函数，用于将VNode挂载到DOM上

3. patch函数，用于对比两个VNode，决定如何处理新的VNode

   ```js
   const h = (tag,props,children) => {
       
       
       return {
           tag,
           props,
           children
       }
   }
   
   const mount =(vnode,container) => {
       const el = vnode.el = document.createElement(vnode.tag)
       
       if(vnode.props) {
           for( const key in vnode.props) {
               const value = vnode.props[key]
               
               if(key.startWith("on")) {
               	el.addEventListener(key.slice(2).toLowerCase(),value)	    
               } else {
               	el.setAttribute(key, value)    
               }
           }
       }
       
       if(vnode.children) {
           if(typeof vnode.children === "string") {
               el.textContent = vnode.children
           } else {
               vnode.chidlren.forEach(item => {
                   mount(item,el)
               })
           }
       }
       
       container.appendChild(el)
   }
   
   const patch = () => {
       if(n1.tag !== n2.tag) {
           const n1ElParent = n1.el.parentElement
           n1ElParent.removeChild(n1.el)
           mount(n2,n1ElaParent)
       } else {
           const el = n2.el = n1.el
           
           const oldProps = n1.props || {}
           const newProps = n2.props || {}
           
           for(const key in newProps) {
               const oldValue = oldProps[key]
               const newValue = newProps[key]
               
               if(newValue !== oldValue) {
                   if(key.startWith('on')) {
                       el.addEventListener(key.slice(2).toLowerCase(),newValue)
                   } else {
                       el.setAttribute(key,value)
                   }
               }
           }
           
           for( const key in oldProps)  {
                 if(!(key in newProps)) {
                   if(key.startWith('on')) {
                       const value = oldProps[key]
                       el.removeEventListener(key.slice(2).toLowerCase(),value)
                   } else {
                       el.removeAttribute(key)
                   }
               }
           }
           
           const oldChildren = n1.children || []
           const newChildren = n2.children || []
           
           if(typeof newChildren === 'string') {
               if(typeof oldChildren === 'string') {
                   if(newChildren !== oldChildren) {
                       el.textContent = newChildren
                   } else {
                       el.innerHTML = newChildren
                   }
               } else {
                   if(typeof oldCHildren === 'string') {
                       el.innerHTML = ""
                       newChildren.forEach( item => {
                           mount(item,el)
                       }) else {
                           const commonLength = Math.min(oldChildren.length, newChildren.length)
                           for(let i = 0; i < commonLength; i++) {
                               patch(oldChildren[i],newChildren[i])
                           }
                           
                           if(newChildren.length > oldChildren.length) {
                               newChildren.slice(oldChildren.length).forEach( item => {
                                   mount(item,el)
                               })
                           }
                           
                           if(newChildren.length < oldChildren.length ) {
                               oldChildren.slice(newChildren.length).forEach( item => {
                                   el.removeChild(item,el)
                               })
                           }
                       }
                   }
               }
           }
   
       }
   }
   ```
   
   

### 可响应式系统模块

```js
class Dep {
    constructor() {
        this.subscribers = new Set()
    }
    
    depend() {
        if(activeEffect) {
            this.subscribers.add(activeEffect)
        }
    }
    
    notify() {
        this.subscribers.forEach( effect => {
            effect()
        })
    }
    
    
}

let activeEffect = null
function watchEffect(effect) {
 	activeEffect = effect
    dep.depend()
    activeEffect = null
}

const targetMap = new WeakMap() 
function getDep(target,key) {
    let depMap = targetMap.get(target)
    if(!depMap) {
        depMap = new Map()
       targetMap.set(target,depsMap) 
    }
    
   let dep = depMap.get(key)
}

function reactive(raw) {
    Object.keys(raw).forEach( key => {
        Object.defineProperty( raw, key, {
		get() {
           dep.depend() 
            return value
        }
            
         set(newValue) {
			value  = newValue
            dep.notify
        }
        })
    })
    return raw
}












```





## 源码学习技巧

1. 整体分析，搞清楚架构设计
2. 先整体后局部，小模块的设计
3. debugger验证思路，学习实现过程

## Vue3的整体架构

1. 编译器
2. 响应式系统
3. 渲染器



