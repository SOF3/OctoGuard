import {Session} from "../Session"
import {AjaxTokenEntry} from "./AjaxTokenEntry"
import {Login} from "../Login"

export function clean(req, res, next){
	const session: Session = req.session
	if(session.ajaxTokens === undefined){
		session.ajaxTokens = {}
	}else{
		const now = (new Date).getTime()
		for(const token in session.ajaxTokens){
			if(session.ajaxTokens.hasOwnProperty(token)){
				const entry: Object & AjaxTokenEntry = session.ajaxTokens[token]
				if(now > entry.expiry){
					delete session.ajaxTokens[token]
				}
			}
		}
	}
	if(session.login === undefined){
		session.login = new Login
	}
	next()
}
