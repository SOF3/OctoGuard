export function Object_size<T>(object: T){
	let size = 0;
	for(const key in object){
		if(object.hasOwnProperty(key)){
			++size;
		}
	}
	return size;
}
