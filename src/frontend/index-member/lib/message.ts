class Message{
	value: string

	emit(...args: string[]): string{
		let ret = this.value
		for(let i = 0; i < args.length; ++i){
			ret = ret.replace(`\${${i}}`, args[i])
		}
		return ret
	}
}

function _(message: string){
	const ret = new Message
	ret.value = message
	return ret
}
