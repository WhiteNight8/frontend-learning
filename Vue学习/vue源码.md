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
   ```

   

### 可响应式系统模块

### 应用程序入口