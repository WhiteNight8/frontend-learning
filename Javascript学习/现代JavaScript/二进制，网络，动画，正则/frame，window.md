## 弹窗和window的方法

弹窗时向用户显示其他文档的古老方法

### 阻止弹窗

如果弹窗时在用户触发的事件程序之外调用的，大多数浏览器都会阻止此类弹窗

### window.open

- url
- name
- params

### 从窗口访问弹窗

只有在窗口时同源时， 窗口才能自由访问彼此的内容

### 从弹窗访问窗口

窗口之间的连接时双向的

### 关闭窗口

close

closed

### 移动和调整大小

- moveBy
- moveTo
- resizeBy
- resize
- onresize

没有最大化和最小化

### 滚动窗口

- scrollBy
- scrollTo
- scrollIntoView

### 弹窗的聚集和失焦

focus

blur

被严格限制使用





### 跨窗口通信

同源策略限制了窗口window和iframe之前的相互访问

### 同源

如果两个URL具有相同的协议，域和端口，则是同源的

- 如果对另外的一个窗口的引用，并且窗口时同源的，那么具有对该窗口的全部访问权限
- 如果不是同源的，则无法访问该窗口的内容：变量，文档等，唯一例外的时location，可以修改但是无法读取

iframe承载了一个单独的嵌入的窗口，具有自己的document和window

### 子域上的window

相同二级域的页面，可以交互

### iframe： 错误文档陷阱

只有整个iframe和它所有资源都加载完成时，iframe.onload才会触发

### 集合： window.frames

- frames
- parent
- top

### sandbox iframes特性

一个空的sandbox特性会施加最严格的限制，但是可以列表出要移除的限制

- allow-same-origin
- allow-top-navigation
- allow-forms
- allow-scripts
- allow-popups

### 跨窗口通信

postMessage接口允许窗口之前相互通信，不论它们来自什么源

- data
- targetOrigin

onmessage

- data
- origin
- source



