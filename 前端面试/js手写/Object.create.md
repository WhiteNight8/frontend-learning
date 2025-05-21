# 实现 Object.create

```js
function myObjectCreate(proto, propertiesObject) {
    if(typeof proto !== 'object' && proto !== null) {
	throw new TypeError('Object prototype may only be an Object or null')
    }
    
    function F(){}
    
    F.prototype = proto
    
    const obj = new F()
    
    if(propertiesObject !== undefined) {
        Object.defineProperties(obj,propertiesObject)
    }
    
    return obj
}
```

