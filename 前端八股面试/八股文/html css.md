## 什么是SEO，为什么SEO对于一个网站很重要

搜索引擎优化

- 门户网站靠自然搜索结果获取流量
- 使用关键字搜索是尽量提升自然排名，获取更多的流量

## 进行SEO的措施

- SSR服务端渲染
- 准确的TDK描述
- 语义化的HTML元素，图片alt，h1，h2的合理使用
- 编写合理的robots.txt文件
- https
- 内部链接和外部链接



## defer和async属性在script标签中分别有什么作用

浏览器在解析HTML的过程中，遇到script元素是不能继续构建DOM树的

- 停止继续构建，首先下载JavaScript代码，并且执行JavaScript的脚本
- 只有等到JavaScript脚本执行结束后，才会继续解析HTML，构建DOM树

这么做的原因

- JavaScript的作用之一就是操作DOM，并且可以修改DOM
- 如果等到DOM树构建完成并且渲染再执行JavaScript代码，会造成严重的回流的重绘，影响页面的性能

这样带来的问题

- 目前开发模式，脚本比HTML页面更重，处理时间更长
- 造成页面的解析阻塞，在脚本下载执行完成之前，用户在界面上什么都看不到

defer的作用

defer属性告诉浏览器不要等待脚本下载，而继续解析HTML，构建DOM tree

- 脚本由浏览器下载，但是不会阻塞DOM树的构建过程
- 脚本提前下载好了，会等待DOM树构建完成，在DOMContentLoaded事件之前先执行defer中的代码
- 多个带defer的脚本是可以保持正确的顺序执行的，而且推荐放到head元素中，提高页面性能

async的作用

aysnc是让一个脚本的下载和执行是独立的

- 浏览器不会因为async脚本的下载而阻塞
- async脚本会在下载好后立即执行，不能保证在DOMContentLoaded之前还是之后执行，执行时会阻塞DOM树的构建
- async脚本不能保证顺序，他是独立下载，独立运行，不会等待其他脚本

两者的应用场景

- defer通常用于需要在文档解析后操作DOM的JavaScript代码，并且对多个script文件有顺序要求的
- async通常用于独立的脚本，对其他脚本，甚至DOM没有依赖的脚本



