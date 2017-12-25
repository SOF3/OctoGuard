import {AjaxRequest, OnError_AR2GH} from "./knownEnds"
import * as gh_api from "../gh/api"

export = (req: AjaxRequest<InstallDetailsReq, InstallDetailsRes>) =>{
	gh_api.getInstallRepos(req.args.installId, req.login.token, req.consume,
		OnError_AR2GH(req.onError))
}
