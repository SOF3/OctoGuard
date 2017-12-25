declare interface StringMap<V>{
	[key: string]: V
}
declare type TypeOrArray<T> = T | T[]

declare interface Extends<T>{
	new(...args): T
}
