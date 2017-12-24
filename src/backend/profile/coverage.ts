export enum types {
	issue_title,
	issue_body,
	issue_creation,
	issue_comment,
	pr_title,
	pr_body,
	pr_creation,
	pr_comment,
	commit_comment,
	watch,
	star,
	fork
}

export type name = string & keyof types;

export function parse(bitmask: number): name[]{
	const names: name[] = []
	for(let i = 0; bitmask > 0; bitmask >>= 1){
		if((bitmask & 1) === 1){
			names.push(<name> types[i])
		}
	}
	return names
}

export function emit(names: name[]): number{
	let bitmask = 0
	for(const i in names){
		bitmask |= <number> types[names[i]]
	}
	return bitmask
}
