import {GHErrorHandler} from "../gh/api"
import {db} from "../db/db"
import {Login} from "../session/login/Login"

function _(name: string){
	return require(`./${name}`)
}

export interface ARH<Q extends ReqSuper, S extends ResSuper>{
	(req: AjaxRequest<Q, S>): void
}

export interface ARErrorHandler{
	(status: number, message: string): void
}

export function OnError_AR2GH(ar: ARErrorHandler): GHErrorHandler{
	return ((message, statusCode) => ar(statusCode >= 400 ? statusCode : 500, message))
}

export function OnError_AR2DB(ar: ARErrorHandler): db.ErrorHandler{
	return (error => {
		db.reportError(error)
		ar(500, "Internal MySQL error")
	})
}

export class AjaxRequest<Q extends ReqSuper, S extends ResSuper>{
	login: Login
	args: Q
	consume: (response: S) => void
	onError: ARErrorHandler

	constructor(login: Login, args: Q, consume: (response: S) => void, error: (status: number, message: string) => void){
		this.login = login
		this.args = args
		this.consume = consume
		this.onError = error
	}
}

export const knownEnds: StringMap<ARH<any, any>> = {
	listProfiles: <ARH<ListProfilesReq, ListProfilesRes>>_("listProfiles"),
	installDetails: <ARH<InstallDetailsReq, InstallDetailsRes>>_("installDetails"),
	logout: <ARH<LogoutReq, LogoutRes>>_("logout")
}
