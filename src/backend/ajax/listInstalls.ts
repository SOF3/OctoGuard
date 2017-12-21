import * as gh_api from "../gh/api"
import {AjaxRequest, ARErrorHandler2GHErrorHandler} from "../session/ajax/knownEnds"
import Installation = GitHubAPI.Installation;

export = (req: AjaxRequest<ListInstallsReq, ListInstallsRes>) =>{
	gh_api.listInstalls(req.session.login.token, (installations: Installation[]) =>{
		const result: ListInstallsRes = {};
		for(let i = 0; i < installations.length; ++i){
			result[installations[i].id] = installations[i];
		}
		req.consume(result);
	}, ARErrorHandler2GHErrorHandler(req.onError));
}
