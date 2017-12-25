import {AjaxTokenEntry} from "./AjaxTokenEntry"
import * as router from "./index"

export function clean(req, res, next){
	const now = (new Date).getTime()
	for(const token in router.tokenStore){
		if(router.tokenStore.hasOwnProperty(token)){
			const entry: AjaxTokenEntry = router.tokenStore[token]
			if(now > entry.expiry){
				delete router.tokenStore[token]
			}
		}
	}

	next()
}
