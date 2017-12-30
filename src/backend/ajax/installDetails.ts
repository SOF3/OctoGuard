import {AjaxRequest, OnError_AR2DB, OnError_AR2GH} from "./knownEnds"
import * as gh_api from "../gh/api"
import {db} from "../db/db"

export = (req: AjaxRequest<InstallDetailsReq, InstallDetailsRes>) =>{
	if(req.args.installId === undefined){
		req.onError(400, "Missing parameter installId")
		return
	}
	gh_api.getInstallRepos(req.args.installId, req.login.token, (repos: (Repository & {profileId: number})[]) =>{
			db.select(`SELECT rpm.repoId, rpm.profileId FROM repo_profile_map rpm
			INNER JOIN profile p ON rpm.profileId = p.profileId
			WHERE p.owner = ?`, [req.args.orgId], (result: db.ResultSet<{
				repoId: number,
				profileId: number
			}>) =>{
				for(let i = 0; i < repos.length; ++i){
					repos[i].profileId = -1
					for(let j = 0; j < result.length; ++j){
						if(repos[i].id === result[j].repoId){
							repos[i].profileId = result[j].profileId
						}
					}
				}
				req.consume(repos)
			}, OnError_AR2DB(req.onError))
		},
		OnError_AR2GH(req.onError))
}
