## 移动商城

使用ref要注意有没有值

return

### 需求： 页面滚动，滚动到一定位置，显示正确的索引

1. 监听滚动的位置： scrollTop

2. 利用scrollTop去匹配正确的位置

3. ```js
   let index = values.length - 1
   
   for(let i =0; i < values.length; i++) {
       const value = values[i]
       if(value>scrollTop) {
   	index = i -1 
           break
       }
   }
   ```

   