import {AjaxRequest} from "./knownEnds"
import * as login from "../session/login/index"

export = (req: AjaxRequest<LogoutReq, LogoutRes>) =>{
	req.login.logout()
	delete login.loginCookies[req.login.cookie]
	req.consume({})
}
