import {Session} from "../Session"
import * as random from "random-strings"

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

	public static create(session: Session, path: string, duration: number = 10e+3): AjaxTokenEntry{
		let key
		do{
			key = random.alphaNumMixed(20)
		}while(session.ajaxTokens[key] !== undefined)
		const entry = new AjaxTokenEntry(key, path, duration)
		session.ajaxTokens[key] = entry
		return entry
	}
}
