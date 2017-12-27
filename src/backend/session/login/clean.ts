import {loginCookies} from "./index"
import {db} from "../../db/db"
import {secrets} from "../../secrets"

export function clean(req, res, next){
	for(let cookie in loginCookies){
		if(loginCookies.hasOwnProperty(cookie) && new Date().getTime() - loginCookies[cookie].touch.getTime() > 1800e+3){
			delete loginCookies[cookie]
		}
	}
	next()
}

export function cleanDb(){
	db.del("user_session", "UNIX_TIMESTAMP(NOW(3)) * 1000 - UNIX_TIMESTAMP(touch) * 1000 > ?", [secrets.session.staticDuration], db.reportError)
}
