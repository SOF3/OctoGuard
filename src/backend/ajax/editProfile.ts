import {AjaxRequest, OnError_AR2DB} from "./knownEnds"
import {db} from "../db/db"
import ResultSet = db.ResultSet

export = (req: AjaxRequest<EditProfileReq, EditProfileRes>) => {
	if(req.args.profileId === undefined){
		req.onError(400, "Missing parameter profileId")
		return
	}
	db.select("SELECT name, visibility, owner FROM profile WHERE profileId = ?", [req.args.profileId], (result: ResultSet<{
		owner: number
		name: string
		visibility: number
	}>) =>{
		
	}, OnError_AR2DB(req.onError))
}
