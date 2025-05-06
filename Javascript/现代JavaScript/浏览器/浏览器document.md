## 浏览器环境，规格

浏览器运行时的鸟瞰图

![image-20241220094732740](C:/Users/27019/AppData/Roaming/Typora/typora-user-images/image-20241220094732740.png)

### 文档对象类型 DOM

文档对象模型，将所有页面内容表示为可以修改的对象

document对象时页面的主要入口点



### 浏览器对象模型 BOM

浏览器对象模型， 由浏览器提供用于处理文档之外的所有内容的其他对象

- navigator
- location



## DOM树

- 标签
- 文本

## 遍历DOM

对DOM的所有操作都是以document对象开始的

![image-20250422101147777](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250422101147777.png)

### 在最顶层： documentElement和body

document.body的值可能是null，脚本无法访问在运行时不存在的元素

### 子节点：childNodes,firstChild, lastChild

childNodes集合列出所有子节点，包括文本节点

### DOM集合

childNodes是一个集合，一个类数组的可迭代对象

DOM集合是只读的

DOM集合是实时的

不要使用for in来遍历集合



### 兄弟节点和父节点

nextSibling

previousSibling

parentNode



### 纯导航元素

加上Element

### 表格



## 搜索： getElement*，querySelector*

获取页面任意元素

### document.getElementById或者只使用id

不要使用以id命名的全局变量来访问元素

id必须是唯一的

只有document.getElementById

### querySelectAll

也可以使用伪类

### querySelector

返回第一个

### matches

true，是否匹配

### closest

最近的祖先

### getElementBy*

- getElementByTagName
- getElementByClassName
- getElementsByName

返回的是一个集合，不是一个元素

### 实时的集合

所有getElementBy*返回一个实时的集合

querySelectorAll返回的是一个静态的集合



## 节点属性：type，tag，content

### DOM节点类

- EventTarget
- Node
- Document
- CharacterData
- Element
- HTMLElement

### nodeType属性

数值

### 标签：nodeName和tagName

标签名始终是大写的

### innerHtml：内容

脚本不会执行

### inner HTML+= 会进行完全重写

### outerHTML：元素完整HTML

在DOM中替换，不会改变元素

### nodeValue/data：文本节点内容

### textContent：纯文本

### hidden属性



## 特性和属性

### DOM属性

### HTML特性

### 属性-特性同步

### DOM属性是多类型的

### 非标砖的特性，dataset



## 修改文档

DOM修改时创建实时页面的关键

### 创建一个元素

- createElement
- createTextNode

### 创建一条消息

### 插入方法

- append
- prepend
- before
- after
- replaceWith

### insertAdjacentHTML/Text/Element

### 节点移除

### 克隆节点：cloneNode

### DocumentFragment

用来传递节点的包装器

### 老式insert/remove方法



## 样式和类

- 在css中创建一个类
- 将属性直接写入style

### className和classList

### 元素样式

### 重置样式属性

### 注意单位

### 计算样式：getComputedStyle

- 需要完整的属性名
- 应用于：：visited链接的样式被隐藏了



## 元素大小和滚动

注意滚动条

### 几何

![image-20250505110403358](https://raw.githubusercontent.com/JoeyXXia/MyPictureData/main/image-20250505110403358.png)

### offsetParent，offsetLeft/Top

### offsetWidth/Height

### clientTop/Left

### clientWidth/Height

### scrollWidth/Height

### scrollLeft/scrollTop



### 不要从CSS中获取width/height



## Window大小和滚动

### 窗口的width/height

- document.documentElement.clientWidth
- document.documentElement.clientHeight

### 文档的wdth/height

### 获取当前滚动

### 滚动：scrollTo，scrollBy，scrollIntoView

### 禁止滚动



## 坐标

- 相对于窗口
- 相对于文档



### 元素坐标：getBoundingClientRect

### elementFromPoint（x，y）

### 用于fixed定位

### 文档坐标







