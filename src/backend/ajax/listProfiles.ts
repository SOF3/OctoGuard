import * as gh_api from "../gh/api"
import {AjaxRequest, ARErrorHandler2DbErrorHandler, ARErrorHandler2GhErrorHandler} from "./knownEnds"
import * as db from "../db/db"
import {Profile} from "../profile/Profile"
import {ProfileRule, ProfileRuleTypes} from "../profile/ProfileRule"
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
		profilesQuery.where = profilesQuery.whereArgs = new db.ListWhereClause("owner", uids)

		profilesQuery.execute((profileResultSet: db.ResultSet<DProfile>) =>{
			const profiles: StringMapping<IProfile> = {}
			for(const i in profileResultSet){
				profiles[profileResultSet[i].profileId] = Profile.fromRow(profileResultSet[i])
			}

			let ruleTypesLeft = ProfileRuleTypes.length

			let ownerListClause = new db.ListWhereClause("profile.owner", uids)
			for(const i in ProfileRuleTypes){
				const ruleType = ProfileRuleTypes[i]
				const rulesQuery = new db.SelectQuery()
				rulesQuery.fields = Object.assign({
					ruleId: "rid",
					profileId: "pid",
				}, ruleType.fields)
				rulesQuery.from = "profile_rule"
				rulesQuery.joins = [
					db.Join.INNER_ON("profile", "pid", "profile_owner", "pid"),
					db.Join.INNER(ruleType.table, `${ruleType.table}.rid = profile_rule.rid AND profile_rule.type = ?`),
				]
				rulesQuery.joinArgs = [ruleType.ruleType]
				rulesQuery.where = ownerListClause
				rulesQuery.whereArgs = [ownerListClause]

				rulesQuery.execute((ruleResultSet: db.ResultSet<DProfileRule>) =>{
					for(const j in ruleResultSet){
						const rule: ProfileRule = ruleType.fromRow(ruleResultSet[j])
						profiles[rule.profileId].rules.push(rule)
					}
					ruleTypesLeft--
					if(ruleTypesLeft === 0){
						req.consume({
							installations: installs,
							profiles: profiles,
						})
					}
				}, ARErrorHandler2DbErrorHandler(req.onError))
			}

		}, ARErrorHandler2DbErrorHandler(req.onError))

	}, ARErrorHandler2GhErrorHandler(req.onError))
}
