# 移动端 Web 前端

## 项⽬架构设计

移动端 Web 项⽬架构设计需要考虑性能、复杂度和可维护性的平衡，常⻅的架构模式有：

-  MVC 架构：清晰分离数据、视图和控制逻辑

- MVVM 架构：适合现代框架如 Vue 、 React 等 

- 微前端：适合⼤型复杂应⽤的解耦合

### 技术栈选择

- 基础框架： React 、 Vue 、 Angular 或原⽣开发
- UI 组件库： Vant 、 Ant Design Mobile 、 Framework
- 状态管理： Redux 、 Vuex 、 Pinia 或 Context API
- 路由管理： React Router 、 Vue Router
- Webpack 、 Vite 、 Rollup



## 移动端适配

### 视⼝配置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, 
user-scalable=no">
```

适配⽅案

rem 适配⽅案

```js
// rem.js
 (function() {
 function setRootFontSize() {
 const htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
 const htmlDom = document.getElementsByTagName('html')[0];
 htmlDom.style.fontSize = htmlWidth / 10 + 'px';
 }
 window.addEventListener('resize', setRootFontSize);
 setRootFontSize();
 })();
```

vw/vh 适配⽅案

```css
.container {
 width: 100vw;
 height: 100vh;
 }
 .button {
 width: 50vw;
 height: 10vw;
 font-size: 4vw;
 }

```

弹性布局（ Flexbox ）

```css
.flex-container {
 display: flex;
 flex-direction: column;
 justify-content: space-between;
 align-items: center;
 }
```



1px 边框问题

```css
.border-1px {
 position: relative;
 }
 .border-1px::after {
 content: '';
 position: absolute;
 left: 0;
 bottom: 0;
 width: 100%;
 height: 1px;
 background-color: #000;
 transform: scaleY(0.5);
 transform-origin: 0 100%;
 }
```



##   性能优化

资源优化

- 图⽚优化：使⽤ WebP 格式，懒加载，适当压缩
- 字体优化：按需加载，⼦集化
- 代码分割：路由懒加载，组件动态导⼊

渲染优化

- 虚拟列表：处理⼤数据列表渲染

  

  ⻣架屏实现



##   ⽤⼾体验设计

### ⼿势操作

```js
// 简单的滑动检测
function SwipeDetector({ onSwipeLeft, onSwipeRight }) {
 let startX = 0;
 const handleTouchStart = (e) => {
 startX = e.touches[0].clientX;
 };
 const handleTouchEnd = (e) => {
 const endX = e.changedTouches[0].clientX;
 const diff = endX - startX;
 if (diff > 50) {
 onSwipeRight();
 } else if (diff < -50) {
 onSwipeLeft();
 }
 };
 }
 return (
 <div
 onTouchStart={handleTouchStart}
 onTouchEnd={handleTouchEnd}
 >
 {children}
 </div>
 );

```

### 下拉刷新

```js
// 下拉刷新组件
function PullToRefresh({ onRefresh, children }) {
 const [refreshing, setRefreshing] = useState(false);
 const [pullHeight, setPullHeight] = useState(0);
 const refreshThreshold = 60;
 const handleTouchMove = (e) => {
 if (document.documentElement.scrollTop === 0) {
 setPullHeight(e.touches[0].clientY - startY);
 }
 };
 const handleTouchEnd = () => {
 if (pullHeight > refreshThreshold) {
 setRefreshing(true);
 onRefresh().then(() => {
 setRefreshing(false);
 setPullHeight(0);
 });
 } else {
 setPullHeight(0);
 }
 };
 }
 return (
 <div
 onTouchMove={handleTouchMove}
 onTouchEnd={handleTouchEnd}
 >
 <div style={{ height: pullHeight }}>
 {refreshing ? '刷新中...' : '下拉刷新'}
 </div>
 {children}
 </div>
 );
```



⻚⾯过渡动画

```css
.page-enter {
 transform: translateX(100%);
 }
 .page-enter-active {
 transform: translateX(0);
 transition: transform 300ms;
 }
 .page-exit {
transform: translateX(0);
 }
 .page-exit-active {
 transform: translateX(-100%);
 transition: transform 300ms;
 }
```



## 跨平台兼容性

### 设备特性检测

```js
// 设备特性检测工具
const DeviceUtil = {
 isIOS() {
 return /iPhone|iPad|iPod/i.test(navigator.userAgent);
 },
 isAndroid() {
 return /Android/i.test(navigator.userAgent);
 },
 isMobile() {
 return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera 
Mini/i.test(navigator.userAgent);
 },
 supportsWebP() {
 const elem = document.createElement('canvas');
 return elem.getContext && elem.getContext('2d') && 
elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
 }
 };
```



### 安全区域适配

```css
/* iOS安全区域适配 */
 .safe-area-padding {
 padding-top: constant(safe-area-inset-top);
 padding-top: env(safe-area-inset-top);
 padding-bottom: constant(safe-area-inset-bottom);
 padding-bottom: env(safe-area-inset-bottom);
 }
```



###   兼容性问题处理

- CSS 前缀：使⽤ Autoprefixer
- Polyfill ：使⽤ core-js 或 @babel/polyfill



## ⽹络通信与数据处理

###   ⽹络请求封装

```js
// axios封装
import axios from 'axios';
 const request = axios.create({
 baseURL: process.env.API_BASE_URL,
 timeout: 10000
 });
 // 请求拦截器
request.interceptors.request.use(
 config => {
 const token = localStorage.getItem('token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 error => Promise.reject(error)
 );
 // 响应拦截器
request.interceptors.response.use(
 response => {
 const res = response.data;
 if (res.code !== 0) {
 // 处理错误
return Promise.reject(new Error(res.message || 'Error'));
 }
 return res.data;
 },
 error => {
 // 处理网络错误
return Promise.reject(error);
 }
 );
 export default request;

```



离线存储策略

```js
// 离线存储封装
class Storage {
 constructor(type = 'localStorage') {
 this.storage = type === 'localStorage' ? localStorage : sessionStorage;
 }
 set(key, value, expires = 0) {
 const data = {
 value,
 expires: expires ? new Date().getTime() + expires * 1000 : 0
 };
 this.storage.setItem(key, JSON.stringify(data));
 }
 get(key) {
 const data = JSON.parse(this.storage.getItem(key));
 if (!data) return null;
 if (data.expires && data.expires < new Date().getTime()) {
 this.remove(key);
 return null;
 }
 return data.value;
 }
 remove(key) {
 this.storage.removeItem(key);
 }
 }
 clear() {
 this.storage.clear();
 }
 export const localStorage = new Storage('localStorage');
 export const sessionStorage = new Storage('sessionStorage');
```



数据缓存策略

```js
// 数据缓存策略
async function fetchWithCache(key, fetchFn, expireTime = 3600) {
 const cachedData = localStorage.get(key);
 if (cachedData) {
 return cachedData;
 }
 try {
const freshData = await fetchFn();
 localStorage.set(key, freshData, expireTime);
 return freshData;
 } catch (error) {
 console.error('Fetch error:', error);
 throw error;
 }
 }
```



## 安全性设计

XSS 防护

```js
// HTML转义函数
function escapeHTML(str) {
 return str.replace(/[&<>'"]/g, 
tag => ({
 '&': '&amp;',
 '<': '&lt;',
 '>': '&gt;',
 "'": '&#39;',
 '"': '&quot;'
 }[tag]));
 }
 // React中的使用
function Comment({ content }) {
 // React会自动转义内容
return <div>{content}</div>;
 }
 // Vue中的使用
// 在template中使用 v-text 或 {{}} 插值，Vue会自动转义
// 使用 v-html 时需谨慎，确保内容可信
```



 CSRF 防护

```js
// 在请求中添加CSRF token
 function addCSRFToken(config) {
 const csrfToken = document.querySelector('meta[name="csrf
token"]').getAttribute('content');
 config.headers['X-CSRF-Token'] = csrfToken;
 return config;
 }
 // 在axios请求拦截器中使用
axios.interceptors.request.use(addCSRFToken);

```



敏感数据处理

```js
// 敏感数据加密
function encryptData(data, publicKey) {
 // 使用JSEncrypt或其他库进行RSA加密
const encrypt = new JSEncrypt();
 encrypt.setPublicKey(publicKey);
 return encrypt.encrypt(data);
 }
 // 登录示例
async function login(username, password) {
 const encryptedPassword = encryptData(password, PUBLIC_KEY);
 return request.post('/auth/login', {
 username,
 password: encryptedPassword
 });
 }
```





## 视频播放器实现

```js
// 自定义视频播放器组件
function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };
  
  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };
  
  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };
  
  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    videoRef.current.currentTime = seekTime;
  };
  
  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="controls">
        <button onClick={togglePlay}>
          {playing ? '暂停' : '播放'}
        </button>
        
        <div className="progress-bar" onClick={handleSeek}>
          <div 
            className="progress" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
 
          />
        </div>
        
        <div className="time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
 }
 function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 }
```



## 地图定位功能

```js
// 基于高德地图的定位功能
function MapLocation() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    // 初始化地图
    const map = new AMap.Map(mapRef.current, {
      zoom: 13
    });
    
    // 定位
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      buttonOffset: new AMap.Pixel(10, 20),
      zoomToAccuracy: true,
      buttonPosition: 'RB'
    });
    
    map.addControl(geolocation);
    
    geolocation.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        setLocation(result.position);
        // 在地图上添加标记
        new AMap.Marker({
          position: result.position,
          map: map
        });
      } else {
        console.error('定位失败', result);
      }
  });
  }, []);
  
  return (
    <div>
      <div ref={mapRef} style={{ height: '300px' }}></div>
      {location && (
        <div>
          经度: {location.lng}, 纬度: {location.lat}
        </div>
      )}
    </div>
  );
 }
```



## 扫码功能实现

```js
// 基于jsQR的扫码功能
import jsQR from 'jsqr';
 function QRCodeScanner({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  
  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setScanning(true);
      requestAnimationFrame(tick);
    } catch (error) {
      console.error('无法访问相机', error);
    }
  };
  
  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setScanning(false);
    }
  };
  
  const tick = () => {
    if (!scanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
const context = canvas.getContext('2d');
 if (video.readyState === video.HAVE_ENOUGH_DATA) {
 canvas.height = video.videoHeight;
 canvas.width = video.videoWidth;
 context.drawImage(video, 0, 0, canvas.width, canvas.height);
 const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
 const code = jsQR(imageData.data, imageData.width, imageData.height);
 if (code) {
 onScan(code.data);
 stopScan();
 return;
 }
 }
 requestAnimationFrame(tick);
 };
 );
 return (
 <div>
 <video ref={videoRef} style={{ display: 'none' }}></video>
 <canvas ref={canvasRef}></canvas>
 {!scanning ? (
 <button onClick={startScan}>开始扫码</button>
 ) : (
 <button onClick={stopScan}>停止扫码</button>
 )}
 </div>
 }
}
```



## 性能问题诊断



排查步骤

1. 使⽤ Chrome DevTools 的 Performance ⾯板记录运⾏数据
2. 分析 Main 线程的执⾏时间，找出耗时任务
3. 检查渲染过程中的布局重排问题
4.   分析内存使⽤情况，排查内存泄漏

解决⽅案 : 

- 延迟加载⾮关键资源 
- 避免频繁 DOM 操作，使⽤ DocumentFragmen
- 使⽤防抖和节流控制⾼频事件
- 使⽤ Web Worker 处理计算密集型任务

兼容性问题排查

1. 使⽤ BrowserStack 等⼯具在不同设备测试
2. 检查 CSS 前缀兼容性
3. 检查 JS API 兼容性
4. 查阅 Can I Use ⽹站

解决⽅案 : 

- 增加特性检测 
- 使⽤ Polyfill 兼容旧浏览器 
- 针对特定设备提供备选⽅案

内存泄漏排

1. 使⽤ Chrome DevTools 的 Memory ⾯板进⾏堆快照
2. ⽐较多次快照，找出增⻓的对象
3. 分析对象的引⽤关系

常⻅原因及解决⽅案 : 

- 闭包导致的变量引⽤未释放：及时清理不需要的引⽤ 
- 未清理的事件监听：组件卸载时移除事件监听 
- 未清理的定时器：组件卸载时清除定时器
