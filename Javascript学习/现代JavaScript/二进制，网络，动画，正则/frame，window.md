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

