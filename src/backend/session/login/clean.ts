import {loginCookies} from "./index"
import {db} from "../../db/db"

export function clean(req, res, next){
	for(let cookie in loginCookies){
		if(loginCookies.hasOwnProperty(cookie) && new Date().getTime() - loginCookies[cookie].touch.getTime() > 1800e+3){
			delete loginCookies[cookie]
		}
	}
	next()
}

export function cleanDb(){
	db.del("user_session", "UNIX_TIMESTAMP() - UNIX_TIMESTAMP(touch) > 604800", [], db.reportError)
}
