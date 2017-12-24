import {Session} from "../session/Session"
import {GHErrorHandler} from "../gh/api"
import {DbErrorHandler, reportError} from "../db/db"

function _(name: string){
	return require(`./${name}`)
}

export interface ARH<Q extends ReqSuper, S extends ResSuper>{
	(req: AjaxRequest<Q, S>): void
}

export interface ARErrorHandler{
	(status: number, message: string): void
}

export function ARErrorHandler2GhErrorHandler(ar: ARErrorHandler): GHErrorHandler{
	return ((message, statusCode) => ar(statusCode >= 400 ? statusCode : 500, message))
}
export function ARErrorHandler2DbErrorHandler(ar: ARErrorHandler): DbErrorHandler{
	return (error => {
		reportError(error)
		ar(500, "Internal MySQL error")
	})
}

export class AjaxRequest<Q extends ReqSuper, S extends ResSuper>{
	session: Session
	args: Q
	consume: (response: S) => void
	onError: (status: number, message: string) => void

	constructor(session: Session, args: Q, consume: (response: S) => void, error: (status: number, message: string) => void){
		this.session = session
		this.args = args
		this.consume = consume
		this.onError = error
	}
}

export const knownEnds: StringMapping<ARH<any, any>> = {
	listProfiles: <ARH<ListProfilesReq, ListProfilesRes>>_("listProfiles"),
	installDetails: <ARH<InstallDetailsReq, InstallDetailsRes>>_("installDetails"),
}
