declare interface StringMapping<V>{
	[key: string]: V
}

declare interface NumberMapping<V>{
	[key: number]: V
}

declare type TypeOrArray<T> = T | T[]