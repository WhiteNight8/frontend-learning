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

