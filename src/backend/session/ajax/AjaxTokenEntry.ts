export class AjaxTokenEntry{
	key: string
	creation: number
	expiry: number
	path: string // with a leading slash

	constructor(key: string, path: string, duration: number){
		this.key = key
		this.creation = (new Date).getTime()
		this.expiry = this.creation + duration
		this.path = path
	}
}
