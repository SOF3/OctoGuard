import {AjaxRequest, OnError_AR2DB, OnError_AR2GH} from "./knownEnds"
import {db} from "../db/db"
import {gh} from "../gh/api"
import {Profile} from "../profile/Profile"
import ResultSet = db.ResultSet
import QueryArgument = db.QueryArgument

export = (req: AjaxRequest<EditProfileReq, EditProfileRes>) => {
	if(req.args.profileId === undefined){
		req.onError(400, "Missing parameter profileId")
		return
	}
	db.select("SELECT owner, name, visibility FROM profile WHERE profileId = ?", [req.args.profileId], (result: ResultSet<{
		owner: number
		name: string
		visibility: number
	}>) =>{
		if(result.length === 0){
			req.onError(404, "No such profile")
			return
		}
		const row = result[0]
		if(row.owner === req.login.uid){
			proceed(req)
		}else{
			gh.getMembership(row.owner, req.login.name, req.login.token, role=>{
				if(role === gh.OrganizationRole.OWNER){
					proceed(req)
				}else{
					req.onError(401, "You must be an organization owner to edit a profile") // or this is not your repo
				}
			}, OnError_AR2GH(req.onError))
		}
	}, OnError_AR2DB(req.onError))
}

function proceed(req: AjaxRequest<EditProfileReq, EditProfileRes>){
	const updateMap: StringMap<QueryArgument> = {}
	if(req.args.name !== undefined){
		updateMap.name = req.args.name
	}
	if(req.args.visibility !== undefined){
		updateMap.visibility = Profile.visibility_str2num(req.args.visibility)
	}
	db.update("profile", updateMap, "profileId = ?", [req.args.profileId], OnError_AR2DB(req.onError), ()=>req.consume({}))
}
