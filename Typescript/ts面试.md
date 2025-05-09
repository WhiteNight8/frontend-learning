## 核心概念

### 解释ts中的联合类型和交叉类型，它们的实际应用场景

联合类型常用于函数参数可接受多种类型时，交叉类型长用于对象合并场景

### 什么是ts中的条件类型

使用extend来检查一个类型是否可以赋值给另一个类型，然后根据结果选择不同的类型

```ts
T extends U ? X:Y
```

### 解释ts中infer关键字的用法和应用场景

infer用于条件类型中进行类型推断，可以从泛型类型中提取出具体类型

常用于获取函数返回类型，数组元素类型等

```ts
type ReturnType<T extends (...args:any) => any => T extends (...args:any) => infer R ? R:any

function fetchData() {return {id:1,name:'xia'}}
type FetchResult = ReturnType<typeof FetchData>
```

### 实现一个DeepReadonly类型，使得对象的所有嵌套属性都变为只读

```ts
type DeepReadonly<T> = {
	readonly [P in keyof T]: T[P] extends object 
    ? T[P] extends Function 
    ? T[P] : DeepReadonly<T[P]>:T[P]
}

type User = {
    name:string;
    profile:{
        age:number;
        address:string[]
    }
}

type ReadonlyUser = DeepReadonly<User>
```

### 如何在Typescript中正确定义React组件Props和State类型

```jsx
// 函数组件
interface ButtonProps {
 text: string;
 onClick?: () => void;
 variant?: 'primary' | 'secondary';
 disabled?: boolean;
 children?: React.ReactNode;
 }
 const Button: React.FC<ButtonProps> = ({ text, onClick, variant = 'primary', disabled = 
false, children }) => {
 return (
 <button 
className={`btn btn-${variant}`} 
onClick={onClick} 
disabled={disabled}
 >
 {text}
 {children}
 </button>
 );
 };
 // 使用泛型组件
interface ListProps<T> {
 items: T[];
 renderItem: (item: T) => React.ReactNode;
}
 function List<T>({ items, renderItem }: ListProps<T>) {
 return (
 <ul>
 {items.map((item, index) => (
 <li key={index}>{renderItem(item)}</li>
 ))}
 </ul>
 );
 }
```



### 如何自定义React hooks编写正确的Typescript类型

```tsx
// 带有泛型的自定义 Hook
 function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
 const [storedValue, setStoredValue] = useState<T>(() => {
 try {
 const item = window.localStorage.getItem(key);
 return item ? JSON.parse(item) : initialValue;
 } catch (error) {
 console.error(error);
 return initialValue;
 }
 });
 const setValue = (value: T) => {
 try {
 setStoredValue(value);
 window.localStorage.setItem(key, JSON.stringify(value));
 } catch (error) {
 console.error(error);
 }
 };
 }
 return [storedValue, setValue];
 // 使用例子
const [user, setUser] = useLocalStorage<{id: number; name: string}>('user', { id: 0, 
name: '' })
```



### 如何使用Typescript创建类型安全的React Context

```tsx
// 1. 定义 Context 类型
interface ThemeContextType {
 theme: 'light' | 'dark';
 toggleTheme: () => void;
 }
 // 2. 创建 Context 并提供默认值
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);
 // 3. 创建 Provider 组件
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
 const [theme, setTheme] = useState<'light' | 'dark'>('light');
 const toggleTheme = useCallback(() => {
 setTheme(prev => prev === 'light' ? 'dark' : 'light');
 }, []);
 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
 };
 // 4. 创建自定义 Hook 使用 Context
 export const useTheme = (): ThemeContextType => {
 const context = useContext(ThemeContext);
 if (context === undefined) {
 throw new Error('useTheme must be used within a ThemeProvider');
 }
 return context;
 };
```

