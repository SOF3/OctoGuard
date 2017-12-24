import * as gh_api from "../gh/api"
import {AjaxRequest, ARErrorHandler2DbErrorHandler, ARErrorHandler2GhErrorHandler} from "./knownEnds"
import * as db from "../db/db"
import {ListWhereClause, ResultSet} from "../db/db"
import Installation = GitHubAPI.Installation

export = (req: AjaxRequest<ListProfilesReq, ListProfilesRes>) =>{
	gh_api.listInstalls(req.session.login.token, (installations: Installation[]) =>{
		const installs: StringMapping<Installation> = {}
		const uids: number[] = []
		for(let i = 0; i < installations.length; ++i){
			installs[installations[i].id] = installations[i]
			uids.push(installations[i].account.id)
		}

		const profilesQuery = new db.SelectQuery()
		profilesQuery.fields = {
			profileId: "pid",
			owner: "owner",
			name: "name",
			created: "created",
			updated: "updated",
			visibility: "visibility",
		}
		profilesQuery.from = "profile"
		profilesQuery.where = profilesQuery.whereArgs = new ListWhereClause("owner", uids)
		profilesQuery.execute((result: ResultSet<{
			profileId: number,
			owner: number,
			name: string,
			created: Date,
			updated: Date,
			visibility: number
		}>) =>{
			const profiles: StringMapping<IProfile> = {}


			req.consume({
				installations: installs,
				profiles: profiles,
			})
		}, ARErrorHandler2DbErrorHandler(req.onError))

	}, ARErrorHandler2GhErrorHandler(req.onError))
}
