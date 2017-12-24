import {AjaxRequest, ARErrorHandler2GhErrorHandler} from "./knownEnds"
import * as gh_api from "../gh/api"

export = (req: AjaxRequest<InstallDetailsReq, InstallDetailsRes>) =>{
	gh_api.getInstallRepos(req.args.installId, req.session.login.token, req.consume,
		ARErrorHandler2GhErrorHandler(req.onError))
}
