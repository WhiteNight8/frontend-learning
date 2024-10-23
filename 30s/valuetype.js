//value is undefined

const isUndefined = (val) => val === undefined

// value is null
const isNull = (val) => val === null

// value is nil
const isNil = (val) => val === undefined || val === null

//value is boolean
const isBoolean = (val) => typeof val === "boolean"

// value is number
const isNumber = (val) => typeof val === "number" && !Number.isNaN(val)

//value is bigint
const isBigInt = (val) => typeof val === "bigint"

//value is string
const isString = (val) => typeof val === "string"

// value is symbol
const isSymbol = (val) => typeof val === "symbol"

// value is primitive
const isPrimitive = (val) => Object(val) !== val

// value is object
const isObject = (obj) => obj === Object(obj)

// value is function
const isFunction = (val) => typeof val === "function"

// value is plain object
const isPlainObject = (val) =>
  !!val && typeof val === "object" && val.constructor === Object

// value is async function
const isAsyncFunction = (val) =>
  Object.prototype.toString.call(val) === "[object AsyncFunction]"

// value is generator function
const isGeneratorFunction = (val) =>
  Object.prototype.toString.call(val) === "[object GeneratorFunction]"

// type of value
const getType = (v) =>
  v === undefined ? "undefined" : v === null ? "null" : v.constructor.name

// check if value is of type
const isOfType = (type, val) =>
  ([undefined, null].includes(val) && val === type) ||
  v.constructor.name === type
