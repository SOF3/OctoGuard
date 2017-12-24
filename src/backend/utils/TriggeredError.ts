export class TriggeredError extends Error{
	__proto__: Error
	status: number
	template: string

	constructor(message: string, status: number, template: string = "error"){
		// source: https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
		const trueProto = new.target.prototype
		super(message)
		this.status = status
		this.__proto__ = trueProto
		this.template = template
	}
}
