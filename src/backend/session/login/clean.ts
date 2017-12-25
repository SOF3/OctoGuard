import {loginCookies} from "./index"

export function clean(req, res, next){
	for(let cookie in loginCookies){
		if(loginCookies.hasOwnProperty(cookie) && new Date().getTime() - loginCookies[cookie].touch.getTime() > 1800e+3){
			delete loginCookies[cookie]
		}
	}
	next()
}
