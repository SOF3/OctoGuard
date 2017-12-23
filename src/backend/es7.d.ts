declare interface ObjectConstructor{
	assign<T, U, V, W>(t: T, u: U, v?: V, w?: W);

	values(object: {});
}

declare interface Array<T>{
	fill(t: T);
}
