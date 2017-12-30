declare interface ObjectConstructor{
	assign<T>(target: T, ...sources: any[]): T;
}
