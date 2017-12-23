declare interface ObjectConstructor{
	assign<T, U, V>(t: T, u: U, v: V);

	values(object: {});
}

declare interface Array<T>{
	fill(t: T);
}
