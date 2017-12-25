import * as gh_api from "../gh/api"
import {AjaxRequest, OnError_AR2DB, OnError_AR2GH} from "./knownEnds"
import {db} from "../db/db"
import {Profile} from "../profile/Profile"
import {ProfileRule, ProfileRuleTypes} from "../profile/ProfileRule"
import {Object_size} from "../utils/helper"
import {Login} from "../session/login/Login"
import Installation = GitHubAPI.Installation

export = (req: AjaxRequest<ListProfilesReq, ListProfilesRes>) =>{
	const onError = OnError_AR2DB(req.onError)

	gh_api.listInstalls(req.login.token, (installations: Installation[]) =>{
		const installs: StringMap<Installation> = {}
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
		profilesQuery.execute((result: db.ResultSet<DProfile>) => onProfileListed(result, req.consume, uids, installs, onError, req.login), onError)
	}, OnError_AR2GH(req.onError))
}

function onProfileListed(profileResultSet: db.ResultSet<DProfile>, consume: Function, uids: number[], installs: StringMap<Installation>, onError: db.DBErrorHandler, login: Login){
	const profiles: StringMap<IProfile> = {}
	for(const i in profileResultSet){
		profiles[profileResultSet[i].profileId] = Profile.fromRow(profileResultSet[i])
	}

	let ruleTypesLeft = ProfileRuleTypes.length

	let ownerListClause = new db.ListWhereClause("profile.owner", uids)
	for(const i in ProfileRuleTypes){
		const ruleType = ProfileRuleTypes[i]
		const rulesQuery = new db.SelectQuery()
		rulesQuery.fields = Object.assign({
			ruleId: "profile_rule.rid",
			profileId: "profile_rule.pid",
		}, ruleType.fields)
		rulesQuery.from = "profile_rule"
		rulesQuery.joins = [
			db.Join.INNER_ON("profile", "pid", "profile_rule", "pid"),
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
				sendResult(consume, installs, profiles, login)
			}
		}, onError)
	}
}

function sendResult(consume: Function, installs: StringMap<Installation>, profiles: StringMap<IProfile>, login: Login){
	for(const installId in installs){
		const install: Installation & {profiles?: StringMap<IProfile>} = installs[installId]
		const orgProfiles = install.profiles = {} as StringMap<IProfile>
		for(const profileId in profiles){
			const profile: IProfile = profiles[profileId]
			if(profile.owner === install.account.id){
				orgProfiles[profile.profileId] = profile
			}
		}
		if(Object_size(orgProfiles) === 0){
			orgProfiles[-1] = Profile.defaultProfile(install.account.id, login.regDate)
		}
	}
	consume({installations: installs})
}
