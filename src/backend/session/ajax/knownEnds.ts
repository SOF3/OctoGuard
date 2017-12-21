import {Session} from "../Session"
import {GHErrorHandler} from "../../gh/api";

function _(name: string){
	return require("../../ajax/" + name);
}

export interface ARH<Q extends ReqSuper, S extends ResSuper>{
	(req: AjaxRequest<Q, S>): void;
}

export interface ARErrorHandler{
	(status: number, message: string): void;
}

export function ARErrorHandler2GHErrorHandler(ar: ARErrorHandler): GHErrorHandler{
	return ((message, statusCode) => ar(statusCode >= 400 ? statusCode : 500, message));
}

export class AjaxRequest<Q extends ReqSuper, S extends ResSuper>{
	session: Session;
	args: Q;
	consume: (response: S) => void;
	onError: (status: number, message: string) => void;

	constructor(session: Session, args: Q, consume: (response: S) => void, error: (status: number, message: string) => void){
		this.session = session;
		this.args = args;
		this.consume = consume;
		this.onError = error;
	}
}

export const knownEnds: StringMapping<ARH<any, any>> = {
	listInstalls: <ARH<ListInstallsReq, ListInstallsRes>>_("listInstalls"),
	installDetails: <ARH<InstallDetailsReq, InstallDetailsRes>>_("installDetails"),
};
